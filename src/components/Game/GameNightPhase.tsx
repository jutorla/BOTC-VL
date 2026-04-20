import { useState } from 'react';
import { Moon, CheckCircle, Circle, ChevronRight, FileText, Skull, Users, Eye, EyeOff, RefreshCw, Maximize2, X } from 'lucide-react';
import type { Game, Character, NightAction } from '../../types';
import { CharacterTypeBadge } from '../UI/CharacterTypeBadge';
import PlayerStatusBar from './PlayerStatusBar';
import CircularPlayerBoard from './CircularPlayerBoard';
import { getDistribution } from '../../data/scripts';

interface Props {
  game: Game;
  allChars: Character[];
  onUpdate: (game: Game) => void;
}

function getCharacter(id: string, allChars: Character[]): Character | undefined {
  return allChars.find(c => c.id === id);
}

// Characters that act at night, sorted by first/other night order
function getNightOrder(game: Game, allChars: Character[], isFirstNight: boolean): NightAction[] {
  const { players } = game;

  const actions: NightAction[] = [];

  players.forEach(player => {
    if (!player.characterId) return;
    const char = getCharacter(player.characterId, allChars);
    if (!char) return;

    const order = isFirstNight ? (char.firstNight || 0) : (char.otherNight || 0);
    if (order > 0) {
      actions.push({
        characterId: char.id,
        playerId: player.id,
        isDone: false,
        note: '',
      });
    }
  });

  // Sort by night order
  actions.sort((a, b) => {
    const charA = getCharacter(a.characterId, allChars);
    const charB = getCharacter(b.characterId, allChars);
    const orderA = (isFirstNight ? charA?.firstNight : charA?.otherNight) || 99;
    const orderB = (isFirstNight ? charB?.firstNight : charB?.otherNight) || 99;
    return orderA - orderB;
  });

  return actions;
}

export default function GameNightPhase({ game, allChars, onUpdate }: Props) {
  const isFirstNight = game.round === 1;
  const currentRound = game.rounds[game.rounds.length - 1];

  const [nightActions, setNightActions] = useState<NightAction[]>(() => {
    if (currentRound.nightActions.length > 0) return currentRound.nightActions;
    return getNightOrder(game, allChars, isFirstNight);
  });
  const [activeIdx, setActiveIdx] = useState(0);
  const [deaths, setDeaths] = useState<string[]>(currentRound.deaths || []);
  const [storytellerNotes, setStorytellernotes] = useState(game.storytellerNotes);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>();
  const distribution = getDistribution(game.players.length);

  // ── Coartadas (bluffs) ───────────────────────────────────────
  // Characters in the script but NOT in play → pool for bluffs
  const scriptCharIds = new Set(game.players.map(p => p.characterId));
  const bluffPool = allChars.filter(
    c => (c.type === 'townsfolk' || c.type === 'outsider') && !scriptCharIds.has(c.id)
  );
  const [selectedBluffs, setSelectedBluffs] = useState<Character[]>([]);
  const [showBluffPicker, setShowBluffPicker] = useState(false);
  const [bluffsDone, setBluffsDone] = useState(false);
  const [showBluffDisplay, setShowBluffDisplay] = useState(false);

  const randomizeBluffs = () => {
    const pool = [...bluffPool];
    const picks: Character[] = [];
    while (picks.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    setSelectedBluffs(picks);
  };

  const toggleBluff = (char: Character) => {
    setSelectedBluffs(prev => {
      if (prev.find(c => c.id === char.id)) return prev.filter(c => c.id !== char.id);
      if (prev.length >= 3) return prev;
      return [...prev, char];
    });
  };

  // ── Minion/Demon info step ───────────────────────────────────
  const [minionStepDone, setMinionStepDone] = useState(false);
  const minions = game.players.filter(p => {
    const c = allChars.find(ch => ch.id === p.characterId);
    return c?.type === 'minion';
  });
  const demons = game.players.filter(p => {
    const c = allChars.find(ch => ch.id === p.characterId);
    return c?.type === 'demon';
  });

  const toggleDeath = (playerId: string) => {
    setDeaths(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const markDone = (idx: number, note: string) => {
    setNightActions(prev => prev.map((a, i) => i === idx ? { ...a, isDone: true, note } : a));
    setActiveIdx(prev => {
      const next = nightActions.findIndex((a, i) => i > idx && !a.isDone);
      return next >= 0 ? next : prev + 1;
    });
  };

  const toggleDone = (idx: number) => {
    setNightActions(prev => prev.map((a, i) => i === idx ? { ...a, isDone: !a.isDone } : a));
  };

  const handleTransitionToDay = () => {
    const updatedRound = {
      ...currentRound,
      nightActions,
      deaths,
      storytellerNotes,
      events: deaths.map(pid => {
        const player = game.players.find(p => p.id === pid);
        return {
          type: 'death' as const,
          description: `${player?.name || 'Jugador'} murió durante la noche.`,
          playerId: pid,
          timestamp: new Date().getTime(),
        };
      }),
    };

    // Apply deaths
    const updatedPlayers = game.players.map(p => {
      if (deaths.includes(p.id)) {
        return { ...p, isAlive: false };
      }
      return p;
    });

    const dayRound = {
      round: game.round,
      phase: 'day' as const,
      events: [],
      nightActions: [],
      nominations: [],
      deaths: [],
    };

    const updatedGame: Game = {
      ...game,
      players: updatedPlayers,
      phase: 'day',
      rounds: [...game.rounds.slice(0, -1), updatedRound, dayRound],
      hasExecutionToday: false,
      storytellerNotes,
      updatedAt: new Date().getTime(),
    };

    onUpdate(updatedGame);
  };

  const doneCount = nightActions.filter(a => a.isDone).length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #050a1a 0%, #0a0d20 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Moon className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="font-gothic text-2xl text-blue-300">
                Noche {game.round}
                {isFirstNight && <span className="text-sm text-blue-400 ml-2">(Primera Noche)</span>}
              </h1>
              <p className="text-blue-500 text-sm">{game.scriptName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-400 text-sm font-gothic">{doneCount}/{nightActions.length} acciones</span>
            <button onClick={handleTransitionToDay} className="btn-gold text-sm">
              <ChevronRight className="w-4 h-4" />
              Amanecer
            </button>
          </div>
        </div>

        {/* Player status */}
        <PlayerStatusBar players={game.players} allChars={allChars} />

        {/* Circular board + distribution */}
        <div className="mt-4 card border-blue-900/30 p-4" style={{ background: 'rgba(5,10,30,0.6)' }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-gothic text-blue-400 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Mesa ({game.players.length} jugadores)
            </h3>
            <div className="flex gap-2 text-xs flex-wrap">
              {[
                { label: 'Aldeanos', count: distribution[0], color: 'text-blue-300', bg: 'bg-blue-950/60 border-blue-800/40', icon: '🏘️' },
                { label: 'Forasteros', count: distribution[1], color: 'text-purple-300', bg: 'bg-purple-950/60 border-purple-800/40', icon: '🧳' },
                { label: 'Esbirros', count: distribution[2], color: 'text-orange-300', bg: 'bg-orange-950/60 border-orange-800/40', icon: '😈' },
                { label: 'Demonios', count: distribution[3], color: 'text-red-300', bg: 'bg-red-950/60 border-red-800/40', icon: '👹' },
              ].map(({ label, count, color, bg, icon }) => (
                <div key={label} className={`flex items-center gap-1 px-2 py-0.5 rounded border font-gothic ${color} ${bg}`} title={label}>
                  <span>{icon}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <CircularPlayerBoard
              players={game.players}
              allChars={allChars}
              showRoles={true}
              selectedId={selectedPlayerId}
              onSelect={p => setSelectedPlayerId(prev => prev === p.id ? undefined : p.id)}
              isNight={true}
              centerContent={
                <div className="text-center">
                  <Moon className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="font-gothic text-blue-400 text-sm">
                    Noche {game.round}
                  </p>
                  {isFirstNight && <p className="text-blue-500 text-xs">Primera</p>}
                  <p className="text-blue-600 text-xs">{doneCount}/{nightActions.length}</p>
                </div>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Night order */}
          <div className="lg:col-span-2">
            <div className="card border-blue-800/40" style={{ background: 'rgba(10,15,40,0.8)' }}>
              <h2 className="font-gothic text-blue-300 text-lg mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Orden de Noche
              </h2>

              {/* ── FIRST NIGHT SPECIAL STEPS ─────────────────────────── */}
              {isFirstNight && (
                <div className="space-y-3 mb-6">
                  <p className="text-xs text-blue-400 font-gothic uppercase tracking-widest opacity-70">Pasos previos — Primera noche</p>

                  {/* Step 1: Minions learn their demon */}
                  <div className={`rounded-lg border p-4 transition-all ${minionStepDone ? 'border-green-700/40 bg-green-950/20 opacity-70' : 'border-orange-700/40 bg-orange-950/20'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => setMinionStepDone(d => !d)} className="flex-shrink-0">
                            {minionStepDone
                              ? <CheckCircle className="w-5 h-5 text-green-400" />
                              : <Circle className="w-5 h-5 text-orange-400" />}
                          </button>
                          <span className="font-gothic text-orange-300 text-sm">😈 Esbirros despiertan</span>
                        </div>
                        <p className="text-xs text-gothic-400 mb-3 leading-relaxed ml-7">
                          Los Esbirros abren los ojos. El Narrador señala al Demonio. Luego todos cierran los ojos de nuevo.
                        </p>
                        {minions.length > 0 ? (
                          <div className="ml-7 space-y-1.5">
                            <p className="text-xs text-orange-400 font-gothic mb-1">Esbirros en partida:</p>
                            {minions.map(p => {
                              const c = allChars.find(ch => ch.id === p.characterId);
                              return (
                                <div key={p.id} className="flex items-center gap-2 text-xs bg-orange-950/30 border border-orange-900/40 rounded px-2 py-1">
                                  <span>{c?.icon}</span>
                                  <span className="font-gothic text-orange-200">{p.name}</span>
                                  <span className="text-orange-400">({c?.name})</span>
                                </div>
                              );
                            })}
                            <p className="text-xs text-orange-400 font-gothic mt-2 mb-1">Demonio(s):</p>
                            {demons.map(p => {
                              const c = allChars.find(ch => ch.id === p.characterId);
                              return (
                                <div key={p.id} className="flex items-center gap-2 text-xs bg-red-950/30 border border-red-900/40 rounded px-2 py-1">
                                  <span>{c?.icon}</span>
                                  <span className="font-gothic text-red-200">{p.name}</span>
                                  <span className="text-red-400">({c?.name})</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gothic-500 ml-7 italic">No hay Esbirros en partida.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Bluffs */}
                  <div className={`rounded-lg border p-4 transition-all ${bluffsDone ? 'border-green-700/40 bg-green-950/20 opacity-70' : 'border-purple-700/40 bg-purple-950/20'}`}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => setBluffsDone(d => !d)} className="flex-shrink-0 mt-0.5">
                        {bluffsDone
                          ? <CheckCircle className="w-5 h-5 text-green-400" />
                          : <Circle className="w-5 h-5 text-purple-400" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-gothic text-purple-300 text-sm mb-1">🃏 Coartadas del Demonio</p>
                        <p className="text-xs text-gothic-400 mb-3 leading-relaxed">
                          El Demonio despierta. El Narrador le muestra 3 roles de Aldeano/Forastero que <strong className="text-purple-300">NO están en juego</strong> como coartadas.
                        </p>

                        {/* Selected bluffs display */}
                        {selectedBluffs.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3 items-center">
                            {selectedBluffs.map(c => (
                              <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 rounded border border-purple-700/50 bg-purple-950/40 text-xs">
                                <span>{c.icon}</span>
                                <span className="font-gothic text-purple-200">{c.name}</span>
                                {!bluffsDone && (
                                  <button onClick={() => toggleBluff(c)} className="text-purple-500 hover:text-red-400 ml-1">✕</button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => setShowBluffDisplay(true)}
                              className="flex items-center gap-1 px-2 py-1 rounded border border-purple-600/50 bg-purple-900/40 text-purple-300 text-xs font-gothic hover:bg-purple-800/50 transition-all"
                              title="Mostrar coartadas en grande"
                            >
                              <Maximize2 className="w-3 h-3" />
                              Mostrar
                            </button>
                          </div>
                        )}

                        {/* Fullscreen bluff display overlay */}
                        {showBluffDisplay && (
                          <div
                            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
                            style={{ background: 'rgba(10,5,25,0.97)' }}
                            onClick={() => setShowBluffDisplay(false)}
                          >
                            <button
                              onClick={() => setShowBluffDisplay(false)}
                              className="absolute top-6 right-6 text-gothic-400 hover:text-gothic-100 transition-colors"
                            >
                              <X className="w-8 h-8" />
                            </button>
                            <p className="font-gothic text-purple-400 text-sm uppercase tracking-widest mb-10 opacity-70">🃏 Coartadas del Demonio</p>
                            <div className="flex flex-wrap gap-10 justify-center px-8">
                              {selectedBluffs.map(c => (
                                <div key={c.id} className="flex flex-col items-center gap-4">
                                  <span className="text-8xl">{c.icon}</span>
                                  <span className="font-gothic text-purple-100 text-2xl text-center">{c.name}</span>
                                </div>
                              ))}
                            </div>
                            <p className="mt-12 text-gothic-600 text-sm">Pulsa en cualquier lugar para cerrar</p>
                          </div>
                        )}

                        {!bluffsDone && (
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={randomizeBluffs}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-purple-700/50 bg-purple-900/30 text-purple-300 text-xs font-gothic hover:bg-purple-800/40 transition-all"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Aleatorias
                            </button>
                            <button
                              onClick={() => setShowBluffPicker(v => !v)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-purple-700/50 bg-purple-900/30 text-purple-300 text-xs font-gothic hover:bg-purple-800/40 transition-all"
                            >
                              {showBluffPicker ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              {showBluffPicker ? 'Cerrar lista' : 'Elegir manualmente'}
                            </button>
                            {selectedBluffs.length === 3 && (
                              <button
                                onClick={() => setBluffsDone(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-green-700/50 bg-green-900/30 text-green-300 text-xs font-gothic hover:bg-green-800/40 transition-all"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Listo
                              </button>
                            )}
                          </div>
                        )}

                        {/* Manual bluff picker */}
                        {showBluffPicker && !bluffsDone && (
                          <div className="mt-3 max-h-48 overflow-y-auto space-y-1 pr-1">
                            <p className="text-xs text-purple-400 mb-2">
                              Selecciona hasta 3 coartadas ({selectedBluffs.length}/3):
                            </p>
                            {bluffPool.map(char => {
                              const picked = !!selectedBluffs.find(c => c.id === char.id);
                              const disabled = !picked && selectedBluffs.length >= 3;
                              return (
                                <button
                                  key={char.id}
                                  onClick={() => !disabled && toggleBluff(char)}
                                  disabled={disabled}
                                  className={`w-full flex items-center gap-2 p-1.5 rounded border text-xs text-left transition-all ${
                                    picked
                                      ? 'border-purple-600 bg-purple-900/40 text-purple-200'
                                      : disabled
                                      ? 'border-dark-300 bg-dark-600 text-gothic-600 cursor-not-allowed opacity-40'
                                      : 'border-dark-200 bg-dark-500 text-gothic-300 hover:border-purple-700/50 hover:bg-purple-950/30'
                                  }`}
                                >
                                  <span>{char.icon}</span>
                                  <span className="font-gothic">{char.name}</span>
                                  <CharacterTypeBadge type={char.type} />
                                  {picked && <span className="ml-auto text-purple-400">✓</span>}
                                </button>
                              );
                            })}
                            {bluffPool.length === 0 && (
                              <p className="text-gothic-500 text-xs italic">Todos los Aldeanos/Forasteros están en juego.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-blue-900/30 pt-3">
                    <p className="text-xs text-blue-400 font-gothic uppercase tracking-widest opacity-70">Acciones nocturnas</p>
                  </div>
                </div>
              )}

              {nightActions.length === 0 ? (
                <div className="text-center py-8 text-blue-500">
                  <Moon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay acciones nocturnas esta noche.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {nightActions.map((action, idx) => {
                    const char = getCharacter(action.characterId, allChars);
                    const player = game.players.find(p => p.id === action.playerId);
                    const isActive = idx === activeIdx && !action.isDone;
                    const reminder = isFirstNight ? char?.firstNightReminder : char?.otherNightReminder;

                    return (
                      <NightActionItem
                        key={`${action.playerId}-${idx}`}
                        action={action}
                        char={char}
                        player={player}
                        reminder={reminder}
                        isActive={isActive}
                        onToggleDone={() => toggleDone(idx)}
                        onMarkDone={(note) => markDone(idx, note)}
                        onClick={() => !action.isDone && setActiveIdx(idx)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: deaths & notes */}
          <div className="space-y-4">
            {/* Deaths */}
            <div className="card border-red-900/40" style={{ background: 'rgba(20,5,5,0.8)' }}>
              <h2 className="font-gothic text-red-300 text-base mb-3 flex items-center gap-2">
                <Skull className="w-4 h-4" />
                Muertes Nocturnas
              </h2>
              <div className="space-y-2">
                {game.players.filter(p => p.isAlive).map(player => {
                  const isDead = deaths.includes(player.id);
                  const char = getCharacter(player.characterId, allChars);
                  return (
                    <button
                      key={player.id}
                      onClick={() => toggleDeath(player.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded border text-left transition-all text-sm ${
                        isDead
                          ? 'bg-red-900/30 border-red-600 text-red-300'
                          : 'bg-dark-400 border-dark-200 text-gothic-300 hover:border-dark-100'
                      }`}
                    >
                      {isDead ? <Skull className="w-4 h-4 text-red-400" /> : <Circle className="w-4 h-4 text-gothic-500" />}
                      <span className="font-gothic">{player.name}</span>
                      {char && <span className="text-xs opacity-60">{char.icon}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Storyteller notes */}
            <div className="card border-blue-900/30" style={{ background: 'rgba(5,10,30,0.8)' }}>
              <h2 className="font-gothic text-blue-300 text-base mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas del Narrador
              </h2>
              <textarea
                className="textarea-gothic text-sm"
                rows={5}
                value={storytellerNotes}
                onChange={e => setStorytellernotes(e.target.value)}
                placeholder="Anota información secreta..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NightActionItem({
  action,
  char,
  player,
  reminder,
  isActive,
  onToggleDone,
  onMarkDone,
  onClick,
}: {
  action: NightAction;
  char?: Character;
  player?: { name: string; isAlive: boolean };
  reminder?: string;
  isActive: boolean;
  onToggleDone: () => void;
  onMarkDone: (note: string) => void;
  onClick: () => void;
}) {
  const [note, setNote] = useState(action.note);
  const [expanded, setExpanded] = useState(isActive);

  const className = action.isDone
    ? 'night-order-done'
    : isActive
    ? 'night-order-active'
    : 'night-order-pending';

  return (
    <div
      className={className}
      style={isActive ? { background: 'rgba(80,0,0,0.3)', borderColor: '#8b0000' } : {}}
    >
      <button onClick={onToggleDone} className="flex-shrink-0">
        {action.isDone
          ? <CheckCircle className="w-5 h-5 text-green-400" />
          : <Circle className="w-5 h-5 text-gothic-500" />
        }
      </button>

      <div className="flex-1 min-w-0" onClick={onClick}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{char?.icon || '👤'}</span>
          <span className="font-gothic text-sm text-gothic-100">{char?.name || '?'}</span>
          {char && <CharacterTypeBadge type={char.type} />}
          {player && (
            <span className="text-xs text-gothic-400">→ {player.name}</span>
          )}
        </div>

        {(isActive || expanded) && reminder && (
          <div className="mt-2 p-2 bg-blue-900/20 border border-blue-800/30 rounded text-xs text-blue-300 leading-relaxed">
            {reminder}
          </div>
        )}

        {(isActive || expanded) && !action.isDone && (
          <div className="mt-2 flex gap-2">
            <input
              className="input-gothic text-xs flex-1"
              value={note}
              onChange={e => setNote(e.target.value)}
              onClick={e => e.stopPropagation()}
              placeholder="Nota sobre la acción..."
            />
            <button
              onClick={e => { e.stopPropagation(); onMarkDone(note); }}
              className="btn-primary text-xs px-3"
            >
              <CheckCircle className="w-3 h-3" />
              Hecho
            </button>
          </div>
        )}

        {action.isDone && action.note && (
          <p className="text-xs text-gothic-500 mt-1 italic">📝 {action.note}</p>
        )}
      </div>

      <button
        onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
        className="text-gothic-500 hover:text-gothic-300 transition-colors"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
}
