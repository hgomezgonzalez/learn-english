import type { CEFRLevel } from "./videos";

export type BookGenre =
  | "self-help"
  | "finance"
  | "productivity"
  | "philosophy"
  | "relationships"
  | "classics"
  | "mindset"
  | "learn-english";

export interface BookItem {
  id: string;
  youtubeId: string;
  title: string;
  author: string;
  channel: string;
  level: CEFRLevel;
  genre: BookGenre;
  durationSec: number;
  description: string;
  whyRead?: string;
}
