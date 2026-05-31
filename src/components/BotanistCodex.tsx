import React, { useState } from "react";
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  Cpu, 
  FileText, 
  Hash, 
  Eye, 
  FlaskConical, 
  ShieldCheck, 
  Menu,
  Sidebar as SidebarIcon
} from "lucide-react";

interface BotanistCodexProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

interface PathogenEntry {
  id: string;
  name: string;
  scientificName: string;
  type: "Fungal" | "Climatic" | "Nutritional" | "Bacterial" | "Viral" | "Pest";
  frequency: "High" | "Medium" | "Low";
  symptoms: string[];
  description: string;
  cellularImpact: string;
  organicRecipe: string;
  chemicalRecipe: string;
  preventativeMeasures: string[];
}

const CODEX_ENTRIES: PathogenEntry[] = [
  {
    id: "rose-rust",
    name: "Rust Fungi Spores",
    scientificName: "Phragmidium mucronatum",
    type: "Fungal",
    frequency: "High",
    symptoms: [
      "Bright orange-yellow powder pustules on underside of foliage.",
      "Necrotic spots forming on upper leaf cuticle.",
      "Early defoliation of secondary lower branches."
    ],
    description: "A highly contagious macrocyclic rust fungus that relies on moisture on leaves to spore. It extracts cytoplasmic nutrients via specialized haustoria.",
    cellularImpact: "Penetrates epidermal cells, disrupting photosynthetic leaf starch storage, leading to cellular dehydration.",
    organicRecipe: "Apply liquid copper formulations or cold-pressed organic Neem oil at 7-day intervals. Introduce equine tail (horsetail) extract tea.",
    chemicalRecipe: "Proactive triazole-based systemic fungicides such as Myclobutanil or Tebuconazole.",
    preventativeMeasures: [
      "Water crops strictly bottom-only. Avoid overhead misting.",
      "Prune base branches to facilitate air circulation and decrease dew accumulation.",
      "Clear fallen diseased leaves immediately in autumn to purge spore lifecycle."
    ]
  },
  {
    id: "late-blight",
    name: "Late Blight Shrub Rot",
    scientificName: "Phytophthora infestans",
    type: "Bacterial",
    frequency: "High",
    symptoms: [
      "Dark water-soaked lesions expanding rapidly on leaves & stems.",
      "Fuzzy white mold appearing on leaf edges during humid mornings.",
      "Dark brown firm rotten decay on active crop fruit tissue."
    ],
    description: "An aggressive oomycete pathogen responsible for massive historic crop failures. Thrives in cool, moist, and humid environments and spreads incredibly fast.",
    cellularImpact: "Releases hydrolytic enzymes that digest and liquefy the surrounding cellulose cell wall structure.",
    organicRecipe: "Apply copper soap fungicides. Alternatively, spray diluted compost tea enriched with Bacillus subtilis to occupy microflora space.",
    chemicalRecipe: "Chlorothalonil or Mancozeb protective spray barriers applied ahead of wet climates.",
    preventativeMeasures: [
      "Select certified pathogen-free high-grade tubers and seeds.",
      "Space out crop rows by at least 2.5 feet to enhance rapid leaf drying.",
      "Destroy (do not compost) any infected tissue residue immediately."
    ]
  },
  {
    id: "iron-chlorosis",
    name: "Iron Chlorosis Deficit",
    scientificName: "Fe Micronutrient Blockout",
    type: "Nutritional",
    frequency: "Medium",
    symptoms: [
      "Interveinal yellowing: space between leaf veins turns yellow.",
      "Core leaf veins retain a deep, stark dark green outline.",
      "Leaves turn bleached white and dry under extreme prolonged deficit."
    ],
    description: "A functional physiological disorder where the crop is unable to synthesize chlorophyll due to lack of bio-available heavy iron ions. Often caused by high alkaline soil pH blocking iron uptake.",
    cellularImpact: "Arrests the critical enzymatic compilation of chlorophyll-protein complexes in chloroplasts.",
    organicRecipe: "Incorporate organic compost, leaf mold, or elemental pure sulfur to lower soil pH. Administer chelated liquid iron soil drench.",
    chemicalRecipe: "Soil injection of synthetic EDTA or EDDHA iron chelates depending on soil pH bounds.",
    preventativeMeasures: [
      "Test soil alkalinity. Target optimal pH bounds of 5.8 - 6.5 for acid-tolerant crops.",
      "Avoid compacting clay heavy soil which starves root biological oxygen respiration.",
      "Avoid excess phosphorus fertilizers that form insoluble iron phosphate complexes."
    ]
  },
  {
    id: "spider-mites",
    name: "Two-Spotted Spider Mite",
    scientificName: "Tetranychus urticae",
    type: "Pest",
    frequency: "High",
    symptoms: [
      "Microscopic yellow stippling or dry speckled freckling on leaf surface.",
      "Extremely fine silky webbing wrapped around leaf nodes and petioles.",
      "Foliage takes on a dusty, dull bronze, listless visual tone."
    ],
    description: "Microscopic arachnid sap-feeders that flourish in extremely dry, hot household environments. They replicate incredibly fast when natural predators are absent.",
    cellularImpact: "Pierces individual plant cell walls to drain vital sap fluids, killing localized tissue cells.",
    organicRecipe: "Spray infected foliage aggressively with organic insecticidal soap or horticultural oil. Release beneficial predatory mites (Phytoseiulus persimilis).",
    chemicalRecipe: "Contact acaricides such as Abamectin or Bifenthrin targeted on leaf undersides.",
    preventativeMeasures: [
      "Mist leaves occasionally to keep local relative humidity elevated above 55%.",
      "Isolate brand-new greenhouse acquisitions for 14 days minimum count.",
      "Wipe dust off broad conservatory leaves regularly with damp linens."
    ]
  },
  {
    id: "powdery-mildew",
    name: "Powdery Mildew Coating",
    scientificName: "Podosphaera / Erysiphe",
    type: "Fungal",
    frequency: "High",
    symptoms: [
      "Talcom-like white powder film expanding on leaf upper surfaces.",
      "Leaves curling upwards, exposing pale dry margins.",
      "Buds fail to unfold; young shoots stunt and morph abnormally."
    ],
    description: "An obligate biotrophic fungus that infects hosts under high relative humidity but dry leaf surfaces. Tolerates warm climates very well.",
    cellularImpact: "Sends haustoria probes directly into the upper epidermal layer, siphoning carbohydrates without killing the host cell initially.",
    organicRecipe: "Spray a mixture of potassium bicarbonate (3 tsp/gal) plus horticultural oil. Or mist foliage with 1:9 milk-to-water dilution under bright sun.",
    chemicalRecipe: "Triadimefon, Propiconazole, or Sulfur-based systemic fungicides.",
    preventativeMeasures: [
      "Sow mold-resistant seed cultivars when setting up new crop fields.",
      "Trim overcrowded central foliage branches to facilitate sunlight penetration.",
      "Avoid shade heavy placement for susceptible species like Lilac or Squash."
    ]
  },
  {
    id: "bacterial-canker",
    name: "Pseudomonas Shoot Canker",
    scientificName: "Pseudomonas syringae pv. syringae",
    type: "Bacterial",
    frequency: "Low",
    symptoms: [
      "Gummy, amber-colored ooze weeping from cracks in bark and woody limbs.",
      "Sunken dark lesions forming flat dry plates on twigs.",
      "Blosson blast: flowers turn brown and die in early spring."
    ],
    description: "An opportunistic Gram-negative rod bacterium that penetrates through frost injuries, pruning cuts, or insect punctures.",
    cellularImpact: "Produces ice-nucleation active proteins that induce cell-rupturing frost damage at higher-than-normal temperatures.",
    organicRecipe: "Spray with basic copper sulfate while tree lies dormant in autumn and late winter. Apply orchard paint to lower stem cracks.",
    chemicalRecipe: "Bordeaux mixture (copper-lime formulation) applied strictly before spring bud bursts.",
    preventativeMeasures: [
      "Disinfect all pruning shears thoroughly in 10% bleach after every prune cut.",
      "Prune woody species only during late mid-summer when warm dry wind seals cuts naturally.",
      "Select well-draining soils; waterlogged roots invite early bacterial vascular entry."
    ]
  }
];

export default function BotanistCodex({
  sidebarCollapsed,
  setSidebarCollapsed,
  setMobileSidebarOpen
}: BotanistCodexProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<string>("All");
  const [selectedPathogen, setSelectedPathogen] = useState<PathogenEntry>(CODEX_ENTRIES[0]);

  const filteredEntries = CODEX_ENTRIES.filter((entry) => {
    const matchesSearch = 
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      entry.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = activeType === "All" || entry.type === activeType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden font-sans">
      
      {/* Top Header Grid Area */}
      <div className="min-h-14 flex sticky top-0 z-10 bg-neutral-50/50 border-b border-neutral-200 py-3.5 px-4 md:px-6 shrink-0 justify-between items-center">
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
          <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest leading-none font-display">Scientific Botanist Codex</span>
        </div>
        <span className="text-[10px] text-emerald-600 font-mono font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">45,000+ Specimen Database</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left pane: Search and List entries */}
        <div className="w-full md:w-[350px] border-r border-neutral-200 bg-neutral-50/40 flex flex-col h-full shrink-0">
          
          {/* Search Box & filters */}
          <div className="p-4 border-b border-neutral-200 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search disease or scientific taxonomy..."
                className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-neutral-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-neutral-800"
              />
            </div>

            {/* Type Pills */}
            <div className="flex flex-wrap gap-1.5">
              {["All", "Fungal", "Bacterial", "Nutritional", "Pest"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveType(tab)}
                  className={`px-2 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-lg border transition-all ${
                    activeType === tab
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List Feed */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredEntries.map((entry) => {
              const isSelected = selectedPathogen.id === entry.id;
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedPathogen(entry)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                      : "bg-white border-transparent hover:bg-neutral-100 text-neutral-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-semibold truncate max-w-[200px]">{entry.name}</h4>
                    <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-md font-mono uppercase ${
                      entry.type === "Fungal" ? "bg-red-50 text-red-700 border border-red-100" :
                      entry.type === "Bacterial" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      entry.type === "Nutritional" ? "bg-yellow-50 text-yellow-700 border border-yellow-105" :
                      "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}>
                      {entry.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 italic font-mono truncate">{entry.scientificName}</p>
                </div>
              );
            })}

            {filteredEntries.length === 0 && (
              <div className="text-center py-12 px-4 text-neutral-400">
                <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs font-medium">No botanical entries match query</p>
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Entry detail read sheet */}
        <div className="hidden md:block flex-1 bg-white overflow-y-auto p-6 space-y-6">
          <div className="border-b border-neutral-150 pb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono tracking-widest font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                Pathogen Profile
              </span>
              <span className="text-[10px] font-mono font-semibold text-neutral-400">
                Frequency: {selectedPathogen.frequency}
              </span>
            </div>

            <h2 className="text-xl font-display font-bold text-neutral-900 tracking-tight">{selectedPathogen.name}</h2>
            <p className="text-sm font-mono text-neutral-500 italic mt-0.5">{selectedPathogen.scientificName}</p>
          </div>

          {/* Description Block */}
          <div className="space-y-2">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 border-b border-neutral-100 pb-1">
              <BookOpen className="w-4 h-4" />
              <span>Diagnostic Abstract</span>
            </h3>
            <p className="text-sm md:text-[15px] text-neutral-700 leading-relaxed font-sans">{selectedPathogen.description}</p>
          </div>

          {/* Pathology Symptoms List */}
          <div className="space-y-2 p-5 bg-neutral-50 border border-neutral-150 rounded-xl">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>Visible Cellular Symptoms</span>
            </h3>
            <ul className="space-y-2 pl-3 list-disc text-sm md:text-[15px] text-neutral-700 leading-relaxed">
              {selectedPathogen.symptoms.map((symp, i) => (
                <li key={i}>{symp}</li>
              ))}
            </ul>
          </div>

          {/* Clinical impact */}
          <div className="space-y-2">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 border-b border-neutral-100 pb-1">
              <Cpu className="w-4 h-4" />
              <span>Tissue Cellular Penetration Path</span>
            </h3>
            <p className="text-sm md:text-[15px] text-neutral-700 leading-relaxed font-sans">{selectedPathogen.cellularImpact}</p>
          </div>

          {/* Double Recipe Treatment boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Organic */}
            <div className="p-4 bg-emerald-50/35 border border-emerald-250 rounded-2xl space-y-2">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4" />
                <span>Organic Remediate Recipe</span>
              </h4>
              <p className="text-sm text-emerald-950 font-medium leading-relaxed">{selectedPathogen.organicRecipe}</p>
            </div>

            {/* Chemical */}
            <div className="p-4 bg-indigo-50/35 border border-indigo-250 rounded-2xl space-y-2">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-indigo-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Chemical / Clinical Prescriptive</span>
              </h4>
              <p className="text-sm text-indigo-950 font-medium leading-relaxed">{selectedPathogen.chemicalRecipe}</p>
            </div>

          </div>

          {/* Preventative checklist */}
          <div className="space-y-2">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 border-b border-neutral-100 pb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Preventative Protective Protocols</span>
            </h3>
            <div className="space-y-2 pt-1">
              {selectedPathogen.preventativeMeasures.map((measure, i) => (
                <div key={i} className="flex gap-2.5 items-start text-sm md:text-[15px] text-neutral-700 font-sans leading-relaxed">
                  <span className="text-[10px] font-mono text-emerald-600 mt-1.5">•</span>
                  <span>{measure}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
