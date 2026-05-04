export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type VideoTopic =
  | "conversation"
  | "grammar"
  | "pronunciation"
  | "business"
  | "stories"
  | "vocabulary";

export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  levels: CEFRLevel[];
  topics: VideoTopic[];
  durationSec: number;
  description: string;
  recommendedFor?: string;
}
