export interface NoteData {
  pitch: string;
  duration: number; // relative duration in beats (e.g., 1 for quarter note)
}

export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface ParsedNotesResponse {
  bpm: number;
  notes: NoteData[];
  description?: string;
}

export type InstrumentType = 'piano' | 'synth' | 'flute' | '8bit';