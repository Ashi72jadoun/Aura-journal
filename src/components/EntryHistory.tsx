import { useState } from "react";
import Markdown from "react-markdown";
import {
  Search,
  Calendar,
  Tag,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Database,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { JournalEntry } from "../types";
import { getMoodConfig } from "../lib/moods";

interface EntryHistoryProps {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
  onSelectForEdit: (entry: JournalEntry) => void;
  onNavigateToWrite: () => void;
}

export function EntryHistory({
  entries,
  onDeleteEntry,
  onSelectForEdit,
  onNavigateToWrite,
}: EntryHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>("all");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique moods present in entries
  const availableMoods = Array.from(
    new Set(
      entries
        .map((e) => e.reflection?.primaryMood)
        .filter((m): m is string => Boolean(m))
    )
  );

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.reflection?.hiddenSummary || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMood =
      selectedMoodFilter === "all" ||
      entry.reflection?.primaryMood?.toLowerCase() === selectedMoodFilter.toLowerCase();

    return matchesSearch && matchesMood;
  });

  const handleCopyEntry = (entry: JournalEntry) => {
    const text = `# ${entry.title}\n*${new Date(entry.timestamp).toLocaleString()}*\n\n${entry.content}\n\n## AI Reflection\n${entry.reflection?.reflectionText || ""}\n\n\`\`\`json\n${JSON.stringify(
      {
        primary_mood: entry.reflection?.primaryMood,
        hidden_summary: entry.reflection?.hiddenSummary,
      },
      null,
      2
    )}\n\`\`\``;

    navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `journal_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (entries.length === 0) {
    return (
      <div
        id="empty-timeline-state"
        className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 p-12 text-center space-y-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            No Journal Entries Yet
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Every meaningful journey begins with a single reflection. Write down your thoughts to receive empathetic validation, themes, and structured mood extraction.
          </p>
        </div>
        <button
          id="btn-start-first-reflection"
          onClick={onNavigateToWrite}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-sm font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-sm"
        >
          <span>Write Your First Reflection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="input-search-entries"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries, keywords, themes or summaries..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Export button */}
          <button
            id="btn-export-timeline-json"
            onClick={handleExportAll}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export All JSON</span>
          </button>
        </div>

        {/* Mood Filter Chips */}
        {availableMoods.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800/80">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 mr-1">
              Filter Mood:
            </span>
            <button
              onClick={() => setSelectedMoodFilter("all")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                selectedMoodFilter === "all"
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
              }`}
            >
              All ({entries.length})
            </button>
            {availableMoods.map((mood) => {
              const config = getMoodConfig(mood);
              const count = entries.filter(
                (e) => e.reflection?.primaryMood?.toLowerCase() === mood.toLowerCase()
              ).length;
              return (
                <button
                  key={mood}
                  onClick={() => setSelectedMoodFilter(mood)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                    selectedMoodFilter.toLowerCase() === mood.toLowerCase()
                      ? `${config.bg} ${config.text} ${config.border} ring-2 ring-indigo-500/20`
                      : "border-stone-200 dark:border-stone-700 bg-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  <span>{config.emoji}</span>
                  <span className="capitalize">{mood}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">
            No entries matched your search filter.
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedEntryId === entry.id;
            const moodConfig = getMoodConfig(entry.reflection?.primaryMood || "reflective");
            const formattedDate = new Date(entry.timestamp).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const formattedTime = new Date(entry.timestamp).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={entry.id}
                id={`entry-card-${entry.id}`}
                className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header Line */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                        {entry.title || "Untitled Reflection"}
                      </h3>
                      {entry.reflection?.primaryMood && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${moodConfig.bg} ${moodConfig.text} ${moodConfig.border}`}
                        >
                          <span>{moodConfig.emoji}</span>
                          <span className="capitalize">{entry.reflection.primaryMood}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {formattedDate} at {formattedTime}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{entry.wordCount} words</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyEntry(entry)}
                      title="Copy full entry & reflection"
                      className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to remove this journal entry?")) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      title="Delete entry"
                      className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition ml-1"
                    >
                      <span>{isExpanded ? "Collapse" : "View Full"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Hidden Summary Quick Extract */}
                {entry.reflection?.hiddenSummary && (
                  <div className="rounded-xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/70 dark:border-stone-800/80 p-3 flex items-start gap-2.5 text-xs">
                    <Database className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        Extracted Summary:
                      </span>
                      <p className="text-stone-600 dark:text-stone-400">
                        {entry.reflection.hiddenSummary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Content preview or full body */}
                <div className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
                  {isExpanded ? (
                    <div className="space-y-6 pt-2">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block">
                          User Journal Text:
                        </span>
                        <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-stone-950/30 border border-stone-200/50 dark:border-stone-800/50 whitespace-pre-wrap">
                          {entry.content}
                        </div>
                      </div>

                      {entry.reflection && (
                        <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>AI Empathetic Reflection & Insights</span>
                          </div>
                          <div className="prose prose-stone dark:prose-invert max-w-none text-sm leading-relaxed p-4 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950">
                            <Markdown>{entry.reflection.reflectionText}</Markdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="line-clamp-2 text-stone-600 dark:text-stone-300">
                      {entry.content}
                    </p>
                  )}
                </div>

                {/* Tags footer */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 font-medium"
                      >
                        <Tag className="w-2.5 h-2.5 opacity-60" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
