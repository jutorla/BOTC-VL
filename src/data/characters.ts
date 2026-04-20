import type { Character } from '../types';

// ============================================================
// TROUBLE BREWING (Edición para principiantes)
// ============================================================
const troubleBrewingCharacters: Character[] = [
  // TOWNSFOLK
  {
    id: 'washerwoman', name: 'Lavandera', type: 'townsfolk', icon: '🧺',
    ability: 'Sabes que uno de los dos jugadores es un Aldeano concreto, pero no cuál.',
    firstNight: 3, firstNightReminder: 'Señala 2 jugadores. Uno de ellos es el Aldeano que eliges.',
    reminders: ['Aldeano', 'Señuelo'],
  },
  {
    id: 'librarian', name: 'Bibliotecaria', type: 'townsfolk', icon: '📚',
    ability: 'Sabes que uno de los dos jugadores es un Forastero concreto, o que no hay ningún Forastero en juego.',
    firstNight: 4, firstNightReminder: 'Señala 2 jugadores. Uno es el Forastero que eliges, o muestra el token "Sin Forasteros".',
    reminders: ['Forastero', 'Señuelo'],
  },
  {
    id: 'investigator', name: 'Investigadora', type: 'townsfolk', icon: '🔍',
    ability: 'Sabes que uno de los dos jugadores es un Esbirro concreto, pero no cuál.',
    firstNight: 5, firstNightReminder: 'Señala 2 jugadores. Uno es el Esbirro que eliges.',
    reminders: ['Esbirro', 'Señuelo'],
  },
  {
    id: 'chef', name: 'Cocinero', type: 'townsfolk', icon: '👨‍🍳',
    ability: 'Sabes cuántos pares de jugadores malvados están sentados uno al lado del otro.',
    firstNight: 6, firstNightReminder: 'Cuenta los pares de jugadores malvados adyacentes y muestra ese número.',
    reminders: [],
  },
  {
    id: 'empath', name: 'Empática', type: 'townsfolk', icon: '💜',
    ability: 'Cada noche sabes cuántos de tus 2 vecinos vivos son malvados.',
    firstNight: 7, firstNightReminder: 'Muestra cuántos vecinos vivos son malvados (0, 1 ó 2).',
    otherNight: 7, otherNightReminder: 'Muestra cuántos vecinos vivos son malvados (0, 1 ó 2).',
    reminders: [],
  },
  {
    id: 'fortune_teller', name: 'Adivina', type: 'townsfolk', icon: '🔮',
    ability: 'Cada noche eliges a 2 jugadores: sabrás si alguno de ellos es el Demonio. Puede haber un "falso positivo".',
    firstNight: 8, firstNightReminder: 'Señala 2 jugadores. Si alguno es el Demonio (o el señuelo), asiente.',
    otherNight: 8, otherNightReminder: 'Señala 2 jugadores. Si alguno es el Demonio (o el señuelo), asiente.',
    reminders: ['Señuelo del Demonio'],
    setup: true,
  },
  {
    id: 'undertaker', name: 'Enterrador', type: 'townsfolk', icon: '⚰️',
    ability: 'Cada noche (excepto la primera), sabes qué personaje fue ejecutado hoy.',
    otherNight: 10, otherNightReminder: 'Muestra el token del personaje ejecutado hoy.',
    reminders: [],
  },
  {
    id: 'monk', name: 'Monje', type: 'townsfolk', icon: '🙏',
    ability: 'Cada noche (excepto la primera), eliges a un jugador (que no seas tú): esta noche está protegido del Demonio.',
    otherNight: 4, otherNightReminder: 'El jugador elegido está protegido del ataque del Demonio esta noche.',
    reminders: ['Protegido'],
  },
  {
    id: 'ravenkeeper', name: 'Cuervoguarda', type: 'townsfolk', icon: '🐦‍⬛',
    ability: 'Si mueres por la noche, eliges a un jugador y sabes su personaje.',
    otherNight: 11, otherNightReminder: 'Si murió esta noche, se despierta, señala a un jugador y se le muestra su token de personaje.',
    reminders: [],
  },
  {
    id: 'virgin', name: 'Virgen', type: 'townsfolk', icon: '👸',
    ability: 'La primera vez que seas nominada, si el Nominador es un Aldeano, ese Aldeano es inmediatamente ejecutado.',
    reminders: ['Sin Virginidad'],
  },
  {
    id: 'slayer', name: 'Cazadora', type: 'townsfolk', icon: '⚔️',
    ability: 'Una vez por partida, de día, puedes señalar públicamente a un jugador: si es el Demonio, muere.',
    reminders: ['Sin Disparo'],
  },
  {
    id: 'soldier', name: 'Soldado', type: 'townsfolk', icon: '🛡️',
    ability: 'Eres inmune al ataque del Demonio.',
    reminders: [],
  },
  {
    id: 'mayor', name: 'Alcalde', type: 'townsfolk', icon: '🎩',
    ability: 'Si solo quedan 3 jugadores vivos y no se produce ninguna ejecución, el Bien gana. Si mueres de noche, puede que alguien más muera en tu lugar.',
    reminders: [],
  },

  // OUTSIDERS
  {
    id: 'butler', name: 'Mayordomo', type: 'outsider', icon: '🤵',
    ability: 'Cada noche eliges a un jugador (excepto tú): mañana solo puedes votar si el jugador elegido lo hace primero.',
    firstNight: 9, firstNightReminder: 'El Mayordomo señala a su amo.',
    otherNight: 9, otherNightReminder: 'El Mayordomo señala a su amo.',
    reminders: ['Amo'],
  },
  {
    id: 'drunk', name: 'Borracho', type: 'outsider', icon: '🍺',
    ability: 'No sabes que eres el Borracho. Crees que eres un Aldeano, pero el Narrador puede darte información falsa.',
    reminders: ['El Borracho es...'],
    setup: true,
  },
  {
    id: 'recluse', name: 'Ermitaña', type: 'outsider', icon: '🏚️',
    ability: 'Puedes registrarte como malvada y como Esbirro o Demonio, aunque no lo seas.',
    reminders: [],
  },
  {
    id: 'saint', name: 'Santa', type: 'outsider', icon: '😇',
    ability: 'Si eres ejecutada, el Mal gana.',
    reminders: [],
  },

  // MINIONS
  {
    id: 'poisoner', name: 'Envenenadora', type: 'minion', icon: '☠️',
    ability: 'Cada noche eliges a un jugador: está envenenado esta noche y mañana.',
    firstNight: 2, firstNightReminder: 'El jugador elegido está envenenado.',
    otherNight: 2, otherNightReminder: 'El jugador elegido está envenenado.',
    reminders: ['Envenenado'],
  },
  {
    id: 'spy', name: 'Espía', type: 'minion', icon: '🕵️',
    ability: 'Cada noche ves el Grimorio. Puedes registrarte como bueno y como cualquier Aldeano o Forastero.',
    firstNight: 11, firstNightReminder: 'Muestra el Grimorio al Espía.',
    otherNight: 12, otherNightReminder: 'Muestra el Grimorio al Espía.',
    reminders: [],
  },
  {
    id: 'scarlet_woman', name: 'Mujer Escarlata', type: 'minion', icon: '💄',
    ability: 'Si hay 5 o más jugadores vivos y el Demonio muere, te conviertes en el Demonio.',
    otherNight: 5, otherNightReminder: 'Si el Demonio murió hoy y hay 5+ vivos, la Mujer Escarlata se convierte en Demonio.',
    reminders: ['Demonio'],
  },
  {
    id: 'baron', name: 'Barón', type: 'minion', icon: '🦹',
    ability: 'Hay 2 Forasteros extra en juego.',
    setup: true,
    reminders: [],
  },

  // DEMONS
  {
    id: 'imp', name: 'Duende', type: 'demon', icon: '😈',
    ability: 'Cada noche (excepto la primera) eliges a un jugador: muere. Si te matas, un Esbirro se convierte en el Duende.',
    otherNight: 6, otherNightReminder: 'El jugador elegido muere. Si elige a sí mismo, muere y un Esbirro se convierte en Duende.',
    reminders: ['Muere'],
  },
];

// ============================================================
// BAD MOON RISING (Edición intermedia)
// ============================================================
const badMoonRisingCharacters: Character[] = [
  // TOWNSFOLK
  {
    id: 'grandmother', name: 'Abuela', type: 'townsfolk', icon: '👵',
    ability: 'La primera noche, sabes un jugador al azar y su personaje. Si el Demonio lo mata, también mueres.',
    firstNight: 10, firstNightReminder: 'Señala a un jugador bueno y muestra su personaje a la Abuela.',
    reminders: ['Nieto/a'],
  },
  {
    id: 'sailor', name: 'Marinero', type: 'townsfolk', icon: '⚓',
    ability: 'Cada noche eliges a un jugador vivo: ninguno de los dos podéis morir esta noche. Uno de vosotros puede estar borracho.',
    firstNight: 4, firstNightReminder: 'El Marinero elige a un jugador. Ese jugador o el Marinero están borrachos.',
    otherNight: 4, otherNightReminder: 'El Marinero elige a un jugador. Ese jugador o el Marinero están borrachos.',
    reminders: ['Borracho'],
  },
  {
    id: 'chambermaid', name: 'Camarera', type: 'townsfolk', icon: '🧹',
    ability: 'Cada noche eliges a 2 jugadores vivos (ni el Demonio ni tú): sabrás cuántos de ellos se han despertado esta noche por su habilidad.',
    otherNight: 15, otherNightReminder: 'La Camarera señala 2 jugadores. Muéstrale cuántos se despertaron esta noche.',
    reminders: [],
  },
  {
    id: 'exorcist', name: 'Exorcista', type: 'townsfolk', icon: '✝️',
    ability: 'Cada noche (excepto la primera) eliges a un jugador (diferente del anterior): si es el Demonio, este no actúa esta noche.',
    otherNight: 11, otherNightReminder: 'Si el Exorcista elige al Demonio, el Demonio no actúa esta noche.',
    reminders: ['Exorcizado'],
  },
  {
    id: 'innkeeper', name: 'Posadero', type: 'townsfolk', icon: '🍻',
    ability: 'Cada noche (excepto la primera) eliges a 2 jugadores: están protegidos del Demonio. Uno de ellos puede estar borracho.',
    otherNight: 7, otherNightReminder: 'Los 2 elegidos están protegidos. Uno puede estar borracho.',
    reminders: ['Protegido', 'Borracho'],
  },
  {
    id: 'gambler', name: 'Jugador', type: 'townsfolk', icon: '🎲',
    ability: 'Cada noche (excepto la primera) eliges a un jugador y un personaje: si te equivocas, mueres.',
    otherNight: 12, otherNightReminder: 'Si la apuesta del Jugador es incorrecta, muere.',
    reminders: [],
  },
  {
    id: 'gossip', name: 'Cotilla', type: 'townsfolk', icon: '💬',
    ability: 'Cada día puedes hacer una declaración pública. Esta noche, si la declaración era verdadera, un jugador muere.',
    otherNight: 13, otherNightReminder: 'Si la declaración de hoy era verdadera, elige a un jugador para que muera.',
    reminders: ['Declaración'],
  },
  {
    id: 'courtier', name: 'Cortesana', type: 'townsfolk', icon: '👑',
    ability: 'Una vez por partida, de noche, eliges a un personaje: si está en juego, ese jugador está borracho por 3 noches y días.',
    firstNight: 11, firstNightReminder: 'La Cortesana puede elegir un personaje para emborrachar.',
    otherNight: 16, otherNightReminder: 'Si no ha usado su habilidad, puede elegir un personaje para emborrachar.',
    reminders: ['Borracho 1', 'Borracho 2', 'Borracho 3'],
  },
  {
    id: 'professor', name: 'Profesora', type: 'townsfolk', icon: '🎓',
    ability: 'Una vez por partida, de noche, puedes resucitar a un jugador muerto si es un Aldeano.',
    otherNight: 14, otherNightReminder: 'Si no ha usado su habilidad, la Profesora puede resucitar a un Aldeano muerto.',
    reminders: ['Sin Resurrección'],
  },
  {
    id: 'minstrel', name: 'Juglar', type: 'townsfolk', icon: '🎵',
    ability: 'Cuando un Esbirro muere ejecutado, todos los demás jugadores (excepto tú) están borrachos hasta el anochecer de mañana.',
    reminders: ['Todos Borrachos'],
  },
  {
    id: 'tea_lady', name: 'Señora del Té', type: 'townsfolk', icon: '☕',
    ability: 'Si ambos vecinos vivos son buenos, ninguno de ellos puede morir.',
    reminders: [],
  },
  {
    id: 'pacifist', name: 'Pacifista', type: 'townsfolk', icon: '☮️',
    ability: 'Los jugadores buenos ejecutados pueden no morir.',
    reminders: [],
  },
  {
    id: 'fool', name: 'Bufón', type: 'townsfolk', icon: '🃏',
    ability: 'La primera vez que deberías morir, no mueres.',
    reminders: ['Sin Locura'],
  },

  // OUTSIDERS
  {
    id: 'goon', name: 'Matón', type: 'outsider', icon: '💪',
    ability: 'Cada noche, el primer jugador que elija a otro jugador cambia de alineamiento hacia el bien o el mal para igualarse al tuyo.',
    reminders: [],
  },
  {
    id: 'lunatic', name: 'Lunático', type: 'outsider', icon: '🌙',
    ability: 'Crees que eres el Demonio pero no lo eres. El Narrador sabe cuál es.',
    firstNight: 3, firstNightReminder: 'Trata al Lunático como si fuera el Demonio pero sus elecciones no tienen efecto.',
    otherNight: 2, otherNightReminder: 'El Lunático elige a jugadores como si fuera el Demonio, pero sin efecto.',
    reminders: [],
    setup: true,
  },
  {
    id: 'tinker', name: 'Hojalatero', type: 'outsider', icon: '🔧',
    ability: 'Puedes morir en cualquier momento.',
    reminders: [],
  },
  {
    id: 'moonchild', name: 'Hijo de la Luna', type: 'outsider', icon: '🌛',
    ability: 'Cuando aprendes que mueres, puedes señalar públicamente a un jugador vivo. Si es bueno, muere.',
    reminders: [],
  },

  // MINIONS
  {
    id: 'godfather', name: 'Padrino', type: 'minion', icon: '🤵‍♂️',
    ability: 'Sabes qué Forasteros están en juego. Cada noche (excepto la primera), puedes elegir a un jugador: muere. Si el Forastero que muere hoy hace daño, no lo hace.',
    firstNight: 2, firstNightReminder: 'Muestra al Padrino los tokens de los Forasteros en juego.',
    otherNight: 3, otherNightReminder: 'El Padrino puede elegir a un jugador para matar.',
    reminders: ['Muere'],
  },
  {
    id: 'assassin', name: 'Asesina', type: 'minion', icon: '🗡️',
    ability: 'Una vez por partida, de noche, eliges a un jugador: muere, incluso si está protegido.',
    otherNight: 6, otherNightReminder: 'Si no ha usado su habilidad, la Asesina puede elegir a un jugador para matar.',
    reminders: ['Sin Asesinato'],
  },
  {
    id: 'devils_advocate', name: 'Abogado del Diablo', type: 'minion', icon: '⚖️',
    ability: 'Cada noche eliges a un jugador vivo (diferente del anterior): si es ejecutado mañana, no muere.',
    otherNight: 4, otherNightReminder: 'El elegido está protegido de la ejecución.',
    reminders: ['Protegido de Ejecución'],
  },
  {
    id: 'mastermind', name: 'Mente Maestra', type: 'minion', icon: '🧠',
    ability: 'Si el Demonio muere ejecutado, el juego continúa (solo una vez). Si el Mal gana entonces, gana el Bien.',
    reminders: [],
  },

  // DEMONS
  {
    id: 'zombuul', name: 'Zombuul', type: 'demon', icon: '🧟',
    ability: 'Cada noche (excepto la primera) puedes elegir a un jugador: muere. La primera vez que seas "ejecutado", no mueres.',
    otherNight: 8, otherNightReminder: 'El Zombuul elige a un jugador para matar. La primera vez que sea "ejecutado", no muere.',
    reminders: ['Muere', 'Primera Ejecución'],
  },
  {
    id: 'pukka', name: 'Pukka', type: 'demon', icon: '👿',
    ability: 'Cada noche eliges a un jugador: está envenenado. El jugador que estaba envenenado antes muere entonces.',
    firstNight: 8, firstNightReminder: 'El Pukka elige a un jugador para envenenar.',
    otherNight: 8, otherNightReminder: 'El jugador anteriormente envenenado muere. El Pukka elige a un nuevo jugador para envenenar.',
    reminders: ['Envenenado'],
  },
  {
    id: 'shabaloth', name: 'Shabaloth', type: 'demon', icon: '👹',
    ability: 'Cada noche (excepto la primera) eliges a 2 jugadores: mueren. Puede que resucites a un jugador muerto.',
    otherNight: 8, otherNightReminder: 'El Shabaloth elige 2 jugadores para matar. Puede resucitar a uno muerto.',
    reminders: ['Muere'],
  },
  {
    id: 'po', name: 'Po', type: 'demon', icon: '💀',
    ability: 'Cada noche puedes elegir a un jugador: muere. Si eliges a nadie 3 noches seguidas, en la siguiente noche matas a 3 jugadores.',
    otherNight: 8, otherNightReminder: 'El Po puede elegir a un jugador o no elegir a nadie (acumulando cargas).',
    reminders: ['Muere', 'Carga x1', 'Carga x2'],
  },
];

// ============================================================
// SECTS & VIOLETS (Edición intermedia-avanzada)
// ============================================================
const sectsVioletsCharacters: Character[] = [
  // TOWNSFOLK
  {
    id: 'clockmaker', name: 'Relojero', type: 'townsfolk', icon: '⏰',
    ability: 'La primera noche, sabes cuántos pasos (en la mesa) separan al Demonio del Esbirro más cercano.',
    firstNight: 10, firstNightReminder: 'Muestra al Relojero el número de pasos entre el Demonio y el Esbirro más cercano.',
    reminders: [],
  },
  {
    id: 'dreamer', name: 'Soñadora', type: 'townsfolk', icon: '💭',
    ability: 'Cada noche eliges a un jugador vivo (ni el Demonio ni tú): te muestran 1 personaje bueno verdadero y 1 personaje falso del mismo tipo.',
    firstNight: 11, firstNightReminder: 'La Soñadora señala a un jugador. Muéstrale su personaje verdadero y uno falso del mismo tipo.',
    otherNight: 10, otherNightReminder: 'La Soñadora señala a un jugador. Muéstrale su personaje verdadero y uno falso del mismo tipo.',
    reminders: [],
  },
  {
    id: 'snake_charmer', name: 'Encantadora de Serpientes', type: 'townsfolk', icon: '🐍',
    ability: 'Cada noche eliges a un jugador vivo: si es el Demonio, intercambiáis personajes y alineamientos. Eres el nuevo Demonio.',
    firstNight: 9, firstNightReminder: 'Si la Encantadora elige al Demonio, intercambian personajes.',
    otherNight: 9, otherNightReminder: 'Si la Encantadora elige al Demonio, intercambian personajes.',
    reminders: ['Envenenado'],
  },
  {
    id: 'mathematician', name: 'Matemático', type: 'townsfolk', icon: '📐',
    ability: 'Cada noche sabes cuántos jugadores tienen una habilidad que no funciona como debería (borrachera/envenenamiento).',
    firstNight: 17, firstNightReminder: 'Muestra cuántas habilidades no funcionan correctamente.',
    otherNight: 17, otherNightReminder: 'Muestra cuántas habilidades no funcionan correctamente.',
    reminders: [],
  },
  {
    id: 'flowergirl', name: 'Florista', type: 'townsfolk', icon: '🌸',
    ability: 'Cada noche (excepto la primera) sabrás si el Demonio votó hoy.',
    otherNight: 11, otherNightReminder: 'Muestra si el Demonio votó durante el día.',
    reminders: [],
  },
  {
    id: 'town_crier', name: 'Pregonero', type: 'townsfolk', icon: '📣',
    ability: 'Cada noche (excepto la primera) sabrás si un Esbirro nominó hoy.',
    otherNight: 12, otherNightReminder: 'Muestra si algún Esbirro nominó durante el día.',
    reminders: [],
  },
  {
    id: 'oracle', name: 'Oráculo', type: 'townsfolk', icon: '🌟',
    ability: 'Cada noche (excepto la primera) sabrás cuántos jugadores muertos son malvados.',
    otherNight: 13, otherNightReminder: 'Muestra cuántos jugadores muertos son malvados.',
    reminders: [],
  },
  {
    id: 'savant', name: 'Sabio', type: 'townsfolk', icon: '🧙',
    ability: 'Cada día puedes ir al Narrador para recibir 2 hechos sobre el juego, siendo al menos 1 verdad.',
    reminders: [],
  },
  {
    id: 'seamstress', name: 'Costurera', type: 'townsfolk', icon: '🧵',
    ability: 'Una vez por partida, de noche, eliges a 2 jugadores (ni el Demonio ni tú): sabrás si son del mismo alineamiento.',
    firstNight: 12, firstNightReminder: 'La Costurera puede elegir 2 jugadores. Muestra si tienen el mismo alineamiento.',
    otherNight: 14, otherNightReminder: 'Si no ha usado su habilidad, puede elegir 2 jugadores.',
    reminders: ['Sin Costura'],
  },
  {
    id: 'philosopher', name: 'Filósofa', type: 'townsfolk', icon: '🤔',
    ability: 'Una vez por partida, de noche, eliges un personaje de Aldeano: obtienes esa habilidad y (si está en juego) ese Aldeano está borracho.',
    firstNight: 3, firstNightReminder: 'La Filósofa puede elegir un personaje de Aldeano para obtener su habilidad.',
    otherNight: 3, otherNightReminder: 'La Filósofa puede elegir un personaje de Aldeano para obtener su habilidad.',
    reminders: ['Borracho', 'Sin Filosofía'],
  },
  {
    id: 'artist', name: 'Artista', type: 'townsfolk', icon: '🎨',
    ability: 'Una vez por partida, de día, puedes hacer una pregunta privada sí/no al Narrador (el Narrador no puede mentir).',
    reminders: ['Sin Arte'],
  },
  {
    id: 'juggler', name: 'Malabarista', type: 'townsfolk', icon: '🤹',
    ability: 'El primer día, puedes hacer públicamente hasta 5 suposiciones del tipo "El jugador X es el personaje Y". Al anochecer, sabrás cuántas eran correctas.',
    firstNight: 16, firstNightReminder: 'Muestra cuántas suposiciones del Malabarista eran correctas.',
    reminders: [],
  },
  {
    id: 'sage', name: 'Sabihondo', type: 'townsfolk', icon: '📖',
    ability: 'Si el Demonio te mata, sabrás que es uno de 2 jugadores.',
    otherNight: 18, otherNightReminder: 'Si el Demonio mató al Sabihondo, muéstrale 2 posibles Demonios.',
    reminders: [],
  },

  // OUTSIDERS
  {
    id: 'mutant', name: 'Mutante', type: 'outsider', icon: '🧬',
    ability: 'Si eres "demente" (crees que eres malvado), puedes ser ejecutado.',
    reminders: [],
  },
  {
    id: 'sweetheart', name: 'Amor Platónico', type: 'outsider', icon: '💕',
    ability: 'Cuando mueres, un jugador se vuelve borracho permanentemente.',
    reminders: ['Borracho'],
  },
  {
    id: 'barber', name: 'Barbero', type: 'outsider', icon: '✂️',
    ability: 'Si moriste hoy o anoche, el Demonio puede intercambiar los personajes de 2 jugadores vivos (que no sean el Demonio).',
    otherNight: 19, otherNightReminder: 'Si el Barbero murió, el Demonio puede intercambiar los personajes de 2 jugadores.',
    reminders: ['Muere'],
  },
  {
    id: 'klutz', name: 'Patoso', type: 'outsider', icon: '🤦',
    ability: 'Cuando aprendes que mueres, debes señalar públicamente a un jugador vivo inmediatamente. Si es bueno, tu equipo pierde.',
    reminders: [],
  },

  // MINIONS
  {
    id: 'evil_twin', name: 'Gemelo Malvado', type: 'minion', icon: '👯',
    ability: 'Sabes quién es tu Gemelo Bueno. Si alguno de los dos muere ejecutado, el Mal gana. Tu Gemelo sabe quién eres.',
    firstNight: 6, firstNightReminder: 'El Gemelo Malvado y su contraparte buena se conocen mutuamente.',
    reminders: ['Gemelo'],
  },
  {
    id: 'witch', name: 'Bruja', type: 'minion', icon: '🧙‍♀️',
    ability: 'Cada noche eliges a un jugador: si nomina mañana, muere. Si quedan 3 o menos jugadores, pierde esta habilidad.',
    firstNight: 7, firstNightReminder: 'La Bruja elige a un jugador para maldecir.',
    otherNight: 7, otherNightReminder: 'La Bruja elige a un jugador para maldecir.',
    reminders: ['Maldito'],
  },
  {
    id: 'cerenovus', name: 'Cerenovus', type: 'minion', icon: '🎭',
    ability: 'Cada noche eliges a un jugador: está "demente" hasta el anochecer (debe actuar como si fuera malvado o puede ser ejecutado).',
    firstNight: 8, firstNightReminder: 'El Cerenovus elige a un jugador para volverlo demente.',
    otherNight: 8, otherNightReminder: 'El Cerenovus elige a un jugador para volverlo demente.',
    reminders: ['Demente'],
  },
  {
    id: 'pit_hag', name: 'Bruja del Pozo', type: 'minion', icon: '🕳️',
    ability: 'Cada noche eliges a un jugador y un personaje no en juego: ese jugador se convierte en ese personaje.',
    firstNight: 9, firstNightReminder: 'La Bruja del Pozo elige a un jugador y un personaje para cambiar.',
    otherNight: 9, otherNightReminder: 'La Bruja del Pozo elige a un jugador y un personaje para cambiar.',
    reminders: [],
  },

  // DEMONS
  {
    id: 'fang_gu', name: 'Fang Gu', type: 'demon', icon: '👺',
    ability: 'Cada noche (excepto la primera) eliges a un jugador: muere. Si es un Forastero y es la primera vez que fallas, te mueves a ese jugador. Mueres.',
    otherNight: 20, otherNightReminder: 'El Fang Gu elige a un jugador. Si es Forastero y la primera vez, salta a ese jugador.',
    reminders: ['Muere', 'Fang Gu Nuevo'],
  },
  {
    id: 'vigormortis', name: 'Vigormortis', type: 'demon', icon: '🦴',
    ability: 'Cada noche (excepto la primera) eliges a un jugador: muere. Los Esbirros muertos conservan sus habilidades y envenenan a 1 vecino vivo.',
    otherNight: 20, otherNightReminder: 'El Vigormortis elige a un jugador para matar.',
    reminders: ['Muere', 'Sin Habilidad'],
  },
  {
    id: 'no_dashii', name: 'No Dashii', type: 'demon', icon: '🌑',
    ability: 'Cada noche (excepto la primera) eliges a un jugador: muere. Tus 2 Aldeanos vecinos vivos están permanentemente envenenados.',
    otherNight: 20, otherNightReminder: 'El No Dashii elige a un jugador para matar. Los 2 Aldeanos vecinos están envenenados.',
    reminders: ['Muere', 'Envenenado'],
  },
  {
    id: 'vortox', name: 'Vortox', type: 'demon', icon: '🌀',
    ability: 'Cada noche (excepto la primera) eliges a un jugador: muere. Los Aldeanos siempre reciben información falsa. Cada día, si no hay ejecución, el Mal gana.',
    otherNight: 20, otherNightReminder: 'El Vortox elige a un jugador para matar.',
    reminders: ['Muere'],
  },
];

// ============================================================
// BASE DE DATOS COMPLETA
// ============================================================
export const ALL_CHARACTERS: Character[] = [
  ...troubleBrewingCharacters,
  ...badMoonRisingCharacters,
  ...sectsVioletsCharacters,
];

export const TROUBLE_BREWING_IDS = troubleBrewingCharacters.map(c => c.id);
export const BAD_MOON_RISING_IDS = badMoonRisingCharacters.map(c => c.id);
export const SECTS_VIOLETS_IDS = sectsVioletsCharacters.map(c => c.id);

export function getCharacterById(id: string, customChars: Character[] = []): Character | undefined {
  return [...ALL_CHARACTERS, ...customChars].find(c => c.id === id);
}

export function getCharactersByType(type: Character['type'], chars: Character[] = ALL_CHARACTERS): Character[] {
  return chars.filter(c => c.type === type);
}

export function getCharactersByIds(ids: string[], customChars: Character[] = []): Character[] {
  return ids.map(id => getCharacterById(id, customChars)).filter(Boolean) as Character[];
}
