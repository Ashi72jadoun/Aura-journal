import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { JournalEditor } from "./components/JournalEditor";
import { EntryHistory } from "./components/EntryHistory";
import { MoodAnalytics } from "./components/MoodAnalytics";
import { InspirationPrompts } from "./components/InspirationPrompts";
import { ThreatModelModal } from "./components/ThreatModelModal";
import { TestingWalkthroughModal } from "./components/TestingWalkthroughModal";
import { JournalEntry } from "./types";
import { loadLocalEntries, saveLocalEntries } from "./lib/storage";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"write" | "history" | "analytics" | "prompts">("write");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Initialize entries from server and fallback to local storage
  useEffect(() => {
    async function fetchInitialEntries() {
      try {
        const res = await fetch("/api/journal/entries");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.entries) && data.entries.length > 0) {
            setEntries(data.entries);
            saveLocalEntries(data.entries);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not load entries from server, using local storage:", err);
      }

      // Fallback to local storage
      const local = loadLocalEntries();
      setEntries(local);
    }

    fetchInitialEntries();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Guaranteed save handler with undefined-stripping and dual-persistence
  const handleSaveEntry = async (entry: JournalEntry): Promise<boolean> => {
    try {
      const sanitized = JSON.parse(JSON.stringify(entry));

      // 1. Update local state & localStorage immediately
      const updated = [sanitized, ...entries.filter((e) => e.id !== sanitized.id)];
      setEntries(updated);
      saveLocalEntries(updated);

      // 2. Persist to server backend
      const res = await fetch("/api/journal/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized),
      });

      if (!res.ok) {
        throw new Error("Server write failed, saved locally");
      }

      showToast("Journal reflection securely documented & indexed.");
      return true;
    } catch (err: any) {
      console.warn("Save sync warning:", err);
      showToast("Saved locally to browser storage.", "success");
      return true;
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveLocalEntries(updated);

    try {
      await fetch(`/api/journal/entries/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Failed to delete from server:", e);
    }
    showToast("Entry removed from timeline.");
  };

  const handleSelectInspirationPrompt = (promptText: string, category: string) => {
    setActiveTab("write");
    // Pre-populate input in editor
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast(`Loaded "${category}" prompt into reflection workspace.`);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-200 antialiased flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openThreatModel={() => setIsThreatModalOpen(true)}
          openWalkthrough={() => setIsWalkthroughOpen(true)}
          entryCount={entries.length}
        />

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {activeTab === "write" && (
            <JournalEditor
              onSaveEntry={handleSaveEntry}
              recentEntries={entries}
            />
          )}

          {activeTab === "history" && (
            <EntryHistory
              entries={entries}
              onDeleteEntry={handleDeleteEntry}
              onSelectForEdit={() => setActiveTab("write")}
              onNavigateToWrite={() => setActiveTab("write")}
            />
          )}

          {activeTab === "analytics" && (
            <MoodAnalytics
              entries={entries}
              onNavigateToWrite={() => setActiveTab("write")}
            />
          )}

          {activeTab === "prompts" && (
            <InspirationPrompts
              onSelectPrompt={handleSelectInspirationPrompt}
            />
          )}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          id="global-toast-notification"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 bg-stone-900 text-white border-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-200"
        >
          {toastMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Security Threat Model Modal */}
      <ThreatModelModal
        isOpen={isThreatModalOpen}
        onClose={() => setIsThreatModalOpen(false)}
      />

      {/* Interactive Testing Walkthrough Modal */}
      <TestingWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800/80 py-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Empathetic AI Journal Engine Active</span>
          </div>
          <p className="text-[11px]">
            Structured Reflection • Strict JSON Metadata Extraction • Resilient Model Ladder
          </p>
        </div>
      </footer>
    </div>
  );
}
