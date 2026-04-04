export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export type AvatarState = "idle" | "thinking" | "speaking";

export interface ConjugationEntry {
  tense: string;
  conjugations: Record<string, string>;
}

export interface VerbConjugation {
  verb: string;
  tenses: ConjugationEntry[];
}

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  avatarState: AvatarState;
  error: string | null;
}
