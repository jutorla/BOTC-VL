import type { Script } from '../types';
import { TROUBLE_BREWING_IDS, BAD_MOON_RISING_IDS, SECTS_VIOLETS_IDS } from './characters';

export const OFFICIAL_SCRIPTS: Script[] = [
  {
    id: 'trouble_brewing',
    name: 'Trouble Brewing',
    description: 'El script introductorio de Blood on the Clocktower. Perfecto para nuevos jugadores, con mecánicas sencillas y un ritmo equilibrado entre información y engaño.',
    author: 'Steven Medway',
    edition: 'Teensyville / Ravenswood Bluff',
    isOfficial: true,
    difficulty: 'beginner',
    characters: TROUBLE_BREWING_IDS,
  },
  {
    id: 'bad_moon_rising',
    name: 'Bad Moon Rising',
    description: 'Un script intermedio centrado en la muerte y la supervivencia. Los jugadores muertos juegan un papel más activo y el Demonio tiene múltiples formas de matar.',
    author: 'Steven Medway',
    edition: 'Ravenswood Bluff',
    isOfficial: true,
    difficulty: 'intermediate',
    characters: BAD_MOON_RISING_IDS,
  },
  {
    id: 'sects_and_violets',
    name: 'Sects & Violets',
    description: 'Un script intermedio-avanzado lleno de locura y desinformación. Las habilidades de los personajes interactúan de formas complejas y el caos es parte del diseño.',
    author: 'Steven Medway',
    edition: 'Ravenswood Bluff',
    isOfficial: true,
    difficulty: 'advanced',
    characters: SECTS_VIOLETS_IDS,
  },
];

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  expert: 'Experto',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-green-400 bg-green-900/30 border-green-700/50',
  intermediate: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50',
  advanced: 'text-orange-400 bg-orange-900/30 border-orange-700/50',
  expert: 'text-red-400 bg-red-900/30 border-red-700/50',
};

// Distribución de personajes según número de jugadores (oficial)
// [townsfolk, outsiders, minions, demons]
export const PLAYER_DISTRIBUTION: Record<number, [number, number, number, number]> = {
  5:  [3, 0, 1, 1],
  6:  [3, 1, 1, 1],
  7:  [5, 0, 1, 1],
  8:  [5, 1, 1, 1],
  9:  [5, 2, 1, 1],
  10: [7, 0, 2, 1],
  11: [7, 1, 2, 1],
  12: [7, 2, 2, 1],
  13: [9, 0, 3, 1],
  14: [9, 1, 3, 1],
  15: [9, 2, 3, 1],
};

export function getDistribution(playerCount: number): [number, number, number, number] {
  return PLAYER_DISTRIBUTION[playerCount] || [Math.floor(playerCount * 0.6), 1, 1, 1];
}
