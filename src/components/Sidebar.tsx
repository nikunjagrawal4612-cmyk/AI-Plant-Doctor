import React, { useState } from "react";
import { 
  SquarePen, 
  Search, 
  Folder, 
  Library, 
  Grid, 
  Cpu, 
  MoreHorizontal, 
  Trash2, 
  X, 
  MessageSquare,
  Sidebar as SidebarIcon,
  Globe
} from "lucide-react";
import { ChatSession } from "../types";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isOpen: boolean; // Mobile Drawer Open state
  setIsOpen: (open: boolean) => void; // Mobile Drawer Toggle
  currentTab: "chat" | "reminders" | "compare" | "apps" | "codex";
  setCurrentTab: (tab: "chat" | "reminders" | "compare" | "apps" | "codex") => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  sidebarCollapsed,
  setSidebarCollapsed,
  isOpen,
  setIsOpen,
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCodexInfo, setShowCodexInfo] = useState(false);

  // Group sessions by chronological dates
  const getFilteredSessions = () => {
    if (!searchQuery.trim()) return sessions;
    return sessions.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredSessions = getFilteredSessions();

  const getGroupedSessions = () => {
    const today: ChatSession[] = [];
    const older: ChatSession[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    filteredSessions.forEach((item) => {
      const itemTime = new Date(item.timestamp).getTime();
      if (itemTime >= startOfToday) {
        today.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, older };
  };

  const { today, older } = getGroupedSessions();

  const renderHistoryGroup = (items: ChatSession[], label: string) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-[11px] font-semibold text-neutral-400 px-3 mb-1.5 tracking-tight">
          {label}
        </h3>
        <div className="space-y-0.5">
          {items.map((item) => {
            const isActive = currentTab === "chat" && activeSessionId === item.id;
            
            return (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentTab("chat");
                  onSelectSession(item.id);
                  setIsOpen(false); // Close mobile drawer if clicked
                }}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 text-xs ${
                  isActive
                    ? "bg-[#f3f3f3] text-[#0d0d0d] font-semibold"
                    : "text-neutral-600 hover:bg-[#f3f3f3] hover:text-neutral-900"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare className="w-4 h-4 text-neutral-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-neutral-700 font-medium">
                      {item.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pl-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(item.id, e);
                    }}
                    className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Semi-transparent backdrop on mobile when drawer is open */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-neutral-900/40 z-45 md:hidden backdrop-blur-xs transition-opacity cursor-pointer animate-fade-in"
        />
      )}

      {/* Main Sidebar (Collapsible Flex Sidebar on all viewports) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen bg-[#f9f9f9] border-neutral-300 flex flex-col justify-between transition-transform duration-300 md:transition-all ease-in-out shrink-0 overflow-hidden md:relative md:sticky md:top-0 md:left-0 md:translate-x-0 ${
          isOpen ? "translate-x-0 border-r" : "-translate-x-full border-r-0 md:border-r"
        } ${
          sidebarCollapsed 
            ? "md:w-0 md:min-w-0 md:max-w-0 md:border-r-0 md:opacity-0 md:invisible" 
            : "md:w-[260px] md:min-w-[260px] md:max-w-[260px] md:opacity-100 md:visible"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden w-[260px] shrink-0">
          
          {/* Sidebar Brand Header */}
          <div className="px-4 py-3.5 flex items-center justify-between bg-[#f9f9f9] shrink-0">
            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:bg-neutral-100/60 p-1 px-1.5 rounded-lg select-none relative"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              <span className="font-display font-medium text-[#0d0d0d] text-[15px] tracking-tight leading-none">
                AI Plant Doctor
              </span>
              <span className="text-[10px] text-neutral-400 font-bold mt-0.5">▼</span>

              {/* Quick Language Dropdown List */}
              {showLanguageMenu && (
                <div className="absolute top-8 left-0 z-50 bg-white border border-neutral-200 rounded-xl shadow-lg p-1.5 w-48 text-xs text-neutral-700 animate-fade-in font-sans">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                    Select Language
                  </div>
                  {[
                    { val: "English", flag: "🇬🇧", label: "English" },
                    { val: "Español", flag: "🇪🇸", label: "Español" },
                    { val: "Français", flag: "🇫🇷", label: "Français" },
                    { val: "Deutsch", flag: "🇩🇪", label: "Deutsch" },
                    { val: "Hindi", flag: "🇮🇳", label: "हिन्दी (Hindi)" }
                  ].map((lang) => (
                    <button
                      key={lang.val}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage(lang.val);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-neutral-50 transition-colors ${
                        language === lang.val ? "bg-neutral-100 text-neutral-900 font-semibold" : ""
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Hide Sidebar Icon Button (Collapse) */}
              <button
                onClick={() => {
                  setSidebarCollapsed(true);
                  setIsOpen(false);
                }}
                className="flex p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-[#eaeaea] rounded-lg cursor-pointer transition-colors"
                title="Hide Sidebar"
              >
                <SidebarIcon className="w-4.5 h-4.5 text-neutral-550" />
              </button>
            </div>
          </div>

          {/* ChatGPT Style Navigation Options */}
          <div className="px-2 pb-1 bg-[#f9f9f9] shrink-0 space-y-0.5">
            {/* New chat */}
            <button
              onClick={() => {
                setCurrentTab("chat");
                onNewChat();
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                currentTab === "chat" && activeSessionId === "session-welcome"
                  ? "bg-[#f3f3f3] text-[#0d0d0d]"
                  : "text-neutral-700 hover:bg-[#f3f3f3] hover:text-[#0d0d0d]"
              }`}
            >
              <div className="flex items-center gap-3">
                <SquarePen className="w-4.5 h-4.5 text-neutral-600" />
                <span>New chat</span>
              </div>
            </button>

            {/* Search Chats Trigger */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                showSearchInput ? "bg-[#f3f3f3]/60" : "text-neutral-700 hover:bg-[#f3f3f3] hover:text-[#0d0d0d]"
              }`}
            >
              <Search className="w-4.5 h-4.5 text-neutral-600" />
              <span>Search chats</span>
            </button>

            {/* In-app active search filter bar */}
            {showSearchInput && (
              <div className="px-2 py-1 shrink-0 animate-fade-in">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter consult history..."
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-neutral-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0d0d0d]/30 text-neutral-800 font-sans"
                />
              </div>
            )}

            {/* Projects -> Pathology Comparator Tab */}
            <button
              onClick={() => {
                setCurrentTab("compare");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                currentTab === "compare"
                  ? "bg-[#f3f3f3] text-[#0d0d0d]"
                  : "text-neutral-700 hover:bg-[#f3f3f3] hover:text-[#0d0d0d]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder className="w-4.5 h-4.5 text-neutral-600" />
                <span>Projects</span>
              </div>
              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-md font-mono uppercase font-bold tracking-wider">Compare</span>
            </button>

            {/* Library -> Care Reminders Tab */}
            <button
              onClick={() => {
                setCurrentTab("reminders");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                currentTab === "reminders"
                  ? "bg-[#f3f3f3] text-[#0d0d0d]"
                  : "text-neutral-700 hover:bg-[#f3f3f3] hover:text-[#0d0d0d]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Library className="w-4.5 h-4.5 text-neutral-600" />
                <span>Library</span>
              </div>
              <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-md font-mono uppercase font-bold tracking-wider">Minder</span>
            </button>

            {/* Apps */}
            <button
              onClick={() => {
                setCurrentTab("apps");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                currentTab === "apps"
                  ? "bg-[#f3f3f3] text-[#0d0d0d]"
                  : "text-neutral-700 hover:bg-[#f3f3f3] hover:text-[#0d0d0d]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Grid className="w-4.5 h-4.5 text-neutral-600" />
                <span>Apps</span>
              </div>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded-md font-mono uppercase font-bold tracking-wider">Suite</span>
            </button>

            {/* Codex (Scientific/Botanical Dictionary) */}
            <button
              onClick={() => {
                setCurrentTab("codex");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                currentTab === "codex"
                  ? "bg-[#f3f3f3] text-[#0d0d0d]"
                  : "text-neutral-700 hover:bg-[#f3f3f3] hover:text-[#0d0d0d]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4.5 h-4.5 text-neutral-600" />
                <span>Codex</span>
              </div>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-md font-mono uppercase font-bold tracking-wider">Pro</span>
            </button>

            {/* More -> Languages Trigger Option */}
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                showLanguageMenu ? "bg-[#f3f3f3]/50" : "text-neutral-700 hover:bg-[#f3f3f3] hover:text-[#0d0d0d]"
              }`}
            >
              <MoreHorizontal className="w-4.5 h-4.5 text-neutral-600" />
              <span className="flex-1 text-left">More</span>
              <span className="text-[10px] text-neutral-400 font-mono uppercase bg-neutral-200 px-1.5 py-0.5 rounded-md font-bold tracking-wider">{language}</span>
            </button>

            {/* Hide History dedicated button */}
            <button
              onClick={() => {
                setSidebarCollapsed(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#0d0d0d] hover:bg-[#f3f3f3] hover:text-[#0d0d0d] transition-colors cursor-pointer"
              title="Hide Sidebar"
            >
              <SidebarIcon className="w-4.5 h-4.5 text-neutral-600" />
              <span>Hide Sidebar</span>
            </button>
          </div>

          <div className="border-t border-[#e3e3e3]/70 my-2"></div>

          {/* Past consultation history listings (ChatGPT past consult structure) */}
          <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-none">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  No consults found
                </p>
              </div>
            ) : (
              <>
                {renderHistoryGroup(today, "Today")}
                {renderHistoryGroup(older, "Previous consults")}
              </>
            )}
          </div>
        </div>

        {/* Brand User profile footlocker matching ChatGPT light theme screenshot exactly! */}
        <div className="border-t border-[#e3e3e3] bg-[#f9f9f9] p-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Soft clinical green custom initial sphere */}
            <div className="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-700 text-white flex items-center justify-center font-semibold text-sm font-mono select-none shadow-xs">
              N
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-neutral-800 truncate leading-none">
                nikunjagrawal4612@gmail.com
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 font-mono uppercase tracking-wide font-semibold">
                Free
              </p>
            </div>
            
            {/* Quick globe icon */}
            <div className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer" title={`Language: ${language}`} onClick={() => setShowLanguageMenu(true)}>
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
