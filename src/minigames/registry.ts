import type { MiniGameType, MiniGameProps } from './types';
import CreationPlaceGame from './games/CreationPlaceGame';
import NoePairsGame from './games/NoePairsGame';
import DavidStoneGame from './games/DavidStoneGame';
import DanielShieldsGame from './games/DanielShieldsGame';
import JonahGuideGame from './games/JonahGuideGame';
import StarPathGame from './games/StarPathGame';
import ParablesSeedGame from './games/ParablesSeedGame';
import React from 'react';

export const MiniGameRegistry: Record<MiniGameType, React.ComponentType<MiniGameProps>> = {
  creation_place: CreationPlaceGame,
  noe_pairs: NoePairsGame,
  david_stone: DavidStoneGame,
  daniel_shields: DanielShieldsGame,
  jonah_guide: JonahGuideGame,
  star_path: StarPathGame,
  parables_seed: ParablesSeedGame,
};
