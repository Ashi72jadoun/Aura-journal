import { useState } from "react";
import { Sparkles, RefreshCw, BookOpen, ArrowRight, Lightbulb } from "lucide-react";

interface InspirationPromptsProps {
  onSelectPrompt: (promptText: string, category: string) => void;
}

const CATEGORIES = [
  { id: "mindfulness", label: "Mindfulness & Presence", icon: "🌿" },
  { id: "challenges", label: "Overcoming Challenges", icon: "🏔️" },
  { id: "career", label: "Career & Ambition", icon: "🎯" },
  { id: "gratitude", label: "Gratitude & Joy", icon: "✨" },
  { id: "relationships", label: "Relationships & Boundaries", icon: "🤝" },
  { id: "creativity", label: "Creative Unblocking", icon: "🎨" },
];

export function InspirationPrompts({ onSelectPrompt }: InspirationPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState("mindfulness");
  const [prompts, setPrompts] = useState<string[]>([
    "What is one emotion you have been holding onto lately that you are ready to gently examine?",
    "Describe a subtle moment from today that brought you peace or unexpected relief.",
    "What gentle permission or boundary do you need to give yourself before this week ends?",
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrompts = async (category: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/journal/prompt-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (Array.isArray(data.prompts) && data.prompts.length > 0) {
        setPrompts(data.prompts);
      }
    } catch (err) {
      console.warn("Could not fetch prompts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    fetchPrompts(catId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Inspirational Journaling Prompts
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Thought-provoking inquiry starters curated to spark genuine reflection
              </p>
            </div>
          </div>

          <button
            id="btn-refresh-prompts"
            onClick={() => fetchPrompts(selectedCategory)}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Generate New Set</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompts Cards */}
      <div className="grid grid-cols-1 gap-4">
        {prompts.map((prompt, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-stone-800 dark:text-stone-200 text-sm font-serif italic leading-relaxed">
                "{prompt}"
              </p>
            </div>

            <button
              onClick={() => onSelectPrompt(prompt, selectedCategory)}
              className="self-end sm:self-auto shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 transition shadow-sm"
            >
              <span>Reflect on This</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
