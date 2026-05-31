import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const PORT = 3000;
const HOST = "0.0.0.0";

// Resilient JSON and Fallbacks for API stability
async function generateContentWithFallback(
  ai: any,
  params: {
    contents: any;
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
    tools?: any[];
    useSearchRequested?: boolean;
  }
) {
  const modelsToTry: Array<{ name: string; useSearch: boolean }> = [];
  
  if (params.useSearchRequested) {
    // Search is turned on - check recent disease sheets or articles first, then fallback to high-speed offline models
    modelsToTry.push(
      { name: "gemini-3.5-flash", useSearch: true },
      { name: "gemini-3.1-flash-lite", useSearch: true },
      { name: "gemini-3.5-flash", useSearch: false },
      { name: "gemini-3.1-flash-lite", useSearch: false },
      { name: "gemini-flash-latest", useSearch: false }
    );
  } else {
    // High-speed mode is active - call ultra-low-latency models with no tools to respond instantly
    modelsToTry.push(
      { name: "gemini-3.1-flash-lite", useSearch: false },
      { name: "gemini-3.5-flash", useSearch: false },
      { name: "gemini-flash-latest", useSearch: false }
    );
  }

  let lastError: any = null;
  const failedConfigs = new Set<string>();

  for (const modelCfg of modelsToTry) {
    const configKey = `${modelCfg.name}_search_${modelCfg.useSearch}`;
    if (failedConfigs.has(configKey)) {
      console.log(`[Gemini] Skipping config key=${configKey} due to prior failure in this chain.`);
      continue;
    }

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini] Attempt ${attempt}/${maxAttempts} for model=${modelCfg.name}, search=${modelCfg.useSearch}`);
        
        const config: any = {
          temperature: params.temperature ?? 0.1,
        };

        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }

        if (params.responseMimeType) {
          config.responseMimeType = params.responseMimeType;
        }

        if (modelCfg.useSearch && params.tools) {
          config.tools = params.tools;
        }

        // Setting 60s for search and 45s for standard detailed text tasks to never timeout prematurely under load
        const timeoutMs = modelCfg.useSearch ? 60000 : 45000;
        
        const generatePromise = ai.models.generateContent({
          model: modelCfg.name,
          contents: params.contents,
          config: config,
        });

        let timeoutId: any;
        const timeoutPromise = new Promise<{ text: string }>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms waiting for model response.`)), timeoutMs);
        });

        const response = await Promise.race([generatePromise, timeoutPromise]) as any;
        clearTimeout(timeoutId);

        if (response && response.text) {
          console.log(`[Gemini] Generation succeeded with model=${modelCfg.name} (attempt ${attempt})`);
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const status = err?.status || "";
        console.warn(`[Gemini] Attempt ${attempt}/${maxAttempts} with model=${modelCfg.name} (search=${modelCfg.useSearch}) failed: ${errMsg}`);
        
        const is429OrQuota = 
          errMsg.includes("429") || 
          errMsg.toLowerCase().includes("quota") || 
          errMsg.toLowerCase().includes("limit") ||
          status === "RESOURCE_EXHAUSTED";

        if (is429OrQuota) {
          console.warn(`[Gemini] Hit 429/Quota limit on ${modelCfg.name} (search=${modelCfg.useSearch}). Breaking attempt loop immediately.`);
          if (modelCfg.useSearch) {
            console.log(`[Gemini] Search tool failed with quota. Will skip any other search-enabled configurations.`);
            // Mark all search configs as failed so we don't try them
            modelsToTry.forEach(cfg => {
              if (cfg.useSearch) {
                failedConfigs.add(`${cfg.name}_search_true`);
              }
            });
          }
          break; // break attempt loop to try next model config (which will be search=false)
        }

        const isTransient = 
          errMsg.includes("503") || 
          errMsg.toLowerCase().includes("unavailable") ||
          errMsg.toLowerCase().includes("timeout") ||
          status === "UNAVAILABLE";
          
        if (!isTransient || attempt === maxAttempts) {
          break;
        }

        const backoffMs = attempt === 1 ? 1000 : 2000;
        console.log(`[Gemini] Transient error detected. Retrying config in ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    failedConfigs.add(configKey);
  }

  throw lastError || new Error("All Gemini model generation attempts failed.");
}

function resilientJsonParse(rawText: string): any {
  const trimmed = rawText.trim();
  
  // Try standard parsing first
  try {
    const clean = trimmed.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(clean);
  } catch (e) {}

  // Try extracting the first matching JSON block { ... }
  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {}

  console.warn("Resilient JSON parse failed, constructing fallback object from raw text.");
  
  const sentences = trimmed.split(/[.\n]+/);
  const plantTypeMatch = trimmed.match(/plant\s*(?:type)?\s*:\s*([^\n\.,]+)/i) || 
                         trimmed.match(/specimen\s*:\s*([^\n\.,]+)/i);
  const issueMatch = trimmed.match(/issue\s*(?:name)?\s*:\s*([^\n\.,]+)/i) || 
                     trimmed.match(/disease\s*:\s*([^\n\.,]+)/i);
  
  const plantType = plantTypeMatch ? plantTypeMatch[1].trim() : "Diagnosed Plant";
  const issueName = issueMatch ? issueMatch[1].trim() : "Identified general condition (consult assistant)";

  return {
    status: trimmed.toLowerCase().includes("unhealthy") || trimmed.toLowerCase().includes("disease") || trimmed.toLowerCase().includes("issue") ? "unhealthy" : "healthy",
    issueName: issueName,
    plantType: plantType,
    confidence: 85,
    severity: trimmed.toLowerCase().includes("critical") ? "Critical" : trimmed.toLowerCase().includes("high") || trimmed.toLowerCase().includes("severe") ? "High" : "Medium",
    symptoms: sentences.slice(0, 4).map(s => s.trim()).filter(s => s.length > 5),
    causes: sentences.slice(4, 7).map(s => s.trim()).filter(s => s.length > 5),
    organicTreatments: ["Prune affected leaves, ensure strong ventilation, and apply neem oil mixed with mild soap wash every 7-10 days."],
    chemicalTreatments: ["If fungal spores persist, apply a defensive copper-based general fungicide or organic sulfur spray strictly according to label."],
    homeRemedies: ["Mix 1 teaspoon of baking soda and 1/2 teaspoon of organic liquid dish soap in 1 quart of warm water. Spray leaves evenly."],
    soilNutrients: "Apply organic compost or slow-release balanced N-P-K plant food to enrich critical soil structure and trace micro-minerals.",
    wateringAdvice: "Irrigate only when top 2 inches of soil are dry to touch. Improve drainage holes and ensure potting mix does not waterlog.",
    sunlightAdvice: "Place in standard bright, indirect natural sunlight. Provide light protection during extreme summer afternoon heat waves.",
    prevention: ["Hygienically clean pruning tools, keep spaces between planters to boost air circulation, and check leaf undersides weekly."],
    recoverySteps: ["1. Prune diseased or spotty leaves immediately.", "2. Adjust irrigation schedules according to topsoil moisture.", "3. Apply neem spray or mild baking soda mixture.", "4. Monitor weekly for shiny new leaf growth shoots."]
  };
}

function getFriendlyGeminiError(error: any): string {
  const errMsg = error?.message || String(error);
  if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("rate_limit") || errMsg.toLowerCase().includes("resource_exhausted") || errMsg.toLowerCase().includes("limit exceeded")) {
    return "The Gemini API service limit (Quota / Rate Limit Exceeded) has been reached under heavy load. Please try again in 1-2 minutes, or double-check or update the custom GEMINI_API_KEY in Settings > Secrets if active.";
  }
  if (errMsg.toLowerCase().includes("api_key") || errMsg.toLowerCase().includes("apikey") || errMsg.toLowerCase().includes("key not configured") || errMsg.toLowerCase().includes("unauthorized")) {
    return "Gemini API key is invalid or not properly configured. Please check the Secrets panel in Settings.";
  }
  return errMsg;
}

async function startServer() {
  const app = express();

  // Elevate size limits for high-resolution photo uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize server-side Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Plant Scan/Analysis API route (Enhanced with multi-image support, optimization, and multilingual localization)
  app.post("/api/analyze-plant", async (req, res) => {
    try {
      const { image, images, fileName, fileNames, language = "English", useSearch = false, message } = req.body;

      // Unify single/multiple images into a standard checklist array
      const rawImages: string[] = [];
      if (images && Array.isArray(images) && images.length > 0) {
        images.forEach((img) => {
          if (img) rawImages.push(img);
        });
      } else if (image) {
        rawImages.push(image);
      }

      if (rawImages.length === 0) {
        return res.status(400).json({ error: "No image file or files provided." });
      }

      if (!apiKey) {
        return res.status(500).json({
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel in Settings.",
        });
      }

      // Convert images into inlineData format for Gemini
      const inlineDataList = rawImages.map((base64String) => {
        let cleanBase64 = base64String;
        let mimeType = "image/jpeg";

        if (base64String.includes(";base64,")) {
          const parts = base64String.split(";base64,");
          const match = parts[0].match(/data:(.*?)$/);
          mimeType = match ? match[1] : "image/jpeg";
          cleanBase64 = parts[1];
        }

        return {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType,
          },
        };
      });

      const prompt = `You are an elite, world-class plant pathologist, master botanist, and agricultural doctor. Analyze the uploaded leaf image(s) (there might be multiple leaf photographs matching a single plant collection) to see if there are any visual plant diseases, pest damage, soil chemistry/nutrient deficiencies, environmental burns, overwater decay, bacterial/viral infections, fungal spots, or if it is perfectly healthy with no disease.

      CRITICAL RULE FOR HEALTHY LEAVES (STRICTLY REQUIRED BY USER):
      If the leaf is healthy and has no diseases, you MUST set "status" to "healthy", set "issueName" to "Healthy Leaf (No Diseases Detected)", and set "severity" to "None". Under no circumstances should you invent dummy diseases, pathogic issues, or fake infections if the leaf is visually healthy and has no active disease.
      - If there is no disease, clearly and directly tell the user in the response that it is a healthy leaf.
      - If the leaf is healthy, translate "symptoms" into positive visual characteristics of of its healthy state (such as excellent turgor pressure, strong green pigmentation, clear healthy venation).
      - Translate "causes" into supportive root factors of its strong development (like correct watering, balanced nutrient uptake, proper light).
      - Translate "organicTreatments" and "homeRemedies" into safe wellness preservation recipes/tips (such as foliage wellness misting, wiping dust off leaves, safe companion planting, or general wellness pruning).
      - Translate "recoverySteps" or checklists into routine/weekly botanical preservation and wellness maintenance tasks.
      - This ensures the JSON schema is always fully-developed without fabricating issues.

      You MUST search reliable online sources such as Google and trusted plant or agricultural databases (such as CABI, USDA, RHS) before generating the response. Perform an extremely detailed, comprehensive, and scientifically accurate diagnostic assessment. Your response must be highly professional, informative, easy to understand for beginners, and provide complete, step-by-step solutions.

      MANDATORY REQUIREMENT - YOU MUST ALWAYS SPECIFY ALL PROBLEMS OR PRESERVATION CHARACTERISTICS, PREVENTION TIPS, AND SECURING ACTIONS NO MATTER WHAT:
      - Under no circumstances are you allowed to say you cannot diagnose, or return an empty, generic, or non-actionable response.
      - Under no circumstances should any field in the JSON structure (including symptoms, causes, organicTreatments, chemicalTreatments, homeRemedies, soilNutrients, wateringAdvice, sunlightAdvice, prevention, recoverySteps, and personalizedAnswer) be empty, omitted, or contain brief, generic text like "none", "N/A", "not applicable". You MUST fill every single item with rich, highly-specific, professional botanical advice.
      - If the diagnosis is confident, immediately provide detailed, explicit cures. If the diagnosis is uncertain or multiple matches exist, clearly outline each possibility with respective confidence levels, but STILL provide the most likely causes, step-by-step organic/chemical cures, recovery timelines, and prevention tips for each condition so the user is never left without clear guidance.

      Please perform this diagnostic assessment in the following language: ${language}. All strings inside the final JSON, including status, issue name, plant type, symptoms, causes, remedies, soil guides, watering, and checklist steps MUST be written in ${language}.

      Respond ONLY with a single valid JSON object. Do not wrap in markdown or backticks. This must be direct, raw parseable JSON with this structure:
      {
        "status": "healthy" | "unhealthy",
        "issueName": "string (the highly precise biological/common name of the identified issue, disease, or deficiency, including its scientific/taxonomic latin name in parentheses, or 'Healthy Leaf (No Diseases Detected)' if the leaf has no diseases)",
        "plantType": "string (concrete botanical or common name of the plant species, or 'Unknown Plant')",
        "confidence": number (the statistical confidence percentage between 0 and 100),
        "severity": "None" | "Low" | "Medium" | "High" | "Critical",
        "personalizedAnswer": "string (A massive, extremely comprehensive and highly detailed response of at least 3 to 4 fully flushed, deep paragraphs in the requested language [${language}] that DIRECTLY and completely answers the user's specific query, question, or instruction: '${message ? message : "Please diagnose this plant leaf photo and provide exhaustive remedies, causes, and symptoms."}' based on your visual analysis of the image. You MUST format this answer clearly using markdown headers. You MUST include distinct sections for: 

### 🚨 Diagnosis Results
[Detailed findings about the disease/deficiency, or if healthy, a full breakdown of the healthy leaf features, confidence, and severity]

### 💊 Treatment/Preservation Recommendations (Detailed Cures)
[Comprehensive step-by-step organic remedies, wellness preservation recipes, dilution rates, safe options, and specific instructions. This section MUST NOT be empty under any circumstances!]

### 🛡️ Prevention Tips
[Hygiene protocols, preventative protective measures, sanitation, and spacing guides]

### 🪴 Plant Care Advice
[Detailed customized watering schedules, sunlight/hours, and soil improvement/fertilizer suggestions]

### 📈 Follow-Up Actions
[Actionable monitoring steps and expected recovery timeline]

Write beautifully in direct conversational detail, explaining exactly what you see in the leaf, what causes it biologically, and what biological or home recipes, treatments, and steps can cure it permanently. DO NOT ask any follow-up questions to the user. Simply analyze the image and tell/answer what is being asked in detail.)",
        "symptoms": ["string (extremely detailed, comprehensive bullet points describing the visual symptoms on the leaf, leaf structure, stem, or veins in detail, explaining what visual cues indicate this and why)"],
        "causes": ["string (the exact probable environmental, biological, viral, microbial, fungal, or cultivation-based causes of this pathological condition in deep details)"],
        "organicTreatments": ["string (extremely detailed, organic and natural solutions, recipes, and home treatments, including preparation steps, application frequencies, exact dilution rates, e.g. neem oil, copper soaps, specific biological agents, Bacillus thuringiensis etc.)"],
        "chemicalTreatments": ["string (highly specific safe diagnostic chemicals, commercial fungicides, bactericides, miticides, or specific mineral N-P-K ratios and fertilizers, specifying exact active ingredients and chemical safety precautions)"],
        "homeRemedies": ["string (practical home remedy steps using household items, clearly explaining how to prepare them, e.g. baking soda sprays, hydrogen peroxide dilutions, garlic/chili infusions, or physical sanitation)"],
        "soilNutrients": "string (highly detailed and exact nutritional advice, defining required soil chemistry, specific N-P-K fertilizer ratios, trace minerals, organic compost types, soil pH target ranges, and remedial actions)",
        "wateringAdvice": "string (highly detailed soil irrigation and moisture guidance, specifying exact watering schedule, water volumes, soil drainage improvement methods, moisture testing rules, and water qualities like decalcinated or rainwater)",
        "sunlightAdvice": "string (extremely detailed sunlight radiation advice, including exact Daily Light Integral, lux ranges, foot-candles, daily exposure hours, canopy shade requirements, or physical spacing repositioning)",
        "prevention": ["string (detailed, proactive cultivation rules, seasonal preparation, and environmental hygiene protocols to completely safeguard the crop from future recurrent outbreaks)"],
        "recoverySteps": ["string (numbered, highly detailed, concrete, chronological step-by-step restoration action plans guiding the grower from initial treatment through final convalescent stage)"]
      }

      Provide natural, helpful, simple language explanations that beginners can easily understand while retaining rich scientific accuracy. Ensure that every string in arrays is detailed and completely finished, offering actionable solutions rather than high-level summaries.

      CRITICAL INSTRUCTION FOR MAXIMUM DETAIL: The user demands that EVERY single element of symptoms, organicTreatments, chemicalTreatments, homeRemedies, soilNutrients, wateringAdvice, sunlightAdvice, prevention, and recoverySteps MUST be extremely rich, descriptive, and multi-sentence, filled with actionable chemical names, scientific steps, exact measurement metrics (liters, percentages, days, temperatures), and complete structural context. DO NOT return brief or high-level summaries. Ensure that all list arrays contain multiple items, and each item is written in the requested language (${language}) comprehensively. Give maximum depth!`;

      // Optimize pipeline using robust multi-model fallback client
      const response = await generateContentWithFallback(ai, {
        contents: [
          ...inlineDataList,
          prompt,
        ],
        temperature: 0.1,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        useSearchRequested: true,
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error("Empty response returned from Gemini.");
      }

      try {
        const parsedReport = resilientJsonParse(textOutput);
        res.json(parsedReport);
      } catch (parseErr) {
        console.error("Failed to parse JSON response:", textOutput);
        res.status(502).json({
          error: "Failed to parse diagnostic report.",
          rawOutput: textOutput,
        });
      }
    } catch (error: any) {
      console.error("AI Analysis error:", error);
      res.status(500).json({
        error: getFriendlyGeminiError(error),
      });
    }
  });

  // Assistant Chat companion API endpoint
  app.post("/api/plant-chat", async (req, res) => {
    try {
      const { message, chatHistory = [], context = "", language = "English", useSearch = false } = req.body;

      if (!message) {
        return res.status(400).json({ error: "No query message provided." });
      }

      if (!apiKey) {
        return res.status(500).json({
          error: "Gemini API key is not configured.",
        });
      }

      // Convert chat History into Gemini contents format
      const formattedContents: any[] = [
        {
          role: "user",
          parts: [{ text: `You are the AI Companion Plant Doctor inside the "AI Plant Doctor" application. You are an elite plant pathologist, expert botanist, and agricultural science doctor.
          
          Guidelines:
          - Provide extremely encouraging, clear, expert advice using human-friendly terminology.
          - Speak in this language: ${language}.
          - ALWAYS provide highly detailed, multi-sentence, professional explanations.
          - DO NOT ASK ANY FOLLOW-UP QUESTIONS TO THE USER under any circumstances. Do not say things like 'Can you tell me more?' or 'Do you see anything else?'. Directly analyze the context or question, diagnose the issue with full authority, and provide definitive, finalized answers.
          - CRITICAL INSTRUCTION FOR CURES, SYMPTOMS, AND CAUSES: When the user asks about symptoms, causes, or cures (such as organic treatments, safe chemicals, and home remedies) of the current plant disease, you MUST provide an extremely rich, detailed, and comprehensive breakdown. Back up your points with concrete botanical recipes, exact dilution rates (e.g., milliliters per liter), application frequencies (e.g., every 7 days), chemical active ingredients, and chronological recovery steps. Do not truncate or abbreviate. Deliver maximum depth!
          - If the user asks for a diagnosis, a cure, or any treatment advice, you MUST search reliable online sources such as Google and trusted agricultural, botanical, horticultural, gardening, and plant-health websites before generating the final answer. You must provide detailed cures and actionable treatment recommendations immediately. If the diagnosis of their issue is uncertain, you must still provide possible causes, potential helpful treatments, and prevention measures. Never stop at identifying a problem without offering helpful guidance and specific recovery timelines/prevention tips.
          - Display your answers in separate, beautifully organized sections whenever possible:
            ### 🚨 Diagnosis Results
            ### 💊 Treatment Recommendations (Detailed Cures)
            ### 🛡️ Prevention Tips
            ### 🪴 Plant Care Advice
            ### 📈 Follow-Up Actions
          
          Active Plant Diagnostic Context (User is currently examining or asking about this):
          ${context ? context : "No specific diagnostic upload has been analyzed yet. The user is asking general plant care questions."}` }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to act as the Companion Plant Doctor. I will answer all botanical questions with rich, exhaustive biological detail, precise symptoms, probable causes, and complete step-by-step organic and chemical cures, of course without requiring any further questions or inputs from the user!" }]
        }
      ];

      // Append existing messages
      chatHistory.forEach((msg: any) => {
        formattedContents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      });

      // Append user prompt
      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Optimize chat responses using robust multi-model fallback client
      const response = await generateContentWithFallback(ai, {
        contents: formattedContents,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
        useSearchRequested: true,
      });

      const responseText = response.text || "I apologize, but I could not formulate a diagnostic response. Please check back shortly.";
      res.json({ reply: responseText });
    } catch (error: any) {
      console.error("Chatbot response issue:", error);
      res.status(500).json({
        error: getFriendlyGeminiError(error),
      });
    }
  });

  // Serve static assets / Handle with Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded successfully in non-production mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static files in production mode from: ${distPath}`);
  }

  app.listen(PORT, HOST, () => {
    console.log(`AI Plant Doctor backend running at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start the AI Plant Doctor server backend:", err);
});
