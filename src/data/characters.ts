import type { Character } from '../types';
import charactersJson from './characters.json';

// ============================================================
// MAPEO DE FORMATO JSON BOTC ESTÁNDAR → FORMATO INTERNO
// ============================================================

interface JsonCharacter {
  id: string;
  name: string;
  team: 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveller' | 'fabled' | 'loric';
  edition?: string;
  ability?: string;
  flavor?: string;
  firstNightReminder?: string;
  otherNightReminder?: string;
  reminders?: string[];
  remindersGlobal?: string[];
  setup?: boolean;
  special?: unknown[];
}

// ============================================================
// MAPEO DE EDICIÓN → CARPETA DE ICONOS
// ============================================================
const EDITION_TO_ICON_FOLDER: Record<string, string> = {
  'tb': 'tb',
  'bmr': 'bmr',
  'snv': 'snv',
  'carousel': 'carousel',
  'fabled': 'fabled',
  'loric': 'loric',
  'Teensyville': 'tb',
};

// Determinar si un personaje es "evil" (usa _e) o "good" (usa _g)
const getIconSuffix = (type: Character['type']): string => {
  if (type === 'minion' || type === 'demon') return '_e'; // Esbirros y Demonios = evil
  if (type === 'loric' || type === 'fabled') return ''; // Lorics y Legendarios no tienen sufijo
  return '_g'; // Aldeanos, Forasteros, Viajeros = good
};

// Generar URL del icono para un personaje basado en su edición e id
// Usamos la carpeta según la edición del personaje con sufijos _e/_g
const getIconUrl = (type: Character['type'], edition?: string, id?: string): string | undefined => {
  if (!id) return undefined;
  const suffix = getIconSuffix(type);
  const folder = EDITION_TO_ICON_FOLDER[edition || ''] || 'generic';
  return `/${folder}/${id}${suffix}.webp`;
};

// ============================================================
// ORDEN NOCTURNO OFICIAL (firstNight / otherNight)
// Basado en la hoja de orden oficial de BOTC (clocktower.online / botc.app)
// Menor valor = actúa antes. 0 = no actúa esa noche.
// ============================================================
const NIGHT_ORDER_MAP: Record<string, { first: number; other: number }> = {
  // ── Trouble Brewing ─────────────────────────────────────────
  poisoner:       { first: 3,  other: 3  },
  washerwoman:    { first: 10, other: 0  },
  librarian:      { first: 11, other: 0  },
  investigator:   { first: 12, other: 0  },
  chef:           { first: 13, other: 0  },
  empath:         { first: 14, other: 23 },
  fortuneteller:  { first: 15, other: 25 },
  butler:         { first: 16, other: 27 },
  monk:           { first: 0,  other: 4  },
  imp:            { first: 0,  other: 13 },
  scarletwoman:   { first: 0,  other: 7  },
  spy:            { first: 24, other: 47 },
  // ── Bad Moon Rising ─────────────────────────────────────────
  widow:          { first: 3,  other: 0  },
  grandmother:    { first: 17, other: 35 },
  sailor:         { first: 18, other: 36 },
  chambermaid:    { first: 38, other: 49 },
  exorcist:       { first: 22, other: 44 },
  innkeeper:      { first: 21, other: 40 },
  gambler:        { first: 23, other: 43 },
  gossip:         { first: 26, other: 45 },
  cultleader:     { first: 27, other: 47 },
  zombuul:        { first: 0,  other: 11 },
  pukka:          { first: 0,  other: 12 },
  shabaloth:      { first: 0,  other: 13 },
  po:             { first: 0,  other: 14 },
  godfather:      { first: 0,  other: 6  },
  devilsadvocate: { first: 0,  other: 5  },
  assassin:       { first: 0,  other: 8  },
  tinker:         { first: 0,  other: 0  },
  moonchild:      { first: 0,  other: 0  },
  // ── Sects & Violets ─────────────────────────────────────────
  clockmaker:     { first: 14, other: 0  },
  dreamer:        { first: 15, other: 44 },
  snakecharmer:   { first: 16, other: 9  },
  mathematician:  { first: 17, other: 46 },
  flowergirl:     { first: 18, other: 51 },
  towncrier:      { first: 19, other: 52 },
  oracle:         { first: 20, other: 53 },
  savant:         { first: 21, other: 0  },
  seamstress:     { first: 22, other: 47 },
  philosopher:    { first: 28, other: 48 },
  artist:         { first: 29, other: 49 },
  juggler:        { first: 25, other: 50 },
  sage:           { first: 26, other: 33 },
  mutant:         { first: 0,  other: 0  },
  sweetheart:     { first: 0,  other: 0  },
  barber:         { first: 0,  other: 0  },
  hatter:         { first: 0,  other: 0  },
  klutz:          { first: 0,  other: 0  },
  vortox:         { first: 0,  other: 22 },
  vigormortis:    { first: 0,  other: 21 },
  nodashii:       { first: 0,  other: 16 },
  fanggu:         { first: 0,  other: 24 },
  witch:          { first: 0,  other: 5  },
  fearmonger:     { first: 0,  other: 6  },
  cerenovus:      { first: 0,  other: 29 },
  pithag:         { first: 0,  other: 10 },
  psychopath:     { first: 0,  other: 0  },
  // ── Carousel (BMR+SNV+TB extras) ────────────────────────────
  steward:        { first: 9,  other: 0  },
  knight:         { first: 9,  other: 0  },
  noble:          { first: 9,  other: 0  },
  highpriestess:  { first: 30, other: 34 },
  bountyhunter:   { first: 9,  other: 4  },
  shugenja:       { first: 32, other: 63 },
  pixie:          { first: 31, other: 0  },
  preacher:       { first: 34, other: 57 },
  acrobat:        { first: 0,  other: 40 },
  lycanthrope:    { first: 0,  other: 42 },
  balloonist:     { first: 37, other: 58 },
  villageidiot:   { first: 40, other: 0  },
  nightwatchman:  { first: 48, other: 0  },
  engineer:       { first: 47, other: 61 },
  courtier:       { first: 36, other: 37 },
  alsaahir:       { first: 46, other: 60 },
  cannibal:       { first: 0,  other: 0  },
  amnesiac:       { first: 35, other: 0  },
  farmer:         { first: 0,  other: 0  },
  minstrel:       { first: 0,  other: 0  },
  ravenkeeper:    { first: 0,  other: 0  },
  choirboy:       { first: 0,  other: 0  },
  banshee:        { first: 0,  other: 0  },
  tealady:        { first: 0,  other: 67 },
  mayor:          { first: 0,  other: 0  },
  fool:           { first: 0,  other: 0  },
  virgin:         { first: 0,  other: 0  },
  magician:       { first: 0,  other: 0  },
  poppygrower:    { first: 0,  other: 0  },
  pacifist:       { first: 0,  other: 68 },
  atheist:        { first: 0,  other: 0  },
  hermit:         { first: 0,  other: 0  },
  ogre:           { first: 0,  other: 0  },
  lunatic:        { first: 0,  other: 0  },
  drunk:          { first: 0,  other: 0  },
  recluse:        { first: 0,  other: 0  },
  golem:          { first: 0,  other: 0  },
  plaguedoctor:   { first: 0,  other: 0  },
  saint:          { first: 0,  other: 0  },
  heretic:        { first: 0,  other: 0  },
  puzzlemaster:   { first: 0,  other: 0  },
  mezepheles:     { first: 49, other: 31 },
  harpy:          { first: 0,  other: 30 },
  boomdandy:      { first: 0,  other: 0  },
  mastermind:     { first: 0,  other: 0  },
  vizier:         { first: 0,  other: 0  },
  organgrinder:   { first: 0,  other: 0  },
  boffin:         { first: 0,  other: 0  },
  baron:          { first: 0,  other: 0  },
  yaggababble:    { first: 0,  other: 28 },
  lilmonsta:      { first: 0,  other: 15 },
  kazali:         { first: 0,  other: 0  },
  ojo:            { first: 0,  other: 18 },
  legion:         { first: 0,  other: 23 },
  lordoftyphon:   { first: 0,  other: 25 },
  lleech:         { first: 0,  other: 26 },
  alhadikhia:     { first: 0,  other: 27 },
  riot:           { first: 0,  other: 0  },
  leviathan:      { first: 0,  other: 0  },
  summoner:       { first: 0,  other: 19 },
  eviltwin:       { first: 0,  other: 0  },
  goblin:         { first: 0,  other: 0  },
  marionette:     { first: 51, other: 0  },
  wraith:         { first: 0,  other: 20 },
  xaan:           { first: 50, other: 32 },
  snitch:         { first: 0,  other: 0  },
  damsel:         { first: 0,  other: 0  },
  zealot:         { first: 0,  other: 0  },
  politician:     { first: 0,  other: 0  },
  // ── Viajeros ────────────────────────────────────────────────
  thief:          { first: 55, other: 55 },
  bureaucrat:     { first: 56, other: 56 },
  barista:        { first: 52, other: 52 },
  harlot:         { first: 53, other: 53 },
  butcher:        { first: 54, other: 54 },
  gunslinger:     { first: 0,  other: 0  },
  matron:         { first: 0,  other: 0  },
  gangster:       { first: 0,  other: 0  },
  bonecollector:  { first: 57, other: 57 },
  judge:          { first: 0,  other: 0  },
  apprentice:     { first: 58, other: 58 },
  beggar:         { first: 0,  other: 0  },
  deviant:        { first: 0,  other: 0  },
  scapegoat:      { first: 0,  other: 0  },
  gnome:          { first: 0,  other: 0  },
  bishop:         { first: 0,  other: 0  },
  voudon:         { first: 0,  other: 0  },
  // ── Fabled / Loric ──────────────────────────────────────────
  king:           { first: 64, other: 64 },
};

// ============================================================
// MAPEO DE TEAM JSON → TYPE INTERNO
// ============================================================
const TEAM_TO_TYPE: Record<string, Character['type']> = {
  townsfolk: 'townsfolk',
  outsider: 'outsider',
  minion: 'minion',
  demon: 'demon',
  traveller: 'traveller',
  fabled: 'fabled',
  loric: 'loric',
};

// Mapeo de nombres al español (diccionario completo)
const NAME_ES: Record<string, string> = {
  'steward': 'Estudiante',
  'knight': 'Caballero',
  'chef': 'Cocinero',
  'noble': 'Noble',
  'investigator': 'Investigadora',
  'washerwoman': 'Lavandera',
  'clockmaker': 'Relojero',
  'grandmother': 'Abuela',
  'librarian': 'Bibliotecaria',
  'shugenja': 'Shugenja',
  'pixie': 'Hada',
  'bountyhunter': 'Cazadora de Premios',
  'empath': 'Empática',
  'highpriestess': 'Sacerdotisa',
  'sailor': 'Marinero',
  'balloonist': 'Gloatera',
  'general': 'General',
  'preacher': 'Predicadora',
  'chambermaid': 'Camarera',
  'villageidiot': 'Idiota',
  'snakecharmer': 'Encantadora de Serpientes',
  'mathematician': 'Matemático',
  'king': 'Rey',
  'dreamer': 'Soñadora',
  'fortuneteller': 'Adivina',
  'cultleader': 'Culta Líder',
  'flowergirl': 'Florista',
  'towncrier': 'Pregonera',
  'oracle': 'Oráculo',
  'undertaker': 'Enterrador',
  'innkeeper': 'Posadera',
  'monk': 'Monje',
  'gambler': 'Jugadora',
  'acrobat': 'Acrobata',
  'exorcist': 'Exorcista',
  'lycanthrope': 'Licántropa',
  'gossip': 'Cotilla',
  'savant': 'Sabia',
  'alsaahir': 'Alsaahir',
  'engineer': 'Ingeniera',
  'nightwatchman': 'Guardiano Nocturno',
  'courtier': 'Cortesana',
  'seamstress': 'Costurera',
  'philosopher': 'Filósofa',
  'huntsman': 'Cazadora',
  'professor': 'Profesora',
  'artist': 'Artista',
  'slayer': 'Cazadora',
  'fisherman': 'Leñador',
  'princess': 'Princesa',
  'juggler': 'Malabarista',
  'soldier': 'Soldado',
  'alchemist': 'Alquimista',
  'cannibal': 'Cannibal',
  'amnesiac': 'Amnésica',
  'farmer': 'Granjera',
  'minstrel': 'Juglar',
  'ravenkeeper': 'Cuervoguarda',
  'sage': 'Sabihonda',
  'choirboy': 'Corista',
  'banshee': 'Banshee',
  'tealady': 'Señora del Té',
  'mayor': 'Alcalde',
  'fool': 'Bufón',
  'virgin': 'Virgen',
  'magician': 'Maga',
  'poppygrower': 'Cultivadora de Amapolas',
  'pacifist': 'Pacifista',
  'atheist': 'Ata',
  'hermit': 'Ermitaña',
  'butler': 'Mayordomo',
  'goon': 'Matón',
  'ogre': 'Ogro',
  'lunatic': 'Lunática',
  'drunk': 'Borracha',
  'tinker': 'Hojalatera',
  'recluse': 'Ermitaña',
  'golem': 'Golem',
  'sweetheart': 'Novia',
  'plaguedoctor': 'Doctora de la Peste',
  'klutz': 'Patosa',
  'moonchild': 'Hija de la Luna',
  'saint': 'Santa',
  'barber': 'Barbero',
  'hatter': 'Sombrerera',
  'mutant': 'Mutante',
  'politician': 'Política',
  'zealot': 'Zelota',
  'damsel': 'Doncella',
  'snitch': 'Soplona',
  'heretic': 'Hereje',
  'puzzlemaster': 'Rompecabezas',
  'mezepheles': 'Mezepheles',
  'godfather': 'Padrino',
  'poisoner': 'Envenenadora',
  'devilsadvocate': 'Abogada del Diablo',
  'spy': 'Espía',
  'harpy': 'Harpía',
  'witch': 'Bruja',
  'cerenovus': 'Cerenovus',
  'fearmonger': 'Sembradora de Miedo',
  'pithag': 'Pit-Hag',
  'psychopath': 'Psicópata',
  'assassin': 'Asesina',
  'wizard': 'Mago',
  'widow': 'Viuda',
  'xaan': 'Xaan',
  'marionette': 'Marioneta',
  'wraith': 'Fantasma',
  'summoner': 'Invocadora',
  'eviltwin': 'Gemela Malvada',
  'goblin': 'Duende',
  'boomdandy': 'Boomdandy',
  'mastermind': 'Mente Maestra',
  'scarletwoman': 'Mujer Escarlata',
  'vizier': 'Vizir',
  'organgrinder': 'Trituradora',
  'boffin': 'Boffin',
  'baron': 'Barón',
  'yaggababble': 'Yaggababble',
  'pukka': 'Pukka',
  'lilmonsta': 'Lil\' Monsta',
  'nodashii': 'No Dashii',
  'imp': 'Duende',
  'shabaloth': 'Shabaloth',
  'ojo': 'Ojo',
  'kazali': 'Kazali',
  'po': 'Po',
  'zombuul': 'Zombuul',
  'vigormortis': 'Vigormortis',
  'vortox': 'Vortox',
  'legion': 'Legión',
  'fanggu': 'Fang Gu',
  'lordoftyphon': 'Señor de Typhon',
  'lleech': 'Sanguijuela',
  'alhadikhia': 'Al-Hadikhia',
  'riot': 'Motín',
  'leviathan': 'Leviatán',
  'thief': 'Ladrón',
  'bureaucrat': 'Burócrata',
  'barista': 'Barista',
  'harlot': 'Cortesana de Noche',
  'butcher': 'Carnicero',
  'cacklejack': 'Cacklejack',
  'gunslinger': 'Pistolera',
  'matron': 'Matrona',
  'gangster': 'Gangster',
  'bonecollector': 'Coleccionista de Huesos',
  'judge': 'Jueza',
  'apprentice': 'Aprendiz',
  'beggar': 'Pordiosera',
  'deviant': 'Desviada',
  'scapegoat': 'Chivo Expiatorio',
  'gnome': 'Gnoma',
  'bishop': 'Obispa',
  'voudon': 'Voudon',
  'angel': 'Ángel',
  'buddhist': 'Budista',
  'deusexfiasco': 'Deus ex Fiasco',
  'djinn': 'Djinn',
  'doomsayer': 'Profetisa',
  'duchess': 'Duquesa',
  'ferryman': 'Barquera',
  'fibbin': 'Fibbin',
  'fiddler': 'Violinista',
  'hellslibrarian': 'Bibliotecaria del Infierno',
  'revolutionary': 'Revolucionaria',
  'sentinel': 'Centinela',
  'spiritofivory': 'Espíritu del Marfil',
  'toymaker': 'Hacedora de Juguetes',
  'bootlegger': 'Contrabandista',
  'bigwig': 'Mandona',
  'gardener': 'Jardinera',
  'godofug': 'Diosa de Ug',
  'hindu': 'Hindú',
  'knaves': 'Traviesas',
  'pope': 'Papa',
  'stormcatcher': 'Cazatormenta',
  'tor': 'Tor',
  'ventriloquist': 'Ventrílocua',
  'zenomancer': 'Zenomante',
};

// Iconos basados en el personaje (default emojis)
const ICONS: Record<string, string> = {
  'washerwoman': '🧺',
  'librarian': '📚',
  'investigator': '🔍',
  'chef': '👨‍🍳',
  'empath': '💜',
  'fortuneteller': '🔮',
  'undertaker': '⚰️',
  'monk': '🙏',
  'ravenkeeper': '🐦‍⬛',
  'virgin': '👸',
  'slayer': '⚔️',
  'soldier': '🛡️',
  'mayor': '🎩',
  'butler': '🤵',
  'drunk': '🍺',
  'recluse': '🏚️',
  'saint': '😇',
  'poisoner': '☠️',
  'spy': '🕵️',
  'scarletwoman': '💄',
  'baron': '🦹',
  'imp': '😈',
  'grandmother': '👵',
  'sailor': '⚓',
  'chambermaid': '🧹',
  'exorcist': '✝️',
  'innkeeper': '🍻',
  'gambler': '🎲',
  'gossip': '💬',
  'courtier': '👑',
  'professor': '🎓',
  'minstrel': '🎵',
  'tealady': '☕',
  'pacifist': '☮️',
  'fool': '🃏',
  'goon': '💪',
  'lunatic': '🌙',
  'tinker': '🔧',
  'moonchild': '🌛',
  'godfather': '🤵‍♂️',
  'assassin': '🗡️',
  'devilsadvocate': '⚖️',
  'mastermind': '🧠',
  'zombuul': '🧟',
  'pukka': '👿',
  'shabaloth': '👹',
  'po': '💀',
  'clockmaker': '⏰',
  'dreamer': '💭',
  'snakecharmer': '🐍',
  'mathematician': '📐',
  'flowergirl': '🌸',
  'towncrier': '📣',
  'oracle': '🌟',
  'savant': '🧙',
  'seamstress': '🧵',
  'philosopher': '🤔',
  'artist': '🎨',
  'juggler': '🤹',
  'sage': '📖',
  'mutant': '🧬',
  'sweetheart': '💕',
  'barber': '✂️',
  'klutz': '🤦',
  'eviltwin': '👯',
  'witch': '🧙‍♀️',
  'cerenovus': '🎭',
  'pithag': '🕳️',
  'fanggu': '👺',
  'vigormortis': '🦴',
  'nodashii': '🌑',
  'vortox': '🌀',
};

/**
 * Convierte un personaje del formato JSON BOTC estándar al formato interno Character.
 */
function jsonToCharacter(json: JsonCharacter): Character {
  const type = TEAM_TO_TYPE[json.team] ?? (json.team as Character['type']);

  // Usar el mapa oficial de orden nocturno si existe, si no inferir de reminders
  const nightOrder = NIGHT_ORDER_MAP[json.id];
  let firstNight = nightOrder?.first ?? 0;
  let otherNight = nightOrder?.other ?? 0;

  // Fallback: si no está en el mapa pero tiene reminder, le asignamos 99 (al final)
  if (!nightOrder) {
    if (json.firstNightReminder) firstNight = 99;
    if (json.otherNightReminder) otherNight = 99;
  }

  return {
    id: json.id,
    name: NAME_ES[json.id] || json.name,
    type,
    ability: json.ability || '',
    icon: ICONS[json.id] || '👤',
    iconUrl: getIconUrl(type, json.edition, json.id),
    firstNight,
    otherNight,
    firstNightReminder: json.firstNightReminder || '',
    otherNightReminder: json.otherNightReminder || '',
    reminders: json.reminders || [],
    setup: json.setup || false,
  };
}

// ============================================================
// CONVERTIR TODOS LOS PERSONAJES DEL JSON
// ============================================================
const allCharactersFromJson: Character[] = (charactersJson as unknown as JsonCharacter[]).map(jsonToCharacter);

const townsfolkCharacters: Character[] = allCharactersFromJson.filter(c => c.type === 'townsfolk');
const outsiderCharacters: Character[] = allCharactersFromJson.filter(c => c.type === 'outsider');
const minionCharacters: Character[] = allCharactersFromJson.filter(c => c.type === 'minion');
const demonCharacters: Character[] = allCharactersFromJson.filter(c => c.type === 'demon');
const travellerCharacters: Character[] = allCharactersFromJson.filter(c => c.type === 'traveller');
const fabledCharacters: Character[] = allCharactersFromJson.filter(c => c.type === 'fabled');
const loricCharacters: Character[] = allCharactersFromJson.filter(c => c.type === 'loric');
const modifiersCharacters: Character[] = [...fabledCharacters, ...loricCharacters];

// ============================================================
// EXPORTACIONES
// ============================================================
export const ALL_CHARACTERS = allCharactersFromJson;
export { townsfolkCharacters };
export { outsiderCharacters };
export { minionCharacters };
export { demonCharacters };
export { travellerCharacters };
export { fabledCharacters };
export { loricCharacters };
export { modifiersCharacters };

export const TOWNSFOLK_IDS = townsfolkCharacters.map(c => c.id);
export const OUTSIDER_IDS = outsiderCharacters.map(c => c.id);
export const MINION_IDS = minionCharacters.map(c => c.id);
export const DEMON_IDS = demonCharacters.map(c => c.id);
export const TRAVELLER_IDS = travellerCharacters.map(c => c.id);
export const FABLED_IDS = fabledCharacters.map(c => c.id);
export const LORIC_IDS = loricCharacters.map(c => c.id);

// IDs por edición (para scripts oficiales) - usar datos originales del JSON
const jsonCharactersArray = charactersJson as JsonCharacter[];

export const TROUBLE_BREWING_IDS = jsonCharactersArray
  .filter(c => c.edition === 'tb' || c.edition === 'Teensyville')
  .map(c => c.id);

export const BAD_MOON_RISING_IDS = jsonCharactersArray
  .filter(c => c.edition === 'bmr')
  .map(c => c.id);

export const SECTS_VIOLETS_IDS = jsonCharactersArray
  .filter(c => c.edition === 'snv')
  .map(c => c.id);

export const CAROUSEL_IDS = jsonCharactersArray
  .filter(c => c.edition === 'carousel')
  .map(c => c.id);

export const FABLED_EDITION_IDS = jsonCharactersArray
  .filter(c => c.edition === 'fabled')
  .map(c => c.id);

export const LORIC_EDITION_IDS = jsonCharactersArray
  .filter(c => c.edition === 'loric')
  .map(c => c.id);

export function getCharacterById(id: string, customChars: Character[] = []): Character | undefined {
  return [...ALL_CHARACTERS, ...customChars].find(c => c.id === id);
}

export function getCharactersByType(type: Character['type'], chars: Character[] = ALL_CHARACTERS): Character[] {
  return chars.filter(c => c.type === type);
}

export function getCharactersByIds(ids: string[], customChars: Character[] = []): Character[] {
  return ids.map(id => getCharacterById(id, customChars)).filter(Boolean) as Character[];
}