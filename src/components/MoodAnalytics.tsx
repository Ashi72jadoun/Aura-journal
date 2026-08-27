import { BarChart3, TrendingUp, Sparkles, Heart, Award } from "lucide-react";
import { JournalEntry } from "../types";
import { getMoodConfig, MOOD_PALETTE } from "../lib/moods";

interface MoodAnalyticsProps {
  entries: JournalEntry[];
  onNavigateToWrite: () => void;
}

export function MoodAnalytics({ entries, onNavigateToWrite }: MoodAnalyticsProps) {
  const totalEntries = entries.length;
  const totalWords = entries.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
  const avgWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

  // Calculate mood counts
  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    const mood = (e.reflection?.primaryMood || "reflective").toLowerCase();
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);

  if (totalEntries === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
          Analytics & Mood Trends
        </h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          Start recording daily entries to unlock emotional breakdown charts, reflection metrics, and personal growth patterns.
        </p>
        <button
          onClick={onNavigateToWrite}
          className="px-4 py-2 text-xs font-medium rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm"
        >
          Write Reflection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-medium">
            <span>Total Reflections</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
            {totalEntries}
          </p>
          <p className="text-[11px] text-stone-400">Captured in journal history</p>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-medium">
            <span>Total Words Expressed</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
            {totalWords.toLocaleString()}
          </p>
          <p className="text-[11px] text-stone-400">Avg {avgWords} words per reflection</p>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-medium">
            <span>Dominant State</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-serif text-2xl font-bold capitalize text-stone-900 dark:text-stone-100 flex items-center gap-2">
            {sortedMoods[0] ? (
              <>
                <span>{getMoodConfig(sortedMoods[0][0]).emoji}</span>
                <span>{sortedMoods[0][0]}</span>
              </>
            ) : (
              "None"
            )}
          </p>
          <p className="text-[11px] text-stone-400">Most frequent emotional state</p>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Emotional Distribution
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Breakdown of primary moods extracted across all journal reflections
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
            {sortedMoods.length} distinct moods
          </span>
        </div>

        <div className="space-y-3.5">
          {sortedMoods.map(([mood, count]) => {
            const config = getMoodConfig(mood);
            const percentage = Math.round((count / totalEntries) * 100);

            return (
              <div key={mood} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{config.emoji}</span>
                    <span className="capitalize text-stone-800 dark:text-stone-200">
                      {config.label}
                    </span>
                  </div>
                  <span className="text-stone-500 dark:text-stone-400 font-mono">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${config.dot} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Growth & Clarity Milestones */}
      <div className="rounded-2xl border border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
              Personal Growth Milestones
            </h3>
            <p className="text-xs text-stone-500">Documenting your mindful consistency</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/80 dark:border-stone-800 space-y-1">
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
              Continuous Inquiring Habit
            </span>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              You have completed {totalEntries} introspective cycles, fostering deep self-awareness and mindful processing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/80 dark:border-stone-800 space-y-1">
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
              Objective Reflection Index
            </span>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              All entries have verified metadata summaries ready for rapid timeline review and clarity tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
