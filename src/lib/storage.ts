import { JournalEntry } from "../types";

const STORAGE_KEY = "empathetic_journal_entries_v1";
const DRAFT_KEY = "empathetic_journal_draft_v1";

export function loadLocalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Could not load local journal entries:", e);
    return [];
  }
}

export function saveLocalEntries(entries: JournalEntry[]): void {
  try {
    const sanitized = JSON.parse(JSON.stringify(entries));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error("Failed to save entries to localStorage:", e);
  }
}

export function saveDraft(title: string, content: string, tags: string[]): void {
  try {
    const draft = { title, content, tags, updatedAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.warn("Could not save draft:", e);
  }
}

export function loadDraft(): { title: string; content: string; tags: string[] } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}
