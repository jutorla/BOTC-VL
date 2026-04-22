export type CharacterType = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveller' | 'fabled' | 'loric';

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  ability: string;
  firstNight?: number;       // posición en el orden de noche 1 (0 = no actúa)
  otherNight?: number;       // posición en noches siguientes (0 = no actúa)
  firstNightReminder?: string;
  otherNightReminder?: string;
  reminders?: string[];
  setup?: boolean;           // requiere acción en el setup
  isCustom?: boolean;
  icon?: string;             // emoji icono
  author?: string;           // nombre del creador (personajes custom)
}

export interface Script {
  id: string;
  name: string;
  description: string;
  author?: string;
  edition?: string;
  isOfficial: boolean;
  isCustom?: boolean;
  characters: string[];      // array de character IDs
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Reminder {
  id: string;
  text: string;
  playerId?: string;
  fromCharacterId: string;
}

export interface PlayerNote {
  timestamp: number;
  text: string;
}

export interface Player {
  id: string;
  name: string;
  characterId: string;
  isAlive: boolean;
  usedDeadVote: boolean;     // los jugadores muertos tienen 1 voto
  reminders: string[];
  notes: string;
  isGhostVote?: boolean;     // marcado como voto fantasma
  seatIndex: number;         // posición en la mesa
}

export type GamePhase = 'setup' | 'night' | 'day' | 'ended';

export interface Nomination {
  id: string;
  nominatorId: string;
  nomineeId: string;
  votes: string[];           // IDs de jugadores que votaron a favor
  executed: boolean;
  aborted: boolean;
}

export interface NightAction {
  characterId: string;
  playerId: string;
  isDone: boolean;
  note: string;
}

export interface DayEvent {
  type: 'death' | 'execution' | 'nomination' | 'note' | 'exile';
  description: string;
  playerId?: string;
  timestamp: number;
}

export interface GameRound {
  round: number;
  phase: 'night' | 'day';
  events: DayEvent[];
  nightActions: NightAction[];
  nominations: Nomination[];
  deaths: string[];                      // IDs de jugadores muertos esta ronda
  storytellerNotes?: string;             // notas del narrador para esta ronda
  playerNotes?: Record<string, string>;  // notas por jugador al final del día
}

export interface Game {
  id: string;
  scriptId: string;
  scriptName: string;
  players: Player[];
  phase: GamePhase;
  round: number;
  rounds: GameRound[];
  currentNomination?: Nomination;
  hasExecutionToday: boolean;
  lorics?: string[];          // IDs de personajes loric activos en la partida
  winner?: 'good' | 'evil';
  winReason?: string;
  storytellerNotes: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  customScripts: Script[];
  customCharacters: Character[];
  savedGames: Game[];
  activeGameId?: string;
}
