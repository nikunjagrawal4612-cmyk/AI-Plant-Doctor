import React, { useState, useEffect } from "react";
import { Sparkles, AlertTriangle, X, Leaf, Menu, HelpCircle, Columns, Sidebar as SidebarIcon } from "lucide-react";
import Sidebar from "./components/Sidebar";
import PlantChatbot from "./components/PlantChatbot";
import CareReminders from "./components/CareReminders";
import DiseaseComparator from "./components/DiseaseComparator";
import AppsWorkspace from "./components/AppsWorkspace";
import BotanistCodex from "./components/BotanistCodex";
import { ChatSession, ChatMessage, HistoryItem } from "./types";

export default function App() {
  // Navigation tabs: unified chat layout is our primary home workspace
  const [currentTab, setCurrentTab] = useState<"chat" | "reminders" | "compare" | "apps" | "codex">("chat");
  const [language, setLanguage] = useState("English");

  // Core state of active sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Layout UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Collapsed desktop state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile drawer state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load chat sessions from client storage and migrate legacy items
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem("ai-plant-doctor-sessions-v1");
      if (storedSessions) {
        const parsed = JSON.parse(storedSessions) as ChatSession[];
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } else {
        // Look for older history to migrate cleanly
        const storedHistory = localStorage.getItem("ai-plant-doctor-history");
        if (storedHistory) {
          const legacyItems = JSON.parse(storedHistory) as HistoryItem[];
          if (legacyItems.length > 0) {
            const migrated: ChatSession[] = legacyItems.map((item) => {
              const formattedTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              const userMsg: ChatMessage = {
                id: "user-" + item.id,
                role: "user",
                content: `Please diagnose this leaf tissue specimen.`,
                timestamp: formattedTime,
                imageData: item.imageDatas && item.imageDatas.length > 0 ? item.imageDatas[0] : undefined,
                images: item.imageDatas,
              };

              const assistantContent = `I have successfully scanned and diagnosed your **${item.report.plantType}** specimen. Here is my complete botanical clinical report, treatment schedules, and prevention guidelines: \n\n**Diagnosis Match**: ${item.report.issueName} (${item.report.confidence}% precision)\n**Severity Index**: ${item.report.severity}`;

              const assistantMsg: ChatMessage = {
                id: "assistant-" + item.id,
                role: "assistant",
                content: assistantContent,
                timestamp: formattedTime,
                imageData: item.imageDatas && item.imageDatas.length > 0 ? item.imageDatas[0] : undefined,
                report: item.report,
              };

              return {
                id: item.id,
                title: `${item.report.plantType} - ${item.report.issueName}`,
                timestamp: item.timestamp,
                messages: [userMsg, assistantMsg],
              };
            });

            setSessions(migrated);
            localStorage.setItem("ai-plant-doctor-sessions-v1", JSON.stringify(migrated));
            if (migrated.length > 0) {
              setActiveSessionId(migrated[0].id);
            }
            return;
          }
        }

        // Fresh installation welcome setup
        const freshId = "session-welcome";
        const introSession: ChatSession = {
          id: freshId,
          title: "Botanical Consultation",
          timestamp: new Date().toISOString(),
          messages: []
        };
        setSessions([introSession]);
        setActiveSessionId(freshId);
        localStorage.setItem("ai-plant-doctor-sessions-v1", JSON.stringify([introSession]));
      }
    } catch (e) {
      console.error("Failed loading chat sessions registry:", e);
    }
  }, []);

  // Set the active selected session
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setCurrentTab("chat");
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  // Instantly spins up a new fresh empty chat session while preserving history in sidebar (OpenAI ChatGPT Style)
  const handleNewChat = () => {
    const newSessionId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    const dateLabel = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
    
    const newSession: ChatSession = {
      id: newSessionId,
      title: `New Consult ${dateLabel}`,
      timestamp: new Date().toISOString(),
      messages: []
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSessionId);
    setCurrentTab("chat");
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
    localStorage.setItem("ai-plant-doctor-sessions-v1", JSON.stringify(updated));
  };

  // Safe removal of historic chats
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((sess) => sess.id !== id);
    setSessions(updated);
    localStorage.setItem("ai-plant-doctor-sessions-v1", JSON.stringify(updated));

    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        // Fallback welcome pad if all cleared
        const freshId = "session-fallback";
        const fallbackSession: ChatSession = {
          id: freshId,
          title: "Botanical Consultation",
          timestamp: new Date().toISOString(),
          messages: []
        };
        setSessions([fallbackSession]);
        setActiveSessionId(freshId);
        localStorage.setItem("ai-plant-doctor-sessions-v1", JSON.stringify([fallbackSession]));
      }
    }
  };

  const handleUpdateSessionMessages = (sessionId: string, messagesList: ChatMessage[]) => {
    const updated = sessions.map((sess) => {
      if (sess.id === sessionId) {
        // Dynamic re-titling if it is still named "New Consult"
        let reallocatedTitle = sess.title;
        if (sess.title.startsWith("New Consult")) {
          const reportFound = messagesList.find((m) => m.report !== undefined);
          if (reportFound?.report) {
            reallocatedTitle = `${reportFound.report.plantType} Diagnosis`;
          } else {
            const firstUserText = messagesList.find((m) => m.role === "user");
            if (firstUserText) {
              const textContent = firstUserText.content.trim().substring(0, 20);
              reallocatedTitle = textContent + (firstUserText.content.length > 20 ? "..." : "");
            }
          }
        }

        return {
          ...sess,
          title: reallocatedTitle,
          messages: messagesList,
        };
      }
      return sess;
    });

    setSessions(updated);
    localStorage.setItem("ai-plant-doctor-sessions-v1", JSON.stringify(updated));
  };

  const currentSession = sessions.find((s) => s.id === activeSessionId) || null;

  return (
    <div className="flex h-screen bg-white font-sans text-neutral-850 overflow-hidden relative">
      
      {/* Sliding Collapsible Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        isOpen={mobileSidebarOpen}
        setIsOpen={setMobileSidebarOpen}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Viewpanel Area (ChatGPT layout) */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden bg-white relative transition-all duration-300 ease-in-out ${
        mobileSidebarOpen ? "translate-x-[260px] md:translate-x-0" : "translate-x-0"
      }`}>
        
        {/* Global Error Banner */}
        {apiError && (
          <div className="absolute top-4 right-4 max-w-md p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 z-50 shadow-md animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-red-800">Operational Disrupt</h4>
              <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">{apiError}</p>
            </div>
            <button onClick={() => setApiError(null)} className="p-1 text-red-400 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic viewport panel */}
        <div className="flex-1 overflow-hidden font-sans">
          {currentTab === "chat" ? (
            <PlantChatbot
              key={activeSessionId || "default-chat"}
              language={language}
              activeSession={currentSession}
              onUpdateSessionMessages={handleUpdateSessionMessages}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              setMobileSidebarOpen={setMobileSidebarOpen}
              onNewChat={handleNewChat}
            />
          ) : currentTab === "reminders" ? (
            <div className="h-full flex flex-col bg-white overflow-hidden">
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
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest leading-none font-display">Care Calendars Workspace</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-mono font-semibold">Sync Local</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CareReminders />
              </div>
            </div>
          ) : currentTab === "compare" ? (
            <div className="h-full flex flex-col bg-white overflow-hidden">
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
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest leading-none font-display">Pathology Contrast Board</span>
                </div>
                <span className="text-[10px] text-amber-600 font-mono font-semibold">Precision Compare</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <DiseaseComparator />
              </div>
            </div>
          ) : currentTab === "apps" ? (
            <AppsWorkspace
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              setMobileSidebarOpen={setMobileSidebarOpen}
            />
          ) : (
            <BotanistCodex
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              setMobileSidebarOpen={setMobileSidebarOpen}
            />
          )}
        </div>

      </div>

    </div>
  );
}
