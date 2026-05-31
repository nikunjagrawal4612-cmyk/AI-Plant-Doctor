import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Leaf, Clock, Check, Bell, Droplet, Sprout, Scissors, RotateCw, Sparkles } from "lucide-react";
import { PlantReminder } from "../types";

export default function CareReminders() {
  const [reminders, setReminders] = useState<PlantReminder[]>([]);
  
  // Custom form state
  const [plantName, setPlantName] = useState("");
  const [taskType, setTaskType] = useState<"Water" | "Fertilize" | "Prune" | "Rotate">("Water");
  const [intervalDays, setIntervalDays] = useState(3);
  const [showAddForm, setShowAddForm] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(false);

  // Load from localstorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ai-plant-doctor-reminders");
      if (stored) {
        setReminders(JSON.parse(stored));
      } else {
        const initialReminders: PlantReminder[] = [
          {
            id: "rem-1",
            plantName: "Fiddle Leaf Fig",
            taskType: "Water",
            intervalDays: 7,
            lastDoneDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            nextDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            id: "rem-2",
            plantName: "Monstera Adansonii",
            taskType: "Fertilize",
            intervalDays: 14,
            lastDoneDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            nextDueDate: new Date().toISOString().split('T')[0] // Is due today!
          },
          {
            id: "rem-3",
            plantName: "Satin Pothos Ivy",
            taskType: "Rotate",
            intervalDays: 15,
            lastDoneDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            nextDueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Overdue!
          }
        ];
        setReminders(initialReminders);
        localStorage.setItem("ai-plant-doctor-reminders", JSON.stringify(initialReminders));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveReminders = (newReminders: PlantReminder[]) => {
    setReminders(newReminders);
    try {
      localStorage.setItem("ai-plant-doctor-reminders", JSON.stringify(newReminders));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantName.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextDue = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newRem: PlantReminder = {
      id: Math.random().toString(36).substring(2, 9),
      plantName,
      taskType,
      intervalDays,
      lastDoneDate: todayStr,
      nextDueDate: nextDue
    };

    const updated = [...reminders, newRem];
    saveReminders(updated);
    
    // Clear form inputs
    setPlantName("");
    setTaskType("Water");
    setIntervalDays(3);
    setShowAddForm(false);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((it) => it.id !== id);
    saveReminders(updated);
  };

  const handleCompleteTask = (id: string) => {
    // Play satisfying tick noise
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      // Natural bird-like chirp or sweet tone completed cue
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
      
      setAudioFeedback(true);
      setTimeout(() => setAudioFeedback(false), 800);
    } catch (err) {
      console.log("Audio simulation allowed only on customer gestures");
    }

    const updated = reminders.map((rem) => {
      if (rem.id === id) {
        const curDate = new Date().toISOString().split('T')[0];
        const nextDate = new Date(Date.now() + rem.intervalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return {
          ...rem,
          lastDoneDate: curDate,
          nextDueDate: nextDate
        };
      }
      return rem;
    });

    saveReminders(updated);
  };

  const getTaskIcon = (type: "Water" | "Fertilize" | "Prune" | "Rotate") => {
    switch (type) {
      case "Water": return <Droplet className="w-4 h-4 text-blue-600" />;
      case "Fertilize": return <Sprout className="w-4 h-4 text-emerald-600" />;
      case "Prune": return <Scissors className="w-4 h-4 text-red-500" />;
      case "Rotate": return <RotateCw className="w-4 h-4 text-amber-500" />;
    }
  };

  // Sort reminders so overdue / due tasks appear first
  const sortedReminders = [...reminders].sort((a, b) => {
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-neutral-800">
      
      {/* Header lockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="font-display font-semibold text-lg text-neutral-950">
              Plant care schedulers & reminders
            </h3>
          </div>
          <p className="text-xs text-neutral-500">
            Configure periodic care checks (irrigation, mineral fertilization, pruning) and keep foliage healthy.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="sm:w-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Add Task Reminder"}</span>
        </button>
      </div>

      {audioFeedback && (
        <div className="mb-4 bg-emerald-50 border border-emerald-250 rounded-xl px-4 py-2.5 text-xs text-emerald-800 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Task completed successfully! Nice watering routine! Sweet audio played.</span>
        </div>
      )}

      {/* Creation form */}
      {showAddForm && (
        <div className="mb-8 p-5 bg-neutral-50 border border-neutral-200 rounded-2xl animate-fade-in">
          <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-4 font-display">
            Schedule New Chore
          </h4>
          <form onSubmit={handleCreateReminder} className="grid sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                Plant Name
              </label>
              <input
                type="text"
                required
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                placeholder="e.g. English Ivy, Rose, Ficus"
                className="w-full bg-white text-xs border border-neutral-250 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                className="w-full bg-white text-xs border border-neutral-250 rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="Water">💧 Water Plant</option>
                <option value="Fertilize">🧪 Add Fertilizer</option>
                <option value="Prune">✂️ Prune Foliage</option>
                <option value="Rotate">🔄 Rotate Pot</option>
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                Repeat Interval (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                required
                value={intervalDays}
                onChange={(e) => setIntervalDays(parseInt(e.target.value) || 1)}
                className="w-full bg-white text-xs border border-neutral-250 rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List board */}
      <div className="space-y-3.5">
        {sortedReminders.length === 0 ? (
          <div className="text-center py-14 bg-white border border-neutral-200 rounded-2xl">
            <Bell className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-neutral-800">All chores cleared! No active reminders.</h4>
            <p className="text-xs text-neutral-400 mt-0.5">Click the "Add Task Reminder" button above to track irrigation times.</p>
          </div>
        ) : (
          sortedReminders.map((rem) => {
            const today = new Date().toISOString().split('T')[0];
            const isToday = rem.nextDueDate === today;
            const isOverdue = new Date(rem.nextDueDate).getTime() < new Date(today).getTime();

            return (
              <div
                key={rem.id}
                className={`bg-white border rounded-2xl p-4 flex items-center justify-between transition-all duration-150 ${
                  isOverdue
                    ? "border-red-200 bg-red-50/5"
                    : isToday
                    ? "border-amber-250 bg-amber-50/5"
                    : "border-neutral-200/80"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0">
                    {getTaskIcon(rem.taskType)}
                  </div>
                  
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 text-sm truncate">
                      {rem.plantName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-neutral-500 mt-0.5">
                      <span className="font-medium text-neutral-700">{rem.taskType}</span>
                      <span>•</span>
                      <span>Every {rem.intervalDays} days</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">Last completed: {rem.lastDoneDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {/* Status Badges */}
                  <div className="hidden sm:block text-right">
                    <div className="text-[11px] font-semibold">
                      {isOverdue ? (
                        <span className="text-red-600 uppercase font-bold tracking-wider text-[10px]">Overdue!</span>
                      ) : isToday ? (
                        <span className="text-amber-700 uppercase font-bold tracking-wider text-[10px]">Due Today</span>
                      ) : (
                        <span className="text-neutral-500 font-medium">Due in days</span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {rem.nextDueDate}
                    </p>
                  </div>

                  {/* Mark Complete Action */}
                  <button
                    onClick={() => handleCompleteTask(rem.id)}
                    className="p-2 sm:px-3 sm:py-1.5 bg-neutral-50 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 font-semibold text-xs border border-neutral-200 hover:border-emerald-250 rounded-xl flex items-center gap-1 transition-all duration-150 cursor-pointer"
                    title="Mark Done for today"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Done</span>
                  </button>

                  <button
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-50 border border-transparent rounded-lg transition-colors cursor-pointer"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
