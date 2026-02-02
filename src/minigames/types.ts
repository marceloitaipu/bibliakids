export type MiniGameType =
  | 'creation_place'
  | 'noe_pairs'
  | 'david_stone'
  | 'daniel_shields'
  | 'jonah_guide'
  | 'star_path'
  | 'parables_seed';

export type MiniGameConfig =
  | { type: 'creation_place' }
  | { type: 'noe_pairs'; pairsToMatch: number }
  | { type: 'david_stone' }
  | { type: 'daniel_shields' }
  | { type: 'jonah_guide' }
  | { type: 'star_path' }
  | { type: 'parables_seed' };

export type MiniGameResult = {
  completed: boolean;
  score: number; // 0..100
  mistakes: number;
  seconds: number;
};

export interface MiniGameProps {
  narrationEnabled: boolean;
  onDone: (result: MiniGameResult) => void;
  pairsToMatch?: number;
}
