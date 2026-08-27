import { ShieldCheck, X, AlertTriangle, Lock, Server, Cpu, Database, Network } from "lucide-react";

interface ThreatModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThreatModelModal({ isOpen, onClose }: ThreatModelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
      <div
        id="threat-model-modal-container"
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl p-6 sm:p-8 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                Agentic Threat Modeling & Security Architecture
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Structured 5-Zone Threat Analysis & OWASP Mitigation Matrix
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

        {/* Threat Summary Table (The 5 Threat Zones) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Threat Summary Table (The 5 Threat Zones)</span>
          </h3>

          <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-950/60 text-stone-700 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="p-3">Threat Zone</th>
                  <th className="p-3">Identified Scenario / Risk</th>
                  <th className="p-3">OWASP Vector</th>
                  <th className="p-3">Countermeasure / Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-600 dark:text-stone-400">
                <tr>
                  <td className="p-3 font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    1. Input Surfaces
                  </td>
                  <td className="p-3">
                    Malformed journal entries, script injection, oversized payloads attempting denial of service.
                  </td>
                  <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                    OWASP A03 / LLM02
                  </td>
                  <td className="p-3">
                    Strict body-size caps (10MB limit), top-level JSON middleware ordering, defensive null-safe destructuring, and schema validation.
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    2. Planning & Reasoning
                  </td>
                  <td className="p-3">
                    Indirect prompt injection via user text attempting to hijack system instructions or leak API keys.
                  </td>
                  <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                    OWASP LLM01
                  </td>
                  <td className="p-3">
                    Immutable system instruction isolation (`Role: You are an insightful...`), clear delineation of user input vs instructions, and structured markdown JSON extraction delimiters.
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-rose-500" />
                    3. Tool Execution
                  </td>
                  <td className="p-3">
                    Backend service failure, API exhaustion, or rate limit lockouts crashing runtime workflows.
                  </td>
                  <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                    OWASP A05 / LLM04
                  </td>
                  <td className="p-3">
                    Automated Resilient Model Fallback Ladder (gemini-3.6-flash → gemini-3.1-flash-lite → gemini-flash-latest → gemini-3.7-flash) with error code recovery matrix.
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-teal-500" />
                    4. Memory & State
                  </td>
                  <td className="p-3">
                    Database serialization failures due to `undefined` values, silent write drops, or cross-tenant leakage.
                  </td>
                  <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                    OWASP A01 / A04
                  </td>
                  <td className="p-3">
                    Strict undefined-stripping utility before storage, dual client/server persistence verification, explicit error banner feedback with retry.
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-blue-500" />
                    5. Inter-System Comm
                  </td>
                  <td className="p-3">
                    Exposure of `GEMINI_API_KEY` to client browser bundles or unauthenticated network eavesdropping.
                  </td>
                  <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                    OWASP A02 / LLM06
                  </td>
                  <td className="p-3">
                    Zero-browser key exposure guarantee: all Gemini SDK calls are exclusively executed on backend Express routes via `process.env.GEMINI_API_KEY`.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Rule Reference */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
          <span className="font-semibold text-stone-900 dark:text-stone-100 block">
            Owner-Bound Firestore Security Rule Blueprint:
          </span>
          <pre className="p-3 rounded-lg bg-stone-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold"
          >
            Close Security Audit View
          </button>
        </div>
      </div>
    </div>
  );
}
