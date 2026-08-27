import { useState } from "react";
import Markdown from "react-markdown";
import {
  Sparkles,
  Code2,
  Copy,
  Check,
  BookmarkCheck,
  ArrowRight,
  HeartHandshake,
  Lightbulb,
  HelpCircle,
  Database,
} from "lucide-react";
import { JournalReflectionResponse } from "../types";
import { getMoodConfig } from "../lib/moods";

interface ReflectionCardProps {
  reflection: JournalReflectionResponse;
  onSaveToTimeline: () => void;
  isSaved: boolean;
  onContinuePrompt: (promptText: string) => void;
}

export function ReflectionCard({
  reflection,
  onSaveToTimeline,
  isSaved,
  onContinuePrompt,
}: ReflectionCardProps) {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const moodConfig = getMoodConfig(reflection.metadata?.primary_mood);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(
        `${reflection.reflectionText}\n\n\`\`\`json\n${JSON.stringify(
          reflection.metadata,
          null,
          2
        )}\n\`\`\``
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      id="reflection-card-container"
      className="rounded-2xl border border-stone-200/90 bg-white/95 dark:border-stone-800 dark:bg-stone-900/95 p-6 sm:p-8 shadow-md shadow-stone-200/50 dark:shadow-none transition-all duration-300 space-y-6"
    >
      {/* Header with Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Empathetic Reflection
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Insightful mirror, validation & gentle inquiry
            </p>
          </div>
        </div>

        {/* Primary Mood Extraction Badge */}
        <div className="flex items-center gap-2">
          <div
            id="badge-primary-mood"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${moodConfig.bg} ${moodConfig.text} ${moodConfig.border}`}
          >
            <span className="text-sm">{moodConfig.emoji}</span>
            <span className="capitalize">{moodConfig.name}</span>
          </div>

          <button
            id="btn-toggle-json"
            onClick={() => setShowRawJson(!showRawJson)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition"
            title="Inspect Data Extraction (Strict JSON)"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON Metadata</span>
          </button>
        </div>
      </div>

      {/* Part 1: The Reflection (Rich Text) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Part 1: Conversational Reflection</span>
        </div>

        <div
          id="reflection-rich-content"
          className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 text-base leading-relaxed"
        >
          <Markdown>{reflection.reflectionText}</Markdown>
        </div>
      </div>

      {/* Suggested Follow-up Prompt / Interactive Continuing Question */}
      {reflection.suggestedPrompt && (
        <div
          id="suggested-prompt-box"
          className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-amber-50/70 dark:border-amber-900/50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Gentle Inquiry
              </h4>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 italic mt-0.5">
                "{reflection.suggestedPrompt}"
              </p>
            </div>
          </div>

          <button
            id="btn-continue-with-prompt"
            onClick={() => onContinuePrompt(reflection.suggestedPrompt!)}
            className="self-end sm:self-auto shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
          >
            <span>Write Response</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Part 2: Data Extraction (Strict JSON Preview / Database Summary) */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>Part 2: Data Extraction (Database Metadata)</span>
          </div>
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
            Strict Schema Validated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">
              Primary Mood Key
            </span>
            <span className="font-mono text-sm font-bold capitalize text-stone-900 dark:text-stone-100 mt-0.5 block">
              {reflection.metadata.primary_mood || "reflective"}
            </span>
          </div>

          <div className="sm:col-span-2 p-3 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">
              Hidden Summary Key
            </span>
            <span className="text-xs text-stone-700 dark:text-stone-300 line-clamp-2 mt-0.5 block">
              {reflection.metadata.hidden_summary}
            </span>
          </div>
        </div>

        {/* Collapsible Raw JSON block matching exact format */}
        {showRawJson && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
              <span>Strict JSON Output Block:</span>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(JSON.stringify(reflection.metadata, null, 2))
                }
                className="hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-stone-900 text-stone-100 text-xs font-mono overflow-x-auto border border-stone-800">
{`\`\`\`json
${JSON.stringify(reflection.metadata, null, 2)}
\`\`\``}
            </pre>
          </div>
        )}
      </div>

      {/* Card Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          id="btn-copy-reflection"
          onClick={handleCopyText}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Reflection</span>
            </>
          )}
        </button>

        <button
          id="btn-save-to-timeline"
          onClick={onSaveToTimeline}
          disabled={isSaved}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition ${
            isSaved
              ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 cursor-default"
              : "bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          }`}
        >
          <BookmarkCheck className={`w-3.5 h-3.5 ${isSaved ? "text-emerald-600" : ""}`} />
          <span>{isSaved ? "Saved in Timeline" : "Save Entry to Timeline"}</span>
        </button>
      </div>
    </div>
  );
}
