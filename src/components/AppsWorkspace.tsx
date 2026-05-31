import React, { useState } from "react";
import { 
  Calculator, 
  Cpu, 
  Sun, 
  Droplet, 
  Thermometer, 
  Activity, 
  BarChart3, 
  AlertCircle, 
  CheckCircle2, 
  Percent,
  Sidebar as SidebarIcon,
  Menu
} from "lucide-react";

interface AppsWorkspaceProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export default function AppsWorkspace({
  sidebarCollapsed,
  setSidebarCollapsed,
  setMobileSidebarOpen
}: AppsWorkspaceProps) {
  // Widget 1: Watering Estimator State
  const [potSize, setPotSize] = useState<number>(6); // inches
  const [plantType, setPlantType] = useState<string>("Foliage"); // Succulent, Foliage, Flowering, Herb
  const [sunlight, setSunlight] = useState<string>("Indirect"); // Low, Indirect, Direct
  const [temp, setTemp] = useState<number>(72); // Fahrenheit

  // Widget 2: Grow Environment Simulator (IoT)
  const [soilMoisture, setSoilMoisture] = useState<number>(45); // %
  const [humidity, setHumidity] = useState<number>(55); // %
  const [ambientLight, setAmbientLight] = useState<number>(350); // FC (Foot candles)
  const [roomTemp, setRoomTemp] = useState<number>(68); // °F

  // Widget 3: Active Apps Dashboard Active Subtab
  const [activeWidgetTab, setActiveWidgetTab] = useState<"estimator" | "iot" | "charts">("estimator");

  // Estimator logic
  const calculateWaterRequirements = () => {
    let baseVolume = potSize * 50; // ml base
    
    if (plantType === "Succulent") baseVolume *= 0.3;
    else if (plantType === "Flowering") baseVolume *= 1.2;
    else if (plantType === "Herb") baseVolume *= 1.4;

    if (sunlight === "Low") baseVolume *= 0.7;
    else if (sunlight === "Direct") baseVolume *= 1.35;

    if (temp > 80) baseVolume *= 1.25;
    else if (temp < 60) baseVolume *= 0.75;

    return Math.round(baseVolume);
  };

  const getWateringFrequency = () => {
    if (plantType === "Succulent") return "Every 15-20 days (Let soil completely dry)";
    if (plantType === "Foliage") return "Every 7-10 days (Top 2 inches dry)";
    if (plantType === "Flowering") return "Every 5-7 days (Keep moderately damp)";
    return "Every 3-5 days (Consistent hydration required)";
  };

  // Live Environment Status Logic based on slider values
  const getSimulatedHealthStatus = () => {
    if (soilMoisture < 20) {
      return {
        status: "Critical Underwatering",
        color: "text-red-600 bg-red-50 border-red-200",
        advice: "DANGER: Leaf tissue cellular collapse will begin. Water immediately!"
      };
    }
    if (soilMoisture > 85) {
      return {
        status: "Critical Overwatering",
        color: "text-amber-600 bg-amber-50 border-amber-200",
        advice: "DANGER: Root rot pathogens (Pythium species) flourish in fully anaerobic saturated soils."
      };
    }
    if (roomTemp > 90) {
      return {
        status: "Heat Stress Anomalies",
        color: "text-orange-600 bg-orange-50 border-orange-200",
        advice: "High respiration rate. Increase misting shade coverage and relative humidity."
      };
    }
    if (humidity < 30) {
      return {
        status: "Humid Deficiency",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        advice: "Tip burning likely. Use pebble trays or a room humidifier to boost humidity to 50%+."
      };
    }
    return {
      status: "Optimal Climate Equilibrium",
      color: "text-emerald-700 bg-emerald-50 border-emerald-100",
      advice: "Conditions are fully nominal. Tissue photosynthesis operates at maximum physiological rate."
    };
  };

  const statusObj = getSimulatedHealthStatus();

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden font-sans">
      
      {/* Top Header Matching the design specification */}
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
          <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest leading-none font-display">Companion Widgets Room</span>
        </div>
        <span className="text-[10px] text-indigo-600 font-mono font-semibold uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Apps Suite</span>
      </div>

      {/* Main Body view */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">
        
        {/* Navigation Tabs bar inside the workspace */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveWidgetTab("estimator")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeWidgetTab === "estimator"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Water-Feed Estimator</span>
          </button>
          <button
            onClick={() => setActiveWidgetTab("iot")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeWidgetTab === "iot"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>IoT Sensors Simulator</span>
          </button>
          <button
            onClick={() => setActiveWidgetTab("charts")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeWidgetTab === "charts"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Crop Diagnostics Stats</span>
          </button>
        </div>

        {/* Content Tabs Switcher */}
        {activeWidgetTab === "estimator" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Input Form Card */}
            <div className="p-5 border border-neutral-200 bg-neutral-50/50 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-neutral-850 text-[15px] flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Watering Formulation parameters</span>
              </h3>
              
              <div className="space-y-3">
                {/* Pot size */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Pot Diameter: {potSize} inches ({Math.round(potSize * 2.54)} cm)
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={potSize}
                    onChange={(e) => setPotSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-650"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>Small Cup (3")</span>
                    <span>Large Tub (20")</span>
                  </div>
                </div>

                {/* Plant Category selection */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Plant Specimen Genus Category
                  </label>
                  <select
                    value={plantType}
                    onChange={(e) => setPlantType(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Succulent">Succulent & Cactus (e.g. Aloe, Jade, Snake Plant)</option>
                    <option value="Foliage">Leafy Tropical Foliage (e.g. Monstera, Calathea, Philodendron)</option>
                    <option value="Flowering">Flowering Shrub (e.g. English Rose, Gardenia, Jasmine)</option>
                    <option value="Herb">Kitchen Herbs / Vegetable Crop (e.g. Tomato, Basil, Mint)</option>
                  </select>
                </div>

                {/* Light Condition */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Sunlight Radiation exposure
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Low", "Indirect", "Direct"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSunlight(level)}
                        className={`py-1.5 text-xs font-medium rounded-lg border transition-all text-center ${
                          sunlight === level
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ambient Temperature */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Approximate Ambient Room Temp: {temp}°F ({Math.round((temp - 32) * 5/9)}°C)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="2"
                    value={temp}
                    onChange={(e) => setTemp(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-650"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>Cool (50°F)</span>
                    <span>Tropical Hot (100°F)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Estimations Output report */}
            <div className="p-6 border border-neutral-200 bg-white rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Dosage Recommendation Report</span>
                <h4 className="font-display font-medium text-[#0d0d0d] text-lg mt-1 mb-4">Calculated Clinical Volume</h4>
                
                <div className="bg-emerald-50 px-5 py-6 rounded-2xl border border-emerald-100 text-center mb-5">
                  <span className="text-sm font-semibold text-emerald-700 block mb-1">Target Watering Dosage</span>
                  <span className="text-3xl font-display font-bold text-emerald-900 tracking-tight">{calculateWaterRequirements()} ml</span>
                  <span className="text-[10px] text-neutral-400 block mt-2">({(calculateWaterRequirements() * 0.0338).toFixed(1)} US fl. oz) per dose</span>
                </div>

                <div className="space-y-3.5 text-xs text-neutral-600">
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="font-medium text-neutral-500">Watering Frequency</span>
                    <span className="font-semibold text-neutral-800">{getWateringFrequency()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="font-medium text-neutral-500">Method</span>
                    <span className="font-semibold text-emerald-700">Drench until runoff draining base</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100">
                    <span className="font-medium text-neutral-500">Water Quality</span>
                    <span className="font-semibold text-neutral-800">Filtered Rainwater or Decalcinated Tap</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 p-3.5 bg-neutral-50 border border-neutral-150 rounded-xl text-[11px] text-neutral-500 flex gap-2.5 items-start mt-4">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">These estimates reflect typical crop transpiration levels. Always feel soil moisture (finger-depth method) before administering irrigation.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: IoT Simulator */}
        {activeWidgetTab === "iot" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl text-xs flex gap-3">
              <Cpu className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Simulate IoT Multi-Sensor Wireless Probes</p>
                <p className="text-indigo-600 mt-0.5">Drag the sliders below to emulate real-time biological telemetry. View instantaneous risk alerts compiled dynamically by our diagnostic engine.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telemetry Sliders Card */}
              <div className="p-5 border border-neutral-200 rounded-2xl bg-[#fdfdfd] space-y-4">
                <h3 className="font-display font-semibold text-neutral-800 text-[14px] uppercase tracking-wide">Live Soil & Air Telemetry</h3>
                
                <div className="space-y-4">
                  {/* Soil Moisture */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-600 flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-blue-500" />
                        Soil Moisture
                      </span>
                      <span className="font-mono font-bold text-neutral-800">{soilMoisture}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={soilMoisture}
                      onChange={(e) => setSoilMoisture(parseInt(e.target.value))}
                      className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Relative Humidity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-600 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-purple-500" />
                        Relative Air Humidity
                      </span>
                      <span className="font-mono font-bold text-neutral-800">{humidity}% RH</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={humidity}
                      onChange={(e) => setHumidity(parseInt(e.target.value))}
                      className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Room Temp */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-600 flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                        Local Temperature
                      </span>
                      <span className="font-mono font-bold text-neutral-800">{roomTemp}°F</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="110"
                      value={roomTemp}
                      onChange={(e) => setRoomTemp(parseInt(e.target.value))}
                      className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Incident light */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-600 flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        Photosynthetic Light
                      </span>
                      <span className="font-mono font-bold text-neutral-800">{ambientLight} FC</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="1200"
                      value={ambientLight}
                      onChange={(e) => setAmbientLight(parseInt(e.target.value))}
                      className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                  </div>
                </div>
              </div>

              {/* Feed/Diagnostic Output Card */}
              <div className={`p-6 border rounded-2xl flex flex-col justify-between transition-colors duration-300 ${statusObj.color}`}>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/50 block">SIMULATOR ANALYTICS</span>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold block uppercase tracking-tight opacity-75">Diagnosed State</span>
                    <h4 className="text-xl font-display font-extrabold mt-0.5 leading-none">{statusObj.status}</h4>
                  </div>

                  <div className="p-3 bg-white/60 backdrop-blur-xs rounded-xl border border-black/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-0.5">Clinical Remedy Action</span>
                    <p className="text-xs font-medium text-neutral-800 leading-relaxed">{statusObj.advice}</p>
                  </div>
                </div>

                <div className="border-t border-black/10 pt-4 mt-6 text-2xs text-black/40 flex items-center justify-between">
                  <span>SENSORS: WIRELESS NODE 1A</span>
                  <span>ONLINE & CALIBRATED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Crop Diagnostics Stats */}
        {activeWidgetTab === "charts" && (
          <div className="space-y-6 animate-fade-in">
            {/* Charts Visual Overview */}
            <div className="p-5 border border-neutral-200 rounded-2xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Aggregate Consult Pathology Stats</span>
              <h4 className="font-display font-semibold text-neutral-800 text-[15px] mt-0.5 mb-5">Current Season Global Pathology Distribution (N=45K specimens)</h4>
              
              <div className="space-y-4">
                {[
                  { name: "Late Blight / Mildew Spores", count: 1845, percent: 41, color: "bg-red-500 text-red-700 bg-red-100" },
                  { name: "Iron Chlorosis / Nitrogen Lockout", count: 1120, percent: 25, color: "bg-amber-500 text-amber-700 bg-amber-100" },
                  { name: "Rust Pathological Spores", count: 810, percent: 18, color: "bg-orange-500 text-orange-700 bg-orange-100" },
                  { name: "Spider Mites / Fungal Canker", count: 725, percent: 16, color: "bg-purple-500 text-purple-700 bg-purple-100" }
                ].map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-neutral-700">{item.name}</span>
                      <span className="font-mono font-bold text-neutral-900">{item.count} samples ({item.percent}%)</span>
                    </div>
                    {/* SVG/Tailwind Progress bar representing clean data visualization */}
                    <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.color.split(" ")[0]} transition-all duration-500`}
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick summary footer card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-neutral-200 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Total Diagnostic Runs</span>
                <p className="text-xl font-bold text-neutral-800 mt-1 font-mono">1,142</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Average Confidence Score</span>
                <p className="text-xl font-bold text-emerald-600 mt-1 font-mono">94.8%</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Solved Treatment Rate</span>
                <p className="text-xl font-bold text-[#0d0d0d] mt-1 font-mono">87.3%</p>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
