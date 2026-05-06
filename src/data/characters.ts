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

  // Determinar firstNight y otherNight basados en el reminder
  let firstNight = 0;
  let otherNight = 0;

  if (json.firstNightReminder) {
    firstNight = 1;
  }
  if (json.otherNightReminder) {
    otherNight = 1;
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