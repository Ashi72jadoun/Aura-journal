import { useState } from "react";
import { CheckCircle2, X, CheckSquare, Square, Play, Shield, Sparkles } from "lucide-react";

interface TestingWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestCase {
  id: string;
  category: string;
  title: string;
  steps: string[];
  expected: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: "TC-01",
    category: "Input Handling & Validation",
    title: "Empty Submission & Character Sanitization",
    steps: [
      "Open the 'Reflect' tab.",
      "Leave the text area empty and click 'Reflect & Extract Insights'.",
      "Verify that the interface gracefully prevents submission and shows a clear validation prompt.",
    ],
    expected: "No network error; user is guided to enter reflection text.",
  },
  {
    id: "TC-02",
    category: "AI Processing & Fallback Ladder",
    title: "Part 1 Conversational Reflection & Validation",
    steps: [
      "Load the sample entry or type a short reflection regarding work stress or gratitude.",
      "Click 'Reflect & Extract Insights'.",
      "Inspect the generated output in Part 1.",
    ],
    expected: "Reflection validates feelings, summarizes core themes, provides constructive frameworks, and concludes with a gentle inquiry question.",
  },
  {
    id: "TC-03",
    category: "Metadata Extraction",
    title: "Part 2 Strict JSON Output & Database Keys",
    steps: [
      "After reflection generation, inspect the Part 2 Data Extraction box.",
      "Click 'JSON Metadata' button to reveal the raw JSON code block.",
      "Verify presence of 'primary_mood' (single lowercase word) and 'hidden_summary' (concise 1-sentence database summary).",
    ],
    expected: "JSON schema is strictly parsed and displayed with dynamic color-coded mood pill.",
  },
  {
    id: "TC-04",
    category: "Interactive Continuity",
    title: "Continuing Gentle Inquiry Chaining",
    steps: [
      "In the generated reflection card, locate the 'Gentle Inquiry' highlight box.",
      "Click 'Write Response'.",
      "Verify that the editor receives the prompt context and smooth-scrolls to the writing field.",
    ],
    expected: "User seamlessly continues the reflective inquiry without losing previous thoughts.",
  },
  {
    id: "TC-05",
    category: "Data Durability & Persistence",
    title: "Transaction Verification & Undefined-Stripping",
    steps: [
      "Save the entry to Timeline.",
      "Navigate to the 'Timeline' tab.",
      "Confirm the entry appears with timestamp, tags, primary mood, and hidden summary.",
      "Refresh the browser page to verify localStorage + server synchronization.",
    ],
    expected: "Entry persists intact without serialization crashes or data loss.",
  },
  {
    id: "TC-06",
    category: "Search & Filtering",
    title: "Multi-Mood and Keyword Querying",
    steps: [
      "In the 'Timeline' tab, use the search input to filter by a keyword.",
      "Click a mood filter pill (e.g. 'Stressed', 'Peaceful').",
      "Verify instant filtering of matching records.",
    ],
    expected: "Filtered timeline updates responsively.",
  },
  {
    id: "TC-07",
    category: "Inspiration Engine",
    title: "Introspective Prompt Generator",
    steps: [
      "Navigate to the 'Inspirations' tab.",
      "Switch between categories (Mindfulness, Career, Gratitude).",
      "Click 'Reflect on This' for any prompt.",
    ],
    expected: "Prompt is inserted into the editor and opens the reflection workspace.",
  },
  {
    id: "TC-08",
    category: "Analytics & Trends",
    title: "Emotional Distribution & Word Count Tracking",
    steps: [
      "Navigate to the 'Insights' tab.",
      "Review the Total Reflections, Total Words Expressed, and Dominant Mood percentage bars.",
    ],
    expected: "Aggregated metrics accurately reflect the current timeline dataset.",
  },
];

export function TestingWalkthroughModal({ isOpen, onClose }: TestingWalkthroughModalProps) {
  const [completedTests, setCompletedTests] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleTest = (id: string) => {
    setCompletedTests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(completedTests).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / TEST_CASES.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
      <div
        id="walkthrough-modal-container"
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl p-6 sm:p-8 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                End-to-End Testing Walkthrough Suite
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Complete manual and scriptable verification matrix across all interactive paths
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-stone-700 dark:text-stone-300">
              Testing Progress ({completedCount} of {TEST_CASES.length} Verified)
            </span>
            <span className="font-mono text-amber-600 dark:text-amber-400">
              {progressPercent}% Passed
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Test Cases List */}
        <div className="space-y-4">
          {TEST_CASES.map((tc) => {
            const isDone = Boolean(completedTests[tc.id]);
            return (
              <div
                key={tc.id}
                onClick={() => toggleTest(tc.id)}
                className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isDone
                    ? "bg-emerald-50/40 border-emerald-300/80 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : "bg-white dark:bg-stone-900/90 border-stone-200 dark:border-stone-800 hover:border-stone-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="mt-0.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                    >
                      {isDone ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {tc.id}
                        </span>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {tc.category}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                        {tc.title}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="pl-8 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      Action Steps:
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-400">
                      {tc.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-1">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      Expected Functional Outcome:{" "}
                    </span>
                    <span className="text-stone-600 dark:text-stone-400">{tc.expected}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold"
          >
            Done Reviewing Tests
          </button>
        </div>
      </div>
    </div>
  );
}
