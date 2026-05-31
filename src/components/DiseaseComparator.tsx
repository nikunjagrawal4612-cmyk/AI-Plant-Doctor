import React, { useState } from "react";
import { Columns, HelpCircle, ArrowRight, ShieldAlert, Zap, Layers, RefreshCw } from "lucide-react";

interface DiseaseProfile {
  id: string;
  name: string;
  pathogen: string;
  symptoms: string[];
  organicCures: string[];
  chemicalCures: string[];
  prevention: string;
  incubation: string;
}

const DISEASE_LIBRARY: Record<string, DiseaseProfile> = {
  powdery_mildew: {
    id: "powdery_mildew",
    name: "Powdery Mildew Fungi",
    pathogen: "Podosphaera xanthii (Fungal Spores)",
    symptoms: [
      "White, powdery talcum-like spots coating leaf surfaces and stems",
      "Leaves twist, curl upward, and turn yellow-brown",
      "Stunted crop yields and premature flower drop"
    ],
    organicCures: [
      "Spritz leaves with custom neem oil dilution or potassium bicarbonate sprays",
      "Prune crowded branch foliage to enhance air currents",
      "Spray 40/60 milk-to-water mixture directly onto leaves in mid-morning sun"
    ],
    chemicalCures: [
      "Apply direct commercial chlorothalonil or sulfur-based fungicides",
      "Systemic myclobutanil sprays for premium ornamental shrubs"
    ],
    prevention: "Steer clear of overhead sprinkler watering; plant in slots with rich morning sunlight.",
    incubation: "3 to 7 Days in warm (60-80°F), high humidity shady zones."
  },
  late_blight: {
    id: "late_blight",
    name: "Late Blight Spores",
    pathogen: "Phytophthora infestans (Oomycete)",
    symptoms: [
      "Water-soaked dark lesions spreading rapidly across foliage",
      "White downy spore fuzz on the underside of leaves during damp humidity",
      "Entire plant can collapse and turn brown-black in 48 hours"
    ],
    organicCures: [
      "Prune and safely burn infected stems immediately (Do not compost)",
      "Apply copper octanoate soap sprays safely to foliage buffers"
    ],
    chemicalCures: [
      "Spray preventative chlorothalonil, mancozeb or metalaxyl fungicide blends"
    ],
    prevention: "Rotate solanaceous crops annually. Ensure spacious plant spacing.",
    incubation: "4 to 10 Days in cold, damp overcast weather environments."
  },
  black_spot: {
    id: "black_spot",
    name: "Black Spot Fungi",
    pathogen: "Diplocarpon rosae (Fungi)",
    symptoms: [
      "Circular dark brown-black spots with fringed feathered borders on leaves",
      "Yellow halos grow around spots, causing leaves to drop prematurely",
      "Weakens roses and renders stems vulnerable to winter cold burns"
    ],
    organicCures: [
      "De-leaf infected parts from ground level to avoid rain-bounce infection",
      "Baking soda spray (1 Tbsp baking soda + 1 tsp liquid soap per gallon of water)"
    ],
    chemicalCures: [
      "Copper octanoate or chlorothalonil. Systemic tebuconazole for rose gardens"
    ],
    prevention: "Irrigate soil directly, keeping leaf membranes completely dry. Avoid late evening watering.",
    incubation: "7 to 14 Days at temperatures above 70°F with wet leaf surfaces."
  },
  iron_chlorosis: {
    id: "iron_chlorosis",
    name: "Iron Chlorosis Deficiency",
    pathogen: "High soil pH (Alkalinity) restricting mineral iron uptake",
    symptoms: [
      "Interveinal yellowing (leaf body turns bright yellow but veins remain dark green)",
      "New shoots appear pale green to translucent white",
      "Severe branches dry out, turn necrotic brown, and drop"
    ],
    organicCures: [
      "Amend soil with rich organic leaf mulch, elemental sulfur or organic compost",
      "Apply organic liquid seaweed or chelated iron liquid foliage feeds"
    ],
    chemicalCures: [
      "Incorporate granular iron chelates (Fe-EDDHA for alkaline potting soils)",
      "Incorporate iron sulfate soil fertilizers directly"
    ],
    prevention: "Test soil acidity. Keep pH between 6.0 and 6.5 for acid-loving shrubs like Gardenias and Blueberries.",
    incubation: "Gradual environmental deficiency. Manifests slowly during active peak leaf flushes."
  },
  spider_mites: {
    id: "spider_mites",
    name: "Two-Spotted Spider Mites",
    pathogen: "Tetranychus urticae (Acarid Pest)",
    symptoms: [
      "Tiny yellow-white stippling dots speckling leaf membranes",
      "Silken web fabrics spun on leaf undersides, joints and stems",
      "Foliage loses luster, turns dull gray-bronze, and dries out thoroughly"
    ],
    organicCures: [
      "Blast foliage underside with cold water streams to wash away webbing",
      "Spray organic Insecticidal Soap, horticultural mineral oils, or dilute rosemary extract"
    ],
    chemicalCures: [
      "Apply commercial abamectin or bifenthrin target miticide sprays"
    ],
    prevention: "Mist indoor plant screens. Spider mites multiply extremely fast in dry, static dusty spaces.",
    incubation: "5 to 12 Days. A single female deposits over 100 eggs in 10 days."
  }
};

export default function DiseaseComparator() {
  const [leftSelection, setLeftSelection] = useState<string>("powdery_mildew");
  const [rightSelection, setRightSelection] = useState<string>("late_blight");

  const leftProfile = DISEASE_LIBRARY[leftSelection] || DISEASE_LIBRARY.powdery_mildew;
  const rightProfile = DISEASE_LIBRARY[rightSelection] || DISEASE_LIBRARY.late_blight;

  const handleSwap = () => {
    setLeftSelection(rightSelection);
    setRightSelection(leftSelection);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto text-neutral-800 animate-fade-in">
      
      {/* Overview Intro section */}
      <div className="mb-8 border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Columns className="w-5 h-5 text-amber-600" />
          <h3 className="font-display font-semibold text-lg text-neutral-950">
            Pathological Disease Comparator
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          Contrast leaves symptoms, underlying mold pathogens, organic cures, and chemicals side-by-side to rule out lookalike plant anomalies.
        </p>
      </div>

      {/* Selectors rows */}
      <div className="grid sm:grid-cols-11 items-center gap-4 bg-neutral-50 border border-neutral-200 p-4 rounded-2xl mb-8">
        
        {/* Left selector */}
        <div className="sm:col-span-5 space-y-1">
          <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
            Check specimen A
          </label>
          <select
            value={leftSelection}
            onChange={(e) => setLeftSelection(e.target.value)}
            className="w-full bg-white border border-neutral-200 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-800"
          >
            {Object.values(DISEASE_LIBRARY).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        {/* Swap action element */}
        <div className="sm:col-span-1 flex items-center justify-center">
          <button
            onClick={handleSwap}
            className="p-2.5 bg-white hover:bg-neutral-100 rounded-full border border-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
            title="Swap sides"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right selector */}
        <div className="sm:col-span-5 space-y-1">
          <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
            Check specimen B
          </label>
          <select
            value={rightSelection}
            onChange={(e) => setRightSelection(e.target.value)}
            className="w-full bg-white border border-neutral-200 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-800"
          >
            {Object.values(DISEASE_LIBRARY).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-side Comparative Table structure */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        
        {/* SPECIMEN A CARD */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
          
          <div className="flex items-center gap-2 text-neutral-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Profile Specimen A</span>
          </div>

          <h4 className="text-base font-bold text-neutral-900 mb-1">{leftProfile.name}</h4>
          <p className="text-xs text-neutral-400 font-mono italic mb-6">Pathogen: {leftProfile.pathogen}</p>

          <div className="space-y-6">
            <div>
              <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Visual Symptoms</h5>
              <ul className="space-y-2">
                {leftProfile.symptoms.map((s, idx) => (
                  <li key={idx} className="text-xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Organic Solutions</h5>
              <ul className="space-y-2">
                {leftProfile.organicCures.map((s, idx) => (
                  <li key={idx} className="text-xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Chemical Therapies</h5>
              <ul className="space-y-2">
                {leftProfile.chemicalCures.map((s, idx) => (
                  <li key={idx} className="text-xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1 h-1 bg-amber-600 rounded-full mt-2 shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Incubation</span>
                <span className="text-xs font-medium text-neutral-800">{leftProfile.incubation}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Avoid recurrence</span>
                <span className="text-xs font-medium text-neutral-800">{leftProfile.prevention}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SPECIMEN B CARD */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>

          <div className="flex items-center gap-2 text-neutral-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Profile Specimen B</span>
          </div>

          <h4 className="text-base font-bold text-neutral-900 mb-1">{rightProfile.name}</h4>
          <p className="text-xs text-neutral-400 font-mono italic mb-6">Pathogen: {rightProfile.pathogen}</p>

          <div className="space-y-6">
            <div>
              <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Visual Symptoms</h5>
              <ul className="space-y-2">
                {rightProfile.symptoms.map((s, idx) => (
                  <li key={idx} className="text-xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Organic Solutions</h5>
              <ul className="space-y-2">
                {rightProfile.organicCures.map((s, idx) => (
                  <li key={idx} className="text-xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Chemical Therapies</h5>
              <ul className="space-y-2">
                {rightProfile.chemicalCures.map((s, idx) => (
                  <li key={idx} className="text-xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1 h-1 bg-amber-600 rounded-full mt-2 shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Incubation</span>
                <span className="text-xs font-medium text-neutral-800">{rightProfile.incubation}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Avoid recurrence</span>
                <span className="text-xs font-medium text-neutral-800">{rightProfile.prevention}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
