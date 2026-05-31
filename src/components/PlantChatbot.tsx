import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, Sparkles, User, Mic, MicOff, Info, HelpCircle, 
  Trash2, Sprout, Upload, RefreshCw, ChevronRight, ArrowUp, Plus, Image as ImageIcon
} from "lucide-react";
import { ChatMessage, ChatSession, DiagnosticReport } from "../types";
import DiagnosticReportView from "./DiagnosticReportView";
import FormattedText from "./FormattedText";
import { Menu, Sidebar as SidebarIcon } from "lucide-react";

interface PlantChatbotProps {
  key?: React.Key;
  language: string;
  activeSession: ChatSession | null;
  onUpdateSessionMessages: (sessionId: string, messages: ChatMessage[]) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  onNewChat: () => void;
}

// Demo cases with custom labels
const DEMO_CASES = [
  {
    id: "rose_rust",
    title: "Rust Fungi Specimen",
    plant: "English Rose Bush",
    severity: "Medium",
    desc: "Orange powder-like pustules coating leaf underside.",
    fileName: "rose_leaf_rust.jpg",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23fff3ea'/><ellipse cx='50' cy='50' rx='25' ry='35' fill='%23e05a10' opacity='0.3'/><circle cx='40' cy='45' r='3' fill='%23b73e0e'/><circle cx='48' cy='52' r='4' fill='%23b73e0e'/><circle cx='55' cy='42' r='3' fill='%23b73e0e'/><path d='M50,15 Q50,50 50,85' stroke='%2322c55e' stroke-width='2' fill='none'/></svg>"
  },
  {
    id: "tomato_blight",
    title: "Late Blight Specimen",
    plant: "Roma Tomato Shrub",
    severity: "High",
    desc: "Dark water-soaked necrotic lesions on leaf surface.",
    fileName: "tomato_late_blight.jpg",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23fef2f2'/><ellipse cx='50' cy='50' rx='22' ry='33' fill='%23851c1c' opacity='0.25'/><path d='M50,15 Q50,50 50,85' stroke='%2315803d' stroke-width='2' fill='none'/><circle cx='42' cy='48' r='8' fill='%23450a0a' opacity='0.8'/></svg>"
  },
  {
    id: "iron_deficiency",
    title: "Iron Chlorosis Specimen",
    plant: "Gardenia Flower Jasmine",
    severity: "Low",
    desc: "Interveinal yellowing with pale leaves but dark green veins.",
    fileName: "gardenia_iron_chlorosis.jpg",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23fefcbf'/><ellipse cx='50' cy='50' rx='25' ry='35' fill='%23eab308' opacity='0.25'/><path d='M50,15 Q50,50 50,85' stroke='%23166534' stroke-width='2.5' fill='none'/></svg>"
  }
];

const DAILY_TIPS = [
  { text: "Morning hydration: Water plants early to allow leaves to dry, preventing late fungal spore pathogens.", author: "Dr. Elena Vance" },
  { text: "Sanitize shear blades with rubbing alcohol between trims to suppress cross-pathological spread.", author: "Botanist Mark" },
  { text: "Look for fine webs on the leaf undersides; spider mites flourish in dry household climates.", author: "Foliage Clinic" },
  { text: "Pot drainage is absolutely vital. Overwatering root decay causes over 65% of houseplant failures.", author: "Soil Lab Expert" }
];

export default function PlantChatbot({ 
  language, 
  activeSession, 
  onUpdateSessionMessages,
  isAnalyzing,
  setIsAnalyzing,
  sidebarCollapsed,
  setSidebarCollapsed,
  setMobileSidebarOpen,
  onNewChat
}: PlantChatbotProps): React.ReactElement {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [activeTipIdx, setActiveTipIdx] = useState(0);
  const [pendingDiagnosisOnUpload, setPendingDiagnosisOnUpload] = useState(false);

  const handleDiagnoseClick = () => {
    if (isAnalyzing) return;
    
    if (attachedImage) {
      setPendingDiagnosisOnUpload(false);
      handleSendMessage(
        undefined,
        "Please perform a detailed plant health diagnosis, identify any diseases, deficiencies, infections, or environmental stress, and provide comprehensive curing steps.",
        attachedImage,
        attachedFileName || "leaf.jpg"
      );
    } else {
      setPendingDiagnosisOnUpload(true);
      triggerAttachmentSelector();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setActiveTipIdx((prev) => (prev + 1) % DAILY_TIPS.length);
    }, 15000);
    return () => clearInterval(tipTimer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isAnalyzing]);

  if (!activeSession) {
    return (
      <div className="flex-1 bg-white h-screen flex flex-col items-center justify-center p-6 text-neutral-500">
        <MessageSquare className="w-10 h-10 text-neutral-300 mb-2 animate-bounce" />
        <p className="font-display font-medium text-sm">Please select or start a consultation session from history log</p>
      </div>
    );
  }

  const messages = activeSession.messages;
  const isChatEmpty = messages.length === 0;

  const handleProcessImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid format. Please attach a valid image file (PNG, JPEG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const imageResult = reader.result;
        
        const img = new Image();
        img.onload = () => {
          const maxDimension = 850;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase = canvas.toDataURL("image/jpeg", 0.85);
            setAttachedImage(compressedBase);
            setAttachedFileName(file.name);
            
            if (pendingDiagnosisOnUpload) {
              setPendingDiagnosisOnUpload(false);
              handleSendMessage(
                undefined,
                "Please perform a detailed plant health diagnosis, identify any diseases, deficiencies, infections, or environmental stress, and provide comprehensive curing steps.",
                compressedBase,
                file.name
              );
            }
          }
        };
        img.src = imageResult;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessImageFile(e.dataTransfer.files[0]);
    }
  };

  const triggerAttachmentSelector = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessImageFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, presetText?: string, imageToUse?: string, filenameToUse?: string) => {
    if (e) e.preventDefault();

    const finalizedText = (presetText || inputText).trim();
    const finalizedImage = imageToUse || attachedImage;
    const finalizedFileName = filenameToUse || attachedFileName || "specimen_tissue.jpg";

    if (!finalizedText && !finalizedImage) return;
    if (isAnalyzing) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: finalizedText || "Please diagnosis this plant leaf tissue photograph.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageData: finalizedImage || undefined
    };

    const newMessages = [...messages, userMessage];
    onUpdateSessionMessages(activeSession.id, newMessages);
    
    setInputText("");
    setAttachedImage(null);
    setAttachedFileName(null);
    setIsAnalyzing(true);

    try {
      if (finalizedImage) {
        // Post analytical scan to model API
        const response = await fetch("/api/analyze-plant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: finalizedImage,
            fileName: finalizedFileName,
            language: language,
            useSearch: useWebSearch,
            message: finalizedText
          })
        });

        if (!response.ok) {
          let errMsg = "Diagnosis server encountered an api gateway failure.";
          try {
            const errData = await response.json();
            if (errData && errData.error) {
              errMsg = errData.error;
            }
          } catch (e) {}
          throw new Error(errMsg);
        }

        const diagnosisData = (await response.json()) as DiagnosticReport;

        const introText = language === "Español" 
          ? `He escaneado la muestra de **${diagnosisData.plantType}**. Aquí está mi reporte clínico detallado:`
          : language === "Français"
          ? `J'ai analysé votre plante de **${diagnosisData.plantType}**. Voici mon diagnostic médical complet :`
          : language === "Deutsch"
          ? `Ich habe Ihre **${diagnosisData.plantType}** erfolgreich gescannt. Hier ist mein klinischer Befund:`
          : language === "Hindi"
          ? `मैंने आपके **${diagnosisData.plantType}** पौधे का विश्लेषण कर लिया है। नीचे आपका चिकित्सक उपचार प्रस्तुत है:`
          : `I have completed the clinical scan for your **${diagnosisData.plantType}** specimen. Here are my observations, therapeutic schedules, and organic preventatives:`;

        const assistantMessageContent = diagnosisData.personalizedAnswer 
          ? diagnosisData.personalizedAnswer 
          : `${introText}\n\n**Issue**: ${diagnosisData.issueName} (${diagnosisData.confidence}% accuracy)\n**Severity**: ${diagnosisData.severity}`;

        const assistantMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: assistantMessageContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageData: finalizedImage,
          report: diagnosisData
        };

        onUpdateSessionMessages(activeSession.id, [...newMessages, assistantMessage]);

      } else {
        // Standard conversational help
        let activeReportContext = "";
        const mWithReport = newMessages.filter(m => m.report);
        if (mWithReport.length > 0) {
          const r = mWithReport[mWithReport.length - 1].report;
          if (r) {
            activeReportContext = `
Plant Type: ${r.plantType}
Diagnosed Issue: ${r.issueName}
Severity Level: ${r.severity}
Accuracy Match: ${r.confidence}%
Visual Symptoms:
${r.symptoms.map(s => `- ${s}`).join("\n")}
Probable Causes:
${r.causes.map(c => `- ${c}`).join("\n")}
Organic Treatments/Cures:
${r.organicTreatments.map(t => `- ${t}`).join("\n")}
Chemical/Scientific Treatments:
${r.chemicalTreatments.map(t => `- ${t}`).join("\n")}
Home Remedies/DIY Cures:
${r.homeRemedies.map(rem => `- ${rem}`).join("\n")}
Soil and Nutrients Treatment:
${r.soilNutrients}
Irrigation & Water Schedule Treatment:
${r.wateringAdvice}
Radiation/Sunlight Management Advice:
${r.sunlightAdvice}
Outbreak Prevention Protocols:
${r.prevention.map(p => `- ${p}`).join("\n")}
Restoration Step-by-Step Recovery Checklist:
${r.recoverySteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`;
          }
        }

        const response = await fetch("/api/plant-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: finalizedText,
            chatHistory: newMessages,
            language: language,
            useSearch: useWebSearch,
            context: activeReportContext
          })
        });

        if (!response.ok) {
          let errMsg = "Botanist medical agent was unable to connect.";
          try {
            const errData = await response.json();
            if (errData && errData.error) {
              errMsg = errData.error;
            }
          } catch (e) {}
          throw new Error(errMsg);
        }

        const data = await response.json();

        const assistantMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        onUpdateSessionMessages(activeSession.id, [...newMessages, assistantMessage]);
      }
    } catch (err: any) {
      console.error(err);
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: `Error diagnosing leaf: "${err.message || "Unknown error"}". Ensure your GEMINI_API_KEY is active in the developer panel.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onUpdateSessionMessages(activeSession.id, [...newMessages, assistantMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech inputs are not fully supported by this iframe frame. Try entering questions manually.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "Español" ? "es-ES" : language === "Français" ? "fr-FR" : language === "Hindi" ? "hi-IN" : "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setInputText((prev) => (prev ? prev + " " + result : result));
    };

    recognition.start();
  };

  const handleLoadDemoCase = (demo: typeof DEMO_CASES[0]) => {
    if (isAnalyzing) return;
    handleSendMessage(undefined, `Diagnose: ${demo.title}`, demo.image, demo.fileName);
  };

  return (
    <div 
      className="flex flex-col h-full bg-white text-neutral-850 relative overflow-hidden"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* File Dropping overlay */}
      {isDragActive && (
        <div className="absolute inset-0 bg-emerald-600/5 backdrop-blur-xs z-50 flex flex-col items-center justify-center border-4 border-dashed border-emerald-500 rounded-lg pointer-events-none transition-all">
          <Upload className="w-12 h-12 text-emerald-600 animate-bounce mb-2" />
          <h3 className="font-display font-semibold text-lg text-emerald-800">Drop leaf photograph here</h3>
        </div>
      )}

      {/* Main Bar Top Header */}
      <div className="px-5 py-3.5 border-b border-neutral-100/90 flex items-center justify-between text-neutral-800 shrink-0">
        <div className="flex items-center gap-3">
          
          {/* Mobile Menu Icon Button (Visible on mobile only, opens sidebar drawer) when closed */}
          {sidebarCollapsed && (
            <button
              onClick={() => {
                setMobileSidebarOpen(true);
                setSidebarCollapsed(false);
              }}
              className="md:hidden flex items-center gap-1.5 p-1.5 px-2.5 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg text-black hover:text-black transition-all text-xs font-semibold shrink-0 cursor-pointer shadow-xs border border-neutral-205"
              title="Unhide Sidebar"
            >
              <Menu className="w-4 h-4 text-emerald-700 font-bold" />
              <span>Unhide Sidebar</span>
            </button>
          )}

          {/* Desktop Sidebar Hide/Unhide Toggle Button (Hidden on Mobile) when closed */}
          {sidebarCollapsed && (
            <button
              onClick={() => {
                setSidebarCollapsed(false);
              }}
              className="hidden md:flex items-center gap-1.5 p-1.5 px-2.5 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg text-black hover:text-black transition-all text-xs font-semibold shrink-0 cursor-pointer shadow-xs border border-neutral-205"
              title="Unhide Sidebar"
            >
              <SidebarIcon className="w-4 h-4 text-neutral-500" />
              <span>Unhide Sidebar</span>
            </button>
          )}

          {/* Clean ChatGPT Style dropdown selector banner */}
          <div className="flex items-center gap-1.5 cursor-pointer select-none py-1 px-2 rounded-lg hover:bg-neutral-50">
            <span className="font-sans font-medium text-[#0d0d0d] text-[15px] tracking-tight">AI Plant Doctor ▾</span>
          </div>
        </div>

        {/* Toggle container */}
        <div className="flex items-center gap-4">
          {/* Quick Engine Status Indicator */}
          <div className="flex items-center gap-2 bg-neutral-100/95 hover:bg-neutral-250/50 px-3 py-1.5 rounded-full border border-neutral-200/50 transition-all text-xs">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${useWebSearch ? "bg-amber-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${useWebSearch ? "bg-amber-500" : "bg-emerald-500"}`}></span>
            </span>
            <span className="font-medium text-neutral-600 select-none hidden xs:inline">
              {useWebSearch ? "Deep Web Search Grounding" : "Super Fast Mode ⚡"}
            </span>
            <span className="font-medium text-neutral-600 select-none xs:hidden">
              {useWebSearch ? "Deep Search" : "Super Fast ⚡"}
            </span>

            {/* Switch slider */}
            <button
              onClick={() => setUseWebSearch(!useWebSearch)}
              className={`ml-1 w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative cursor-pointer ${
                useWebSearch ? "bg-amber-500" : "bg-emerald-600"
              }`}
              title={useWebSearch ? "Change to Super Fast Mode" : "Change to Deep Web Search Grounding Mode"}
            >
              <div
                className={`bg-white w-3.5 h-3.5 rounded-full shadow-xs transform transition-transform duration-200 ease-in-out ${
                  useWebSearch ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Quick specs label */}
          <div className="hidden md:block text-[10px] font-mono text-neutral-400 font-semibold tracking-wider">
            {activeSession.title.startsWith("New Consult") ? "Companion Clinic" : activeSession.title}
          </div>
        </div>
      </div>

      {/* Main Work Surface viewport */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 md:py-12 scrollbar-none relative">
        
        {isChatEmpty ? (
          // Centered Welcome State strictly reflecting the user's ChatGPT screenshot!
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full min-h-[50vh] space-y-16">
            
            {/* Elegant prompt text */}
            <h2 className="text-[#0d0d0d] text-2xl font-medium sm:text-[32px] md:text-[34px] tracking-tight text-center leading-none">
              What are you working on?
            </h2>

            {/* Empty state search wrap */}
            <div className="w-full space-y-4">
              
              {/* Distinct "Upload Images" button above the input bar with Diagnosis button directly below */}
              <div className="flex flex-col items-center justify-center gap-3 mb-1 mt-2">
                <button
                  type="button"
                  onClick={triggerAttachmentSelector}
                  className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-black font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all scale-100 active:scale-95 duration-150 cursor-pointer border border-red-700 group hover:-translate-y-0.5 animate-fade-in"
                  id="welcome-upload-btn"
                >
                  <Upload className="w-4.5 h-4.5 text-black group-hover:scale-110 transition-transform" />
                  <span>Upload Images</span>
                </button>

                <button
                  type="button"
                  onClick={handleDiagnoseClick}
                  className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-black font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all scale-100 active:scale-95 duration-150 cursor-pointer border border-emerald-700 group hover:-translate-y-0.5 animate-fade-in"
                  id="welcome-diagnose-btn"
                >
                  <Sparkles className="w-4.5 h-4.5 text-black group-hover:rotate-12 transition-transform" />
                  <span className="text-black font-semibold">Start Advanced Diagnosis</span>
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="relative w-full">
                
                {/* Clean input box matched to ChatGPT with upload icon built-in */}
                <div className="w-full bg-[#f4f4f4] border border-neutral-200/40 rounded-[28px] py-3.5 pl-3 pr-14 flex items-center focus-within:bg-white focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.06)] focus-within:border-neutral-200/90 transition-all">
                  
                  {/* Embedded upload button inside input bar */}
                  <button
                    type="button"
                    onClick={triggerAttachmentSelector}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95 duration-100 rounded-full cursor-pointer transition-all shrink-0 mr-3 shadow-xs flex items-center justify-center border border-red-700"
                    title="Upload Plant Image for Diagnosis"
                    id="welcome-upload-inside-btn"
                  >
                    <Upload className="w-4 h-4 text-red-100" />
                  </button>

                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask anything or describe symptoms"
                    className="flex-1 bg-transparent text-[#0d0d0d] font-sans text-[15px] focus:outline-none placeholder-neutral-450 border-none outline-none leading-normal"
                    disabled={isAnalyzing}
                  />

                  {/* Circular Up Arrow Send button */}
                  <button
                    type="submit"
                    disabled={(!inputText.trim() && !attachedImage) || isAnalyzing}
                    className={`absolute right-4.5 p-2 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                      (!inputText.trim() && !attachedImage) || isAnalyzing
                        ? "bg-[#e3e3e3] text-[#b4b4b4]"
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                  >
                    <ArrowUp className="w-4.5 h-4.5 stroke-[3]" />
                  </button>
                </div>
              </form>

              {/* Instant Thumb preview in case they attached a leaf */}
              {attachedImage && (
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-3 max-w-sm mx-auto animate-fade-in shadow-xs">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                    <img src={attachedImage} className="w-full h-full object-contain bg-neutral-150" alt="Thumb" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-800 truncate">{attachedFileName}</p>
                    <p className="text-[10px] text-neutral-400">Attached leaf specimen</p>
                  </div>
                  <button 
                    onClick={() => {
                      setAttachedImage(null);
                      setAttachedFileName(null);
                    }}
                    className="text-neutral-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Rotation botanical clinical tip advice inside small capsule tip */}
            <div className="max-w-lg bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-center text-xs animate-fade-in">
              <span className="font-bold text-emerald-800 font-display text-[10px] uppercase tracking-wider block mb-1">Clinic Wisdom</span>
              <p className="text-neutral-600 italic">"{DAILY_TIPS[activeTipIdx].text}"</p>
              <span className="text-[9.5px] text-neutral-400 font-semibold block mt-1">— {DAILY_TIPS[activeTipIdx].author}</span>
            </div>

            {/* Suggestion capsules/cards mapped underneath prompt bar */}
            <div className="w-full max-w-xl space-y-2.5">
              <p className="text-[10px] font-bold text-neutral-400 tracking-wider text-center uppercase">Pre-Loaded Diagnostic Trial Specimen</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_CASES.map((demo) => (
                  <div 
                    key={demo.id}
                    onClick={() => handleLoadDemoCase(demo)}
                    className="px-3.5 py-2 bg-white border border-neutral-200 hover:border-emerald-500/30 rounded-xl cursor-pointer text-center hover:bg-neutral-50/50 transition-colors shadow-xs"
                  >
                    <p className="text-[9.5px] font-semibold text-neutral-400 uppercase tracking-tight">{demo.plant}</p>
                    <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">{demo.title}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          // Active chat feed: Clean Dialogues Flow conforming to Light mode ChatGPT look!
          <div className="max-w-3xl mx-auto space-y-10 pb-36">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div 
                  key={msg.id || idx}
                  className={`flex gap-4 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center shrink-0 shadow-xs select-none">
                      <Sprout className="w-4 h-4 text-emerald-700 font-bold" />
                    </div>
                  )}

                  <div className={`space-y-1 max-w-[85%] min-w-0 ${!isAssistant ? "text-right" : ""}`}>
                    
                    {/* Speech bubble or markdown sheet */}
                    <div className={`px-4.5 py-3 rounded-2xl text-[15.5px] md:text-base leading-relaxed font-sans ${
                      isAssistant 
                        ? "bg-white text-neutral-850" 
                        : "bg-[#f4f4f4] text-[#0d0d0d] rounded-tr-none text-left"
                    }`}>
                      
                      {/* Thumbnail for any users leaf attachment */}
                      {msg.imageData && !isAssistant && (
                        <div className="mb-2 max-w-xs rounded-lg overflow-hidden border border-neutral-200 shadow-xs">
                          <img 
                            src={msg.imageData} 
                            alt="Leaf tissue" 
                            className="max-h-48 object-cover w-full"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="leading-relaxed font-normal">
                        <FormattedText text={msg.content} />
                      </div>

                      {/* Interactive Detailed Diagnostic Clinical Sheet embed */}
                      {isAssistant && msg.report && (
                        <div className="mt-5 pt-5 border-t border-neutral-150">
                          <div className="mb-3.5 bg-neutral-50 p-3 rounded-xl flex items-center gap-2 text-[11px] text-neutral-500">
                             <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                             <span>Clinical report compiled. You may check off schedule items, hear speech dictate, or download report.</span>
                          </div>
                          
                          <DiagnosticReportView 
                            inlineMode={true} 
                            report={msg.report} 
                            imageData={msg.imageData || ""} 
                          />
                        </div>
                      )}

                    </div>

                    {/* Timestamp */}
                    <div className="text-[9.5px] text-neutral-400 font-mono px-1">
                      {msg.timestamp}
                    </div>

                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 shadow-xs select-none font-bold text-xs">
                      N
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Loader Indicators */}
            {isAnalyzing && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="px-4.5 py-3.5 bg-neutral-50 rounded-2xl flex items-center gap-2.5 border border-neutral-150 shadow-xs">
                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span className="text-xs text-neutral-500 font-mono">Examining cellular layers...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

      </div>

      {/* Floating Sticky centered Capsules prompt panel at the bottom (anchored consistently) */}
      {!isChatEmpty && (
        <div className="px-4 py-4 md:px-12 border-t border-neutral-100 bg-white shrink-0 z-20">
          <div className="max-w-2xl mx-auto space-y-3">
            
            {/* Thumbnail attachment prep loader */}
            {attachedImage && (
              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-3.5 max-w-sm animate-fade-in shadow-xs">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-205 shrink-0">
                  <img src={attachedImage} className="w-full h-full object-contain bg-neutral-150" alt="Attached" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-800 truncate">{attachedFileName}</p>
                  <p className="text-[10px] text-neutral-405 font-mono">Photograph ready to diagnose</p>
                </div>
                <button 
                  onClick={() => {
                    setAttachedImage(null);
                    setAttachedFileName(null);
                  }}
                  className="text-neutral-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload Image button and voice indicator placed neatly above the input bar in active chat with diagnosis button below it */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={triggerAttachmentSelector}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-black text-xs font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer border border-red-700 animate-fade-in animate-duration-150"
                  id="active-upload-image-btn"
                >
                  <Upload className="w-4 h-4 text-black" />
                  <span>Upload Images</span>
                </button>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleDiagnoseClick}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-black text-xs font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-150 cursor-pointer border border-emerald-700 animate-fade-in animate-duration-150"
                  id="active-diagnose-btn"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span className="text-black font-bold">Start Advanced Diagnosis</span>
                </button>
              </div>
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
              
              {/* Voice input */}
              <button
                type="button"
                onClick={triggerVoiceInput}
                className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-center shrink-0 cursor-pointer ${
                  isRecording
                    ? "bg-red-500 border-red-500 text-white animate-pulse"
                    : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                }`}
                title={isRecording ? "Listening..." : "Dictate plant inquiry"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Clean chat bar capsule with integrated upload icon */}
              <div className="flex-1 bg-[#f4f4f4] border border-neutral-200/40 rounded-[24px] pl-3.5 pr-12 py-2 flex items-center focus-within:bg-white focus-within:shadow-md focus-within:border-neutral-200/90 transition-all">
                
                {/* Embedded upload button inside input bar */}
                <button
                  type="button"
                  onClick={triggerAttachmentSelector}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95 duration-100 rounded-full cursor-pointer transition-all shrink-0 mr-2 shadow-xs flex items-center justify-center border border-red-700"
                  title="Upload Plant Image for Diagnosis"
                  id="active-upload-inside-btn"
                >
                  <Upload className="w-3.5 h-3.5 text-red-100" />
                </button>

                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    attachedImage 
                      ? "Optional instruction, or click Send to diagnose..." 
                      : isRecording 
                      ? "Listening to vocals..." 
                      : "Type botanical questions or ask diagnosis..."
                  }
                  className="flex-1 bg-transparent text-[#0d0d0d] text-sm focus:outline-none py-1.5 border-none outline-none leading-normal"
                  disabled={isAnalyzing}
                />

                <button
                  type="submit"
                  disabled={(!inputText.trim() && !attachedImage) || isAnalyzing}
                  className={`absolute right-3.5 p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    (!inputText.trim() && !attachedImage) || isAnalyzing
                      ? "bg-neutral-200 text-neutral-400"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}
                >
                  <ArrowUp className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </form>

            <span className="text-[10px] text-neutral-400 font-mono tracking-wider block text-center uppercase">
              AI Plant Doctor Clinical Engine • Active in {language}
            </span>
          </div>
        </div>
      )}

      {/* Hidden system input file picker */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
