import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Sparkles, Sprout, Trash2, HelpCircle, Check, Info } from "lucide-react";

interface UploadZoneProps {
  onImagesSelected: (base64List: string[], fileNames: string[]) => void;
  isAnalyzing: boolean;
  language: string;
}

// Light Mode ChatGPT-Style Demo cases with custom labels
const DEMO_CASES = [
  {
    id: "rose_rust",
    title: "Rust Fungi Specimen",
    plant: "English Rose Bush",
    severity: "Medium",
    desc: "Orange powder-like pustules coating the leaf underside.",
    fileName: "rose_leaf_rust.jpg",
    // Clean vector placeholder SVG
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23fff3ea'/><ellipse cx='50' cy='50' rx='25' ry='35' fill='%23e05a10' opacity='0.3'/><circle cx='40' cy='45' r='3' fill='%23b73e0e'/><circle cx='48' cy='52' r='4' fill='%23b73e0e'/><circle cx='55' cy='42' r='3' fill='%23b73e0e'/><circle cx='51' cy='61' r='4' fill='%23b73e0e'/><circle cx='42' cy='58' r='3' fill='%23b73e0e'/><path d='M50,15 Q50,50 50,85' stroke='%2322c55e' stroke-width='2' fill='none'/><path d='M50,50 Q25,35 20,40' stroke='%2322c55e' stroke-width='1.5' fill='none'/><path d='M50,60 Q75,45 80,50' stroke='%2322c55e' stroke-width='1.5' fill='none'/></svg>"
  },
  {
    id: "tomato_blight",
    title: "Late Blight Specimen",
    plant: "Roma Tomato Shrub",
    severity: "High",
    desc: "Dark water-soaked necrotic lesions on standard leaf surface.",
    fileName: "tomato_late_blight.jpg",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23fef2f2'/><ellipse cx='50' cy='50' rx='22' ry='33' fill='%23851c1c' opacity='0.25'/><path d='M50,15 Q50,50 50,85' stroke='%2315803d' stroke-width='2' fill='none'/><circle cx='42' cy='48' r='8' fill='%23450a0a' opacity='0.8'/><circle cx='58' cy='58' r='7' fill='%23450a0a' opacity='0.8'/><circle cx='50' cy='32' r='6' fill='%23450a0a' opacity='0.8'/></svg>"
  },
  {
    id: "iron_deficiency",
    title: "Iron Chlorosis Specimen",
    plant: "Gardenia Flower Jasmine",
    severity: "Low",
    desc: "Interveinal yellowing where leaves turn pale but veins stay dark green.",
    fileName: "gardenia_iron_chlorosis.jpg",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23fefcbf'/><ellipse cx='50' cy='50' rx='25' ry='35' fill='%23eab308' opacity='0.25'/><path d='M50,15 Q50,50 50,85' stroke='%23166534' stroke-width='2.5' fill='none'/><path d='M50,30 Q20,20 15,25' stroke='%23166534' stroke-width='1.5' fill='none'/><path d='M50,45 Q80,35 85,40' stroke='%23166534' stroke-width='1.5' fill='none'/><path d='M50,60 Q20,50 15,55' stroke='%23166534' stroke-width='1.5' fill='none'/><path d='M50,75 Q80,65 85,70' stroke='%23166534' stroke-width='1.5' fill='none'/></svg>"
  }
];

const DAILY_TIPS = [
  { text: "Morning sunlight hydration: Water plants early to allow ambient leaf surfaces to dry, preventing fungal spore incubation.", author: "Dr. Elena Vance" },
  { text: "Sanitize pruning shears with isopropyl alcohol before starting of next branch to suppress cross-pathological contamination.", author: "Botanist Mark" },
  { text: "Examine leaf undersides for fine webs; spider mites dwell in dry heat and can be washed away with gentle neem oil streams.", author: "Foliage Clinic" },
  { text: "Ensure adequate pot base drainage. Overwatering root rot represents over 65% of indoor houseplant mortalities.", author: "Soil Lab Expert" }
];

interface ImageQueueItem {
  id: string;
  base64: string;
  name: string;
  size: string;
}

export default function UploadZone({ onImagesSelected, isAnalyzing, language }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [tempQueue, setTempQueue] = useState<ImageQueueItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTipIdx, setActiveTipIdx] = useState(0);

  const rotateTip = () => {
    setActiveTipIdx((prev) => (prev + 1) % DAILY_TIPS.length);
  };

  const processFiles = (files: FileList) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not a valid image file. Please use PNG, JPEG, WEBP or HEIC.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const imageResult = reader.result;
          
          // Image downscaler & optimizer logic in background to keep stream ultra fast
          const img = new Image();
          img.onload = () => {
            const maxDimension = 900; // Optimal width for flash processing
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
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, 0, 0, width, height);

              const compressedBase64 = canvas.toDataURL("image/jpeg", 0.82);
              
              const sizeInKb = Math.round((compressedBase64.length * 3) / 4 / 1024);
              const newItem: ImageQueueItem = {
                id: Math.random().toString(36).substring(2, 9),
                base64: compressedBase64,
                name: file.name,
                size: `${sizeInKb} KB`
              };

              setTempQueue((prev) => [...prev, newItem]);
            }
          };
          img.src = imageResult;
        }
      };
      reader.readAsDataURL(file);
    });
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
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const selectDevicePhotos = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveQueueItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTempQueue((prev) => prev.filter((it) => it.id !== id));
  };

  const handleTriggerAnalysis = () => {
    if (tempQueue.length === 0) return;
    
    // Pass arrays to parents
    const base64List = tempQueue.map((it) => it.base64);
    const names = tempQueue.map((it) => it.name);
    
    onImagesSelected(base64List, names);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 md:py-12 text-neutral-800">
      
      {/* OpenAI Elegant Intro Grid */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-250 rounded-full text-emerald-800 text-[11px] font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Agricultural Expert {language !== "English" ? `(${language})` : ""}</span>
        </div>
        <h2 className="font-display font-medium text-4xl text-neutral-900 tracking-tight leading-tight">
          Plant pathology diagnosis engine
        </h2>
        <p className="text-neutral-500 mt-2.5 text-xs max-w-xl mx-auto leading-relaxed">
          Upload leaf photographs of plants, flowers, or crops. Our smart systems analyze tissue anomalies, identify structural disease, and detail organic cure plans instantly.
        </p>
      </div>

      {/* Main Drag-and-Drop Area configured for ChatGPT Clean look */}
      <div
        id="plant-upload-box"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={tempQueue.length === 0 ? selectDevicePhotos : undefined}
        className={`relative group bg-transparent border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-200 ${
          tempQueue.length === 0 ? "cursor-pointer border-neutral-200 hover:border-emerald-500/50" : "border-neutral-100"
        } ${
          isDragActive ? "border-emerald-500 bg-emerald-50/10 scale-[1.005]" : "border-neutral-200"
        } ${isAnalyzing ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*"
          onChange={handleFileInput}
        />

        {tempQueue.length === 0 ? (
          // Default empty slate style
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-150 flex items-center justify-center text-neutral-600 transition-all duration-150 mb-5">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>

            <h3 className="font-display font-semibold text-neutral-800 text-lg">
              Upload Image
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
              Drag-and-drop leaf photos here, or click to browse files from your device.
            </p>

            <button
              type="button"
              className="mt-6 px-6 py-3 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all duration-150 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-neutral-950 font-sans"
            >
              <Upload className="w-4 h-4 text-neutral-300" />
              <span>Browse Photos from Device</span>
            </button>
          </div>
        ) : (
          // Dynamic Batch Upload Queue view with thumbnails
          <div className="text-left">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-5">
              <div>
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider font-display">
                  Image Upload Queue
                </span>
                <span className="ml-2 text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-mono font-semibold">
                  {tempQueue.length} {tempQueue.length === 1 ? "Image" : "Images"} Ready
                </span>
              </div>
              <button
                onClick={selectDevicePhotos}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                + Add More
              </button>
            </div>

            {/* Thumbnail selector grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {tempQueue.map((item) => (
                <div
                  key={item.id}
                  className="relative group/thumb bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden aspect-square flex flex-col justify-between p-2"
                >
                  <img
                    src={item.base64}
                    alt={item.name}
                    className="w-full h-[70%] object-contain bg-neutral-100 rounded-lg border border-neutral-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex items-center justify-between text-[10px] mt-1 font-mono">
                    <span className="truncate text-neutral-500 max-w-[65%]">{item.name}</span>
                    <span className="text-neutral-400 shrink-0">{item.size}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemoveQueueItem(item.id, e)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white shadow-xs opacity-90 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Execute multi-image diagnostic scan button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-neutral-100 pt-5">
              <button
                onClick={handleTriggerAnalysis}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-100" />
                <span>Upload Image & Start Batch Scan</span>
              </button>
              <button
                onClick={() => setTempQueue([])}
                className="w-full sm:w-auto px-4 py-3 border border-neutral-205 text-neutral-600 hover:bg-neutral-50 font-semibold text-xs rounded-xl"
              >
                Clear Queue
              </button>
              <div className="text-[10px] text-neutral-400 font-mono text-center sm:text-left mt-2 sm:mt-0 sm:ml-auto">
                ⚡ Downscaled & optimized natively for instantaneous processing
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive side section for daily plant suggestions & seasonal tips */}
      <div className="mt-8 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-8 border-t border-neutral-100 pt-5 flex items-start gap-4">
          <div className="pt-1.5 text-emerald-700 shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest font-display">
                Botanist Clinic Daily Suggestion
              </h4>
              <button
                onClick={rotateTip}
                className="text-[10px] text-emerald-700 hover:underline font-mono font-bold"
              >
                Next Tip →
              </button>
            </div>
            <p className="text-xs text-neutral-700 italic leading-relaxed">
              "{DAILY_TIPS[activeTipIdx].text}"
            </p>
            <p className="text-[10px] text-neutral-400 mt-1.5 font-semibold font-mono">
              — {DAILY_TIPS[activeTipIdx].author}, Botanical Gardens PATH Team
            </p>
          </div>
        </div>

        <div className="md:col-span-4 border-t border-neutral-100 pt-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-neutral-800 mb-1">
              <Info className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold font-display uppercase tracking-wider">Reminder</h4>
            </div>
            <p className="text-[11px] text-neutral-500 leading-normal">
              Keep your leaf photos sharp and centered. Crop shadows can distort pigment checks.
            </p>
          </div>
          <p className="text-[10px] text-neutral-400 font-mono mt-3">
            Local Time: 5/29 6:52 AM
          </p>
        </div>
      </div>

      {/* Demo cases showcase for quick examination trials */}
      <div className="mt-10 border-t border-neutral-100 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <h3 className="font-display font-semibold text-xs text-neutral-500 uppercase tracking-widest">
            Don't have a leaf? Try an instant mock scenario
          </h3>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {DEMO_CASES.map((demo) => (
            <div
              key={demo.id}
              onClick={() => {
                if (!isAnalyzing) {
                  // Direct load demo case for instant review
                  const mockQueueItem: ImageQueueItem = {
                    id: demo.id,
                    base64: demo.image,
                    name: demo.fileName,
                    size: "24 KB"
                  };
                  setTempQueue([mockQueueItem]);
                }
              }}
              className="py-4 hover:bg-neutral-50/50 cursor-pointer transition-all duration-200 flex flex-col justify-between border-t border-neutral-100"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-neutral-500 font-mono">
                    {demo.plant}
                  </span>
                  <span className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                    demo.severity === "High" ? "bg-red-50 text-red-700" :
                    demo.severity === "Medium" ? "bg-amber-50 text-amber-700" : "bg-neutral-50 text-neutral-700"
                  }`}>
                    {demo.severity} Urgent
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-neutral-800 mb-1">{demo.title}</h4>
                <p className="text-[11px] text-neutral-400 leading-normal">{demo.desc}</p>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold hover:underline mt-4 block">
                Load Scenario →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
