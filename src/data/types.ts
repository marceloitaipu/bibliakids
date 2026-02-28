/**
 * Tipos que descrevem a estrutura de levels.json.
 * Elimina a necessidade de casts `as any` no código.
 */

import type { MiniGameConfig } from '../minigames/types';

export interface Question {
  prompt: string;
  options: string[];
  answerIndex: number;
  explain: string;
  ref: string;
}

export interface Story {
  line1: string;
  line2: string;
  line3?: string;
}

export interface Level {
  id: string;
  title: string;
  short: string;
  stickerId: string;
  story: Story;
  questions: Question[];
  minigame: MiniGameConfig;
}

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export interface LevelsData {
  levels: Level[];
  stickers: Sticker[];
}
