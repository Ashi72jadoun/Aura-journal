import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Mic,
  MicOff,
  Tag,
  BookOpen,
  Trash2,
  AlertCircle,
  RefreshCw,
  Clock,
  FileText,
  Lightbulb,
} from "lucide-react";
import { ReflectionCard } from "./ReflectionCard";
import { JournalReflectionResponse, JournalEntry } from "../types";
import { saveDraft, loadDraft, clearDraft } from "../lib/storage";

interface JournalEditorProps {
  onSaveEntry: (entry: JournalEntry) => Promise<boolean>;
  recentEntries: JournalEntry[];
}

const COMMON_TAGS = [
  "Mindfulness",
  "Work & Career",
  "Relationships",
  "Gratitude",
  "Creativity",
  "Overcoming Blocks",
  "Health & Energy",
  "Evening Review",
];

export function JournalEditor({ onSaveEntry, recentEntries }: JournalEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  // Reflection AI state
  const [isLoading, setIsLoading] = useState(false);
  const [reflection, setReflection] = useState<JournalReflectionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Auto-save draft
  useEffect(() => {
    const draft = loadDraft();
    if (draft && !content && !title) {
      setTitle(draft.title || "");
      setContent(draft.content || "");
      setSelectedTags(draft.tags || []);
    }
  }, []);

  useEffect(() => {
    if (content || title) {
      saveDraft(title, content, selectedTags);
    }
  }, [title, content, selectedTags]);

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + " ";
          }
        }
        if (transcript) {
          setContent((prev) => prev + (prev.endsWith(" ") || !prev ? "" : " ") + transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn("Failed to start voice recognition:", err);
      }
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
      setSelectedTags([...selectedTags, customTagInput.trim()]);
      setCustomTagInput("");
      setShowTagInput(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to start a new blank reflection?")) {
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setReflection(null);
      setIsSaved(false);
      setErrorMessage(null);
      clearDraft();
    }
  };

  const handleProcessReflection = async () => {
    if (!content.trim()) {
      setErrorMessage("Please write down your thoughts before requesting an empathetic reflection.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsSaved(false);

    try {
      // Build history context if user has past reflections
      const historyContext = recentEntries.slice(0, 3).map((entry) => ({
        role: "user" as const,
        text: `${entry.title ? entry.title + ": " : ""}${entry.content.slice(0, 200)}`,
      }));

      const res = await fetch("/api/journal/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled Reflection",
          entry: content.trim(),
          history: historyContext,
          tags: selectedTags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Unable to generate reflection. Please try again.");
      }

      setReflection(data);

      // Construct and automatically persist entry with fallback
      const newEntry: JournalEntry = {
        id: "entry_" + Date.now(),
        title: title.trim() || "Journal Entry",
        content: content.trim(),
        timestamp: new Date().toISOString(),
        tags: selectedTags,
        wordCount,
        reflection: {
          rawText: data.rawResponse,
          reflectionText: data.reflectionText,
          primaryMood: data.metadata?.primary_mood || "reflective",
          hiddenSummary: data.metadata?.hidden_summary || content.slice(0, 100),
          generatedAt: new Date().toISOString(),
          modelUsed: data.modelUsed,
        },
      };

      const saved = await onSaveEntry(newEntry);
      setIsSaved(saved);
      clearDraft();
    } catch (err: any) {
      console.error("Reflection generation error:", err);
      setErrorMessage(err?.message || "Failed to communicate with the reflection service.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSave = async () => {
    if (!reflection) return;
    const entryToSave: JournalEntry = {
      id: "entry_" + Date.now(),
      title: title.trim() || "Journal Entry",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      tags: selectedTags,
      wordCount,
      reflection: {
        rawText: reflection.rawResponse,
        reflectionText: reflection.reflectionText,
        primaryMood: reflection.metadata?.primary_mood || "reflective",
        hiddenSummary: reflection.metadata?.hidden_summary || content.slice(0, 100),
        generatedAt: new Date().toISOString(),
      },
    };

    const saved = await onSaveEntry(entryToSave);
    if (saved) {
      setIsSaved(true);
    }
  };

  const handleContinueWithPrompt = (promptText: string) => {
    setContent((prev) => {
      const separator = prev ? "\n\n---\n\n" : "";
      return prev + separator + `*Responding to inquiry: "${promptText}"*\n\n`;
    });
    setReflection(null);
    setIsSaved(false);
    // Smooth scroll back to writing field
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleSamplePromptClick = (sampleText: string) => {
    if (content && !window.confirm("Replace current draft with this starter reflection?")) {
      return;
    }
    setTitle("A Demanding Day & Finding Resets");
    setContent(sampleText);
    setSelectedTags(["Work & Career", "Mindfulness"]);
  };

  return (
    <div className="space-y-8">
      {/* Writing Container */}
      <div
        id="journal-editor-box"
        className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 shadow-sm p-6 sm:p-8 space-y-6 transition-all"
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Personal Reflection
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>{wordCount} words</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>~{readingTimeMinutes} min read</span>
            </div>
            {(title || content) && (
              <button
                id="btn-clear-draft"
                onClick={handleClear}
                title="Clear current text"
                className="p-1 rounded text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <input
            id="journal-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reflection Title or Core Focus (Optional)..."
            className="w-full font-serif text-xl sm:text-2xl font-bold bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none"
          />
        </div>

        {/* Main Content Area */}
        <div className="relative">
          <textarea
            id="journal-content-input"
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely and honestly. What's on your mind? What feelings or experiences are you processing right now?..."
            className="w-full bg-stone-50/50 dark:bg-stone-950/40 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 border border-stone-200/80 dark:border-stone-800 rounded-xl p-4 sm:p-5 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/60 font-sans transition"
          />

          {/* Voice Dictation Button inside textarea container */}
          {voiceSupported && (
            <button
              id="btn-voice-dictation"
              type="button"
              onClick={toggleRecording}
              title={isRecording ? "Stop voice dictation" : "Start voice dictation"}
              className={`absolute right-4 bottom-4 p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition shadow-sm ${
                isRecording
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700"
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-600" />}
              <span className="hidden sm:inline">
                {isRecording ? "Listening..." : "Dictate"}
              </span>
            </button>
          )}
        </div>

        {/* Tag Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1 font-medium">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Focus Themes & Tags:
            </span>
            <button
              id="btn-toggle-custom-tag"
              type="button"
              onClick={() => setShowTagInput(!showTagInput)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              + Add custom tag
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {COMMON_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  id={`tag-btn-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  }`}
                >
                  {tag}
                </button>
              );
            })}

            {selectedTags
              .filter((t) => !COMMON_TAGS.includes(t))
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-amber-600 text-white shadow-sm"
                >
                  {tag} ×
                </button>
              ))}
          </div>

          {showTagInput && (
            <form onSubmit={handleAddCustomTag} className="flex gap-2 pt-2">
              <input
                id="custom-tag-input"
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Enter tag name..."
                className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </form>
          )}
        </div>

        {/* Quick Example Starter */}
        {!content && (
          <div className="rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Looking for an example to test the structured reflection & metadata output?</span>
            </div>
            <button
              id="btn-load-sample-entry"
              type="button"
              onClick={() =>
                handleSamplePromptClick(
                  "Today was an overwhelming blur at work. I had three tight deadlines back-to-back, and every time I thought I made progress, another urgent request popped up. By 3 PM my head was pounding, so I stepped away from my screen and took a 20-minute walk through the park. Feeling the cool air and seeing the trees helped calm my racing thoughts, but I still feel tense about tomorrow's presentation."
                )
              }
              className="font-medium text-amber-700 dark:text-amber-400 hover:underline shrink-0"
            >
              Load Sample Journal Entry →
            </button>
          </div>
        )}

        {/* Error Banner with Retry */}
        {errorMessage && (
          <div
            id="error-banner"
            className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/50 p-4 flex items-start justify-between gap-3 text-rose-800 dark:text-rose-200 text-sm"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Reflection Service Notice</p>
                <p className="text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              id="btn-retry-reflection"
              onClick={handleProcessReflection}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left">
            Gemini processes your entry to provide conversational validation, themes, and strict metadata extraction.
          </p>

          <button
            id="btn-process-reflection"
            type="button"
            onClick={handleProcessReflection}
            disabled={isLoading || !content.trim()}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm shadow-md transition-all ${
              isLoading || !content.trim()
                ? "bg-stone-300 text-stone-500 dark:bg-stone-800 dark:text-stone-600 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white hover:shadow-indigo-500/20 active:scale-[0.99]"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Reflecting & Extracting Metadata...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Reflect & Extract Insights</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Reflection Card Display */}
      {reflection && (
        <ReflectionCard
          reflection={reflection}
          onSaveToTimeline={handleManualSave}
          isSaved={isSaved}
          onContinuePrompt={handleContinueWithPrompt}
        />
      )}
    </div>
  );
}
