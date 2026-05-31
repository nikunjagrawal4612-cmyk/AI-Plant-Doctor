export interface DiagnosticReport {
  status: "healthy" | "unhealthy";
  issueName: string;
  plantType: string;
  confidence: number;
  severity: "None" | "Low" | "Medium" | "High" | "Critical";
  symptoms: string[];
  causes: string[];
  organicTreatments: string[];
  chemicalTreatments: string[];
  homeRemedies: string[];
  soilNutrients: string;
  wateringAdvice: string;
  sunlightAdvice: string;
  prevention: string[];
  recoverySteps: string[];
  personalizedAnswer?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  imageData?: string; // Optional single base64 image attached to this message
  images?: string[]; // Optional multiple base64 images
  report?: DiagnosticReport; // Optional parsed diagnosis report associated with this message
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
  activeContext?: string;
}

export interface PlantReminder {
  id: string;
  plantName: string;
  taskType: "Water" | "Fertilize" | "Prune" | "Rotate";
  intervalDays: number;
  lastDoneDate: string;
  nextDueDate: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  fileNames: string[]; // Supports multiple leaf files
  imageDatas: string[]; // Multiple base64 data URIs
  report: DiagnosticReport;
  chatHistory?: ChatMessage[];
}
