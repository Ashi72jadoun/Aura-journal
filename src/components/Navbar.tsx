import { BookOpen, Sparkles, History, BarChart3, ShieldCheck, CheckCircle2 } from "lucide-react";

interface NavbarProps {
  activeTab: "write" | "history" | "analytics" | "prompts";
  setActiveTab: (tab: "write" | "history" | "analytics" | "prompts") => void;
  openThreatModel: () => void;
  openWalkthrough: () => void;
  entryCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  openThreatModel,
  openWalkthrough,
  entryCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-amber-500/10">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Aura Journal
              </h1>
              <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Empathetic AI
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
              Insightful reflection, clarity & personal growth
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            id="nav-write-tab"
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === "write"
                ? "bg-stone-900 text-stone-50 shadow-sm dark:bg-stone-100 dark:text-stone-900"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Reflect</span>
          </button>

          <button
            id="nav-history-tab"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-stone-900 text-stone-50 shadow-sm dark:bg-stone-100 dark:text-stone-900"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Timeline</span>
            {entryCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 font-mono">
                {entryCount}
              </span>
            )}
          </button>

          <button
            id="nav-analytics-tab"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-stone-900 text-stone-50 shadow-sm dark:bg-stone-100 dark:text-stone-900"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </button>

          <button
            id="nav-prompts-tab"
            onClick={() => setActiveTab("prompts")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === "prompts"
                ? "bg-stone-900 text-stone-50 shadow-sm dark:bg-stone-100 dark:text-stone-900"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800"
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Inspirations</span>
          </button>
        </nav>

        {/* Security & Testing Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="btn-threat-model"
            onClick={openThreatModel}
            title="Threat Summary Table & Security"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline font-mono">Threat Model</span>
          </button>

          <button
            id="btn-walkthrough"
            onClick={openWalkthrough}
            title="Interactive Testing Walkthrough"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition font-medium"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">Test Walkthrough</span>
          </button>
        </div>
      </div>
    </header>
  );
}
