export interface ExtractedMetadata {
  primary_mood: string;
  hidden_summary: string;
}

export interface JournalReflectionResponse {
  rawResponse: string;
  reflectionText: string;
  metadata: ExtractedMetadata;
  suggestedPrompt?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
  reflection?: {
    rawText: string;
    reflectionText: string;
    primaryMood: string;
    hiddenSummary: string;
    generatedAt: string;
    modelUsed?: string;
  };
  wordCount: number;
}

export interface MoodStat {
  mood: string;
  count: number;
  color: string;
}
