/**
 * Sistema de acciones especiales por rol para Blood on the Clocktower.
 * Define triggers automáticos y acciones manuales de día para cada personaje.
 */

export type ActionTrigger =
  | 'manual'           // Botón manual en el panel del jugador
  | 'on-nominated'     // Se activa cuando ESTE jugador es nominado
  | 'on-nominating'    // Se activa cuando ESTE jugador nomina a alguien
  | 'on-executed'      // Se activa cuando ESTE jugador es ejecutado
  | 'on-death'         // Se activa cuando ESTE jugador muere (cualquier causa)
  | 'on-day-end';      // Recordatorio al final del día

export type ActionResult =
  | 'kill-nominator'    // El nominador muere
  | 'kill-target'       // El objetivo seleccionado muere
  | 'kill-self'         // El propio jugador muere
  | 'evil-wins'         // El mal gana
  | 'good-wins'         // El bien gana
  | 'note'              // Solo añade una nota / recordatorio
  | 'prompt'            // Muestra un diálogo informativo al narrador
  | 'select-target';    // Abre modo selección de objetivo en el tablero

export interface RoleAction {
  id: string;
  characterId: string;
  label: string;
  icon: string;
  description: string;        // Texto de ayuda / regla
  trigger: ActionTrigger;
  result: ActionResult;
  /** Token que marca la habilidad como "ya usada" en player.reminders */
  usedMarker?: string;
  /** Si requiere seleccionar un objetivo en el tablero circular */
  needsTarget?: boolean;
  /** Solo disponible si no tiene este reminder (ya usado) */
  blockedByReminder?: string;
  /** Solo disponible si el jugador está vivo */
  requiresAlive?: boolean;
  /** Color del botón: 'red' | 'orange' | 'yellow' | 'blue' | 'purple' | 'green' */
  color?: string;
  /** Texto de confirmación antes de ejecutar */
  confirmText?: string;
}

// ─────────────────────────────────────────────────────────────
// TROUBLE BREWING
// ─────────────────────────────────────────────────────────────
export const ROLE_ACTIONS: RoleAction[] = [

  // CAZADORA — Disparo único de día
  {
    id: 'slayer-shoot',
    characterId: 'slayer',
    label: 'Disparar',
    icon: '⚔️',
    description: 'Una vez por partida: elige a un jugador públicamente. Si es el Demonio, muere.',
    trigger: 'manual',
    result: 'select-target',
    needsTarget: true,
    usedMarker: 'Sin Disparo',
    blockedByReminder: 'Sin Disparo',
    requiresAlive: true,
    color: 'red',
    confirmText: undefined,
  },

  // VIRGEN — Auto-trigger al ser nominada
  {
    id: 'virgin-nominated',
    characterId: 'virgin',
    label: 'Primera nominación',
    icon: '👸',
    description: 'Si la Virgen es nominada por primera vez por un Aldeano, ese Aldeano muere inmediatamente.',
    trigger: 'on-nominated',
    result: 'kill-nominator',
    usedMarker: 'Sin Virginidad',
    blockedByReminder: 'Sin Virginidad',
    requiresAlive: true,
    color: 'orange',
  },

  // ALCALDE — Victoria especial
  {
    id: 'mayor-win',
    characterId: 'mayor',
    label: 'Reclamar victoria',
    icon: '🎩',
    description: 'Si solo quedan 3 jugadores vivos y no hay ejecución hoy, el Bien gana.',
    trigger: 'manual',
    result: 'good-wins',
    requiresAlive: true,
    color: 'blue',
    confirmText: '¿Confirmas la victoria del Bien por la habilidad del Alcalde? (Debe haber exactamente 3 jugadores vivos y no haber habido ejecución hoy)',
  },

  // ARTISTA — Pregunta privada
  {
    id: 'artist-question',
    characterId: 'artist',
    label: 'Hacer pregunta privada',
    icon: '🎨',
    description: 'Una vez por partida, de día: el Artista hace una pregunta de sí/no al Narrador (no puede mentir).',
    trigger: 'manual',
    result: 'prompt',
    usedMarker: 'Sin Arte',
    blockedByReminder: 'Sin Arte',
    requiresAlive: true,
    color: 'purple',
  },

  // COTILLA — Declaración pública
  {
    id: 'gossip-declare',
    characterId: 'gossip',
    label: 'Declaración pública',
    icon: '💬',
    description: 'Cada día puedes hacer una declaración pública. Esta noche, si era verdad, un jugador muere.',
    trigger: 'manual',
    result: 'note',
    requiresAlive: true,
    color: 'yellow',
  },

  // BUFÓN — Recordatorio primera muerte
  {
    id: 'fool-survives',
    characterId: 'fool',
    label: 'Sobrevive a primera muerte',
    icon: '🃏',
    description: 'La primera vez que debería morir, no muere. Marca este token al usarlo.',
    trigger: 'on-death',
    result: 'prompt',
    usedMarker: 'Sin Locura',
    blockedByReminder: 'Sin Locura',
    requiresAlive: true,
    color: 'yellow',
    confirmText: '¿Es esta la primera vez que el Bufón muere? Si es así, NO muere y se marca su habilidad como usada.',
  },

  // PACIFISTA — Puede salvar de ejecución
  {
    id: 'pacifist-save',
    characterId: 'pacifist',
    label: 'Puede salvar ejecutado bueno',
    icon: '☮️',
    description: 'Los jugadores buenos ejecutados pueden no morir. El Narrador decide.',
    trigger: 'on-executed',
    result: 'prompt',
    requiresAlive: true,
    color: 'blue',
  },

  // ─────────────────────────────────────────────────────────────
  // BAD MOON RISING
  // ─────────────────────────────────────────────────────────────

  // HOJALATERO — Puede morir en cualquier momento
  {
    id: 'tinker-dies',
    characterId: 'tinker',
    label: 'Muerte aleatoria',
    icon: '🔧',
    description: 'El Hojalatero puede morir en cualquier momento. El Narrador puede matarle cuando quiera.',
    trigger: 'manual',
    result: 'kill-self',
    requiresAlive: true,
    color: 'orange',
    confirmText: '¿Deseas matar al Hojalatero ahora? Puede morir en cualquier momento de la partida.',
  },

  // HIJO DE LA LUNA — Al morir, señala a un jugador
  {
    id: 'moonchild-death',
    characterId: 'moonchild',
    label: 'Señalar al morir',
    icon: '🌛',
    description: 'Cuando el Hijo de la Luna aprende que muere, puede señalar a un jugador vivo. Si es bueno, muere.',
    trigger: 'on-death',
    result: 'select-target',
    needsTarget: true,
    color: 'purple',
  },

  // PATOSO — Al morir, señala a un jugador (obligatorio)
  {
    id: 'klutz-death',
    characterId: 'klutz',
    label: '¡Señalar obligatorio!',
    icon: '🤦',
    description: 'Al morir, el Patoso DEBE señalar a un jugador vivo inmediatamente. Si es bueno, el Mal gana.',
    trigger: 'on-death',
    result: 'select-target',
    needsTarget: true,
    color: 'red',
  },

  // ABOGADO DEL DIABLO — Recordatorio en ejecución
  {
    id: 'devils-advocate-reminder',
    characterId: 'devils_advocate',
    label: 'Protegido de ejecución',
    icon: '⚖️',
    description: 'Si el Abogado del Diablo eligió a este jugador anoche, podría no morir al ser ejecutado.',
    trigger: 'on-executed',
    result: 'prompt',
    requiresAlive: true,
    color: 'orange',
  },

  // MENTE MAESTRA — Si el demonio muere ejecutado
  {
    id: 'mastermind-continues',
    characterId: 'mastermind',
    label: 'El juego continúa',
    icon: '🧠',
    description: 'Si el Demonio muere ejecutado y la Mente Maestra está viva, el juego continúa una vez más.',
    trigger: 'on-executed',
    result: 'prompt',
    requiresAlive: true,
    color: 'red',
  },

  // ─────────────────────────────────────────────────────────────
  // SECTS & VIOLETS
  // ─────────────────────────────────────────────────────────────

  // FILÓSOFA — Elegir habilidad (recordatorio de día)
  {
    id: 'philosopher-choose',
    characterId: 'philosopher',
    label: 'Habilidad activa',
    icon: '🤔',
    description: 'La Filósofa tiene una habilidad de Aldeano activa. Recuerda indicarle qué personaje está interpretando.',
    trigger: 'manual',
    result: 'note',
    blockedByReminder: 'Sin Filosofía',
    requiresAlive: true,
    color: 'purple',
  },

  // GEMELO MALVADO — Si cualquier gemelo es ejecutado
  {
    id: 'evil-twin-execution',
    characterId: 'evil_twin',
    label: '¡Ejecución de Gemelo!',
    icon: '👯',
    description: 'Si cualquiera de los dos gemelos muere ejecutado, el Mal gana inmediatamente.',
    trigger: 'on-executed',
    result: 'evil-wins',
    requiresAlive: false,
    color: 'red',
    confirmText: '¿El ejecutado es uno de los Gemelos? Si es así, ¡el Mal gana!',
  },

  // BRUJA — Si un jugador maldito nomina
  {
    id: 'witch-curse',
    characterId: 'witch',
    label: 'Jugador maldito nomina',
    icon: '🧙‍♀️',
    description: 'Si un jugador maldito por la Bruja nomina hoy, muere inmediatamente.',
    trigger: 'on-nominating',
    result: 'kill-self',
    requiresAlive: false,
    color: 'purple',
    confirmText: '¿Este jugador estaba maldito por la Bruja? Si es así, muere al nominar.',
  },

  // MUTANTE — Declararse demente
  {
    id: 'mutant-insane',
    characterId: 'mutant',
    label: 'Declararse demente',
    icon: '🧬',
    description: 'El Mutante puede declarar públicamente que cree ser malvado. Si lo hace y no actúa como tal, puede ser ejecutado.',
    trigger: 'manual',
    result: 'note',
    requiresAlive: true,
    color: 'orange',
  },

  // ─────────────────────────────────────────────────────────────
  // OUTSIDERS ESPECIALES
  // ─────────────────────────────────────────────────────────────

  // SANTA — Al ser ejecutada, el Mal gana
  {
    id: 'saint-execution',
    characterId: 'saint',
    label: '¡El Mal gana!',
    icon: '😇',
    description: 'Si la Santa es ejecutada, el Mal gana inmediatamente.',
    trigger: 'on-executed',
    result: 'evil-wins',
    requiresAlive: true,
    color: 'red',
    confirmText: '¿Confirmas que la Santa ha sido ejecutada? ¡Esto significa que el MAL GANA!',
  },

  // ─────────────────────────────────────────────────────────────
  // DEMONIOS ESPECIALES
  // ─────────────────────────────────────────────────────────────

  // ZOMBUUL — Primera ejecución no mata
  {
    id: 'zombuul-first-execution',
    characterId: 'zombuul',
    label: 'Primera ejecución',
    icon: '🧟',
    description: 'La primera vez que el Zombuul es "ejecutado", no muere. Marca este token.',
    trigger: 'on-executed',
    result: 'prompt',
    usedMarker: 'Primera Ejecución',
    blockedByReminder: 'Primera Ejecución',
    requiresAlive: true,
    color: 'orange',
    confirmText: '¿Es esta la primera ejecución del Zombuul? Si es así, NO muere. Se marcará su token como "Primera Ejecución" usada.',
  },

  // VORTOX — Recordatorio fin de día
  {
    id: 'vortox-no-execution',
    characterId: 'vortox',
    label: 'Sin ejecución = Mal gana',
    icon: '🌀',
    description: 'Con el Vortox en juego, si no hay ejecución hoy, el Mal gana al anochecer.',
    trigger: 'on-day-end',
    result: 'evil-wins',
    requiresAlive: true,
    color: 'red',
    confirmText: '¿No hubo ejecución hoy con el Vortox vivo? ¡El MAL GANA!',
  },

  // MUJER ESCARLATA — Recordatorio si el Demonio muere con 5+ vivos
  {
    id: 'scarlet-woman-rises',
    characterId: 'scarlet_woman',
    label: 'Convertirse en Demonio',
    icon: '💄',
    description: 'Si hay 5+ jugadores vivos y el Demonio muere, la Mujer Escarlata se convierte en el nuevo Demonio.',
    trigger: 'on-death',
    result: 'prompt',
    requiresAlive: true,
    color: 'red',
    confirmText: '¿Hay 5 o más jugadores vivos y el Demonio acaba de morir? La Mujer Escarlata se convierte en el nuevo Demonio. Actualiza su token de personaje manualmente.',
  },
];

/** Obtiene todas las acciones para un personaje concreto */
export function getActionsForCharacter(characterId: string): RoleAction[] {
  return ROLE_ACTIONS.filter(a => a.characterId === characterId);
}

/** Obtiene las acciones de trigger automático al nominar al jugador */
export function getOnNominatedActions(characterId: string): RoleAction[] {
  return ROLE_ACTIONS.filter(a => a.characterId === characterId && a.trigger === 'on-nominated');
}

/** Obtiene las acciones de trigger al ejecutar al jugador */
export function getOnExecutedActions(characterId: string): RoleAction[] {
  return ROLE_ACTIONS.filter(a => a.characterId === characterId && a.trigger === 'on-executed');
}

/** Obtiene las acciones de trigger al morir el jugador */
export function getOnDeathActions(characterId: string): RoleAction[] {
  return ROLE_ACTIONS.filter(a => a.characterId === characterId && a.trigger === 'on-death');
}

/** Obtiene las acciones de trigger al nominar ESTE jugador a otro */
export function getOnNominatingActions(characterId: string): RoleAction[] {
  return ROLE_ACTIONS.filter(a => a.characterId === characterId && a.trigger === 'on-nominating');
}

/** Comprueba si una acción está bloqueada por un reminder del jugador */
export function isActionBlocked(action: RoleAction, playerReminders: string[]): boolean {
  if (!action.blockedByReminder) return false;
  return playerReminders.includes(action.blockedByReminder);
}

/** Color CSS del botón de acción */
export function getActionColorClasses(color?: string): string {
  switch (color) {
    case 'red':    return 'bg-red-950/40 border-red-800/50 text-red-300 hover:bg-red-900/50';
    case 'orange': return 'bg-orange-950/40 border-orange-800/50 text-orange-300 hover:bg-orange-900/50';
    case 'yellow': return 'bg-yellow-950/40 border-yellow-800/50 text-yellow-300 hover:bg-yellow-900/50';
    case 'blue':   return 'bg-blue-950/40 border-blue-800/50 text-blue-300 hover:bg-blue-900/50';
    case 'purple': return 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:bg-purple-900/50';
    case 'green':  return 'bg-green-950/40 border-green-800/50 text-green-300 hover:bg-green-900/50';
    default:       return 'bg-dark-400 border-dark-200 text-gothic-300 hover:bg-dark-300';
  }
}
