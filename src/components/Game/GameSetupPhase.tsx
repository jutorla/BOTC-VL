import { useState } from 'react';
import { Users, Shuffle, ChevronRight, Plus, Trash2, AlertCircle, ShoppingBag, Eye, X } from 'lucide-react';
import type { Game, Player, Script, Character } from '../../types';
import { getDistribution, DIFFICULTY_LABELS } from '../../data/scripts';
import { CharacterTypeBadge } from '../UI/CharacterTypeBadge';

interface Props {
  scripts: Script[];
  allChars: Character[];
  initialScriptId?: string;
  onStart: (game: Game) => void;
}

export default function GameSetupPhase({ scripts, allChars, initialScriptId, onStart }: Props) {
  const [scriptId, setScriptId] = useState(initialScriptId || scripts[0]?.id || '');
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '', '']);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // playerId -> charId
  const [step, setStep] = useState<'players' | 'roles'>('players');
  const [showAbility, setShowAbility] = useState<string | null>(null);

  // Bag draw state
  const [bagMode, setBagMode] = useState(false);
  const [bag, setBag] = useState<Character[]>([]);
  const [revealChar, setRevealChar] = useState<{ char: Character; playerName: string; pid: string } | null>(null);
  const [revealed, setRevealed] = useState(false); // animation trigger

  const selectedScript = scripts.find(s => s.id === scriptId);
  const scriptChars = selectedScript
    ? selectedScript.characters.map(id => allChars.find(c => c.id === id)).filter(Boolean) as Character[]
    : [];

  const validNames = playerNames.filter(n => n.trim());
  const distribution = getDistribution(validNames.length);

  const addPlayer = () => setPlayerNames(prev => [...prev, '']);
  const removeName = (i: number) => setPlayerNames(prev => prev.filter((_, idx) => idx !== i));
  const updateName = (i: number, val: string) => setPlayerNames(prev => prev.map((n, idx) => idx === i ? val : n));

  const assignRole = (playerId: string, charId: string) => {
    setAssignments(prev => {
      // Remove charId from any existing player
      const next = { ...prev };
      Object.keys(next).forEach(pid => {
        if (next[pid] === charId) delete next[pid];
      });
      if (charId) next[playerId] = charId;
      else delete next[playerId];
      return next;
    });
  };

  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

  const randomAssign = () => {
    const names = validNames;
    const dist = getDistribution(names.length);
    const townsfolk = scriptChars.filter(c => c.type === 'townsfolk');
    const outsiders = scriptChars.filter(c => c.type === 'outsider');
    const minions = scriptChars.filter(c => c.type === 'minion');
    const demons = scriptChars.filter(c => c.type === 'demon');

    const pool: Character[] = [];

    pool.push(...shuffle(townsfolk).slice(0, dist[0]));
    pool.push(...shuffle(outsiders).slice(0, dist[1]));
    pool.push(...shuffle(minions).slice(0, dist[2]));
    pool.push(...shuffle(demons).slice(0, dist[3]));

    const shuffled = shuffle(pool).slice(0, names.length);
    const newAssignments: Record<string, string> = {};
    names.forEach((_, i) => {
      if (shuffled[i]) {
        const playerId = `player_${i}`;
        newAssignments[playerId] = shuffled[i].id;
      }
    });
    setAssignments(newAssignments);
  };

  // ---- Bag draw helpers ----
  const initBag = () => {
    const dist = getDistribution(validNames.length);
    const pool: Character[] = [
      ...shuffle(scriptChars.filter(c => c.type === 'townsfolk')).slice(0, dist[0]),
      ...shuffle(scriptChars.filter(c => c.type === 'outsider')).slice(0, dist[1]),
      ...shuffle(scriptChars.filter(c => c.type === 'minion')).slice(0, dist[2]),
      ...shuffle(scriptChars.filter(c => c.type === 'demon')).slice(0, dist[3]),
    ];
    setBag(shuffle(pool));
    setAssignments({});
  };

  const enterBagMode = () => {
    setBagMode(true);
    initBag();
  };

  const drawFromBag = (pid: string, playerName: string) => {
    if (bag.length === 0) return;
    const [drawn, ...rest] = shuffle(bag); // shuffle before drawing for true randomness
    const finalBag = rest;
    setBag(finalBag);
    setAssignments(prev => ({ ...prev, [pid]: drawn.id }));
    setRevealChar({ char: drawn, playerName, pid });
    setRevealed(false);
    // Trigger reveal animation after a tiny delay
    setTimeout(() => setRevealed(true), 80);
  };

  const closeReveal = () => {
    setRevealChar(null);
    setRevealed(false);
  };

  const handleStartGame = () => {
    if (!selectedScript) return;
    const names = playerNames.filter(n => n.trim());
    const now = new Date().getTime();

    const players: Player[] = names.map((name, i) => ({
      id: `player_${i}`,
      name: name.trim(),
      characterId: assignments[`player_${i}`] || '',
      isAlive: true,
      usedDeadVote: false,
      reminders: [],
      notes: '',
      seatIndex: i,
    }));

    const game: Game = {
      id: `game_${now}`,
      scriptId: selectedScript.id,
      scriptName: selectedScript.name,
      players,
      phase: 'night',
      round: 1,
      rounds: [{
        round: 1,
        phase: 'night',
        events: [],
        nightActions: [],
        nominations: [],
        deaths: [],
      }],
      hasExecutionToday: false,
      storytellerNotes: '',
      createdAt: now,
      updatedAt: now,
    };

    onStart(game);
  };

  const canProceed = validNames.length >= 5 && scriptId;
  const assignedCount = Object.keys(assignments).filter(k =>
    validNames.some((_, i) => `player_${i}` === k)
  ).length;
  const canStart = canProceed && assignedCount === validNames.length;

  return (
    <div className="card border-gold-600/20 mt-6">
      <h2 className="section-title mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-blood-500" />
        Nueva Partida
      </h2>

      {/* Script selector */}
      <div className="mb-6">
        <label className="text-sm text-gothic-300 font-gothic mb-1 block">Script</label>
        <select
          className="select-gothic"
          value={scriptId}
          onChange={e => { setScriptId(e.target.value); setAssignments({}); }}
        >
          {scripts.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}{s.difficulty ? ` (${DIFFICULTY_LABELS[s.difficulty]})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Steps */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setStep('players')}
          className={`px-4 py-2 rounded font-gothic text-sm border transition-all ${step === 'players' ? 'bg-blood-700 border-blood-500 text-gothic-100' : 'bg-dark-400 border-dark-200 text-gothic-400'}`}
        >
          1. Jugadores
        </button>
        <button
          onClick={() => canProceed && setStep('roles')}
          disabled={!canProceed}
          className={`px-4 py-2 rounded font-gothic text-sm border transition-all disabled:opacity-40 ${step === 'roles' ? 'bg-blood-700 border-blood-500 text-gothic-100' : 'bg-dark-400 border-dark-200 text-gothic-400'}`}
        >
          2. Roles
        </button>
      </div>

      {step === 'players' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gothic-300 text-sm">
              Introduce los nombres de los jugadores (mínimo 5):
            </p>
            {validNames.length > 0 && (
              <p className="text-gothic-400 text-xs">
                Distribución: {distribution[0]}T / {distribution[1]}F / {distribution[2]}E / {distribution[3]}D
              </p>
            )}
          </div>
          <div className="space-y-2 mb-4">
            {playerNames.map((name, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-gothic-500 text-sm w-6 text-right">{i + 1}.</span>
                <input
                  className="input-gothic flex-1"
                  value={name}
                  onChange={e => updateName(i, e.target.value)}
                  placeholder={`Jugador ${i + 1}...`}
                />
                {playerNames.length > 5 && (
                  <button onClick={() => removeName(i)} className="btn-ghost p-2">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={addPlayer} disabled={playerNames.length >= 20} className="btn-secondary">
              <Plus className="w-4 h-4" />
              Añadir jugador
            </button>
            <button
              onClick={() => setStep('roles')}
              disabled={!canProceed}
              className="btn-primary ml-auto"
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 'roles' && (
        <div>
          {/* Mode selector */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-gothic-300 text-sm">
              {bagMode
                ? `🎒 Modo bolsa — Quedan ${bag.length} rol${bag.length !== 1 ? 'es' : ''} en la bolsa`
                : 'Asigna un rol a cada jugador:'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setBagMode(false); setAssignments({}); setBag([]); }}
                className={`px-3 py-1.5 rounded text-xs font-gothic border transition-all ${!bagMode ? 'bg-blood-700 border-blood-500 text-gothic-100' : 'bg-dark-400 border-dark-200 text-gothic-400 hover:border-dark-100'}`}
              >
                ✏️ Manual
              </button>
              <button
                onClick={enterBagMode}
                className={`px-3 py-1.5 rounded text-xs font-gothic border transition-all ${bagMode ? 'bg-blood-700 border-blood-500 text-gothic-100' : 'bg-dark-400 border-dark-200 text-gothic-400 hover:border-dark-100'}`}
              >
                <ShoppingBag className="w-3 h-3 inline mr-1" />
                Bolsa
              </button>
              {!bagMode && (
                <button onClick={randomAssign} className="btn-secondary text-xs py-1.5 px-3">
                  <Shuffle className="w-3 h-3" />
                  Aleatorio
                </button>
              )}
            </div>
          </div>

          {/* Distribution reminder */}
          <div className="flex gap-3 mb-4 text-xs flex-wrap">
            {[
              { label: 'Aldeanos', count: distribution[0], color: 'text-blue-400', icon: '🏘️' },
              { label: 'Forasteros', count: distribution[1], color: 'text-purple-400', icon: '🧳' },
              { label: 'Esbirros', count: distribution[2], color: 'text-orange-400', icon: '😈' },
              { label: 'Demonios', count: distribution[3], color: 'text-red-400', icon: '👹' },
            ].map(({ label, count, color, icon }) => (
              <div key={label} className={`flex items-center gap-1 px-2 py-1 rounded bg-dark-500 border border-dark-300 font-gothic ${color}`}>
                <span>{icon}</span>
                <span>{count} {label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-6">
            {validNames.map((name, i) => {
              const pid = `player_${i}`;
              const assignedChar = assignments[pid]
                ? allChars.find(c => c.id === assignments[pid])
                : null;
              const alreadyDrawn = !!assignments[pid];

              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-dark-400 rounded border border-dark-200">
                  <div className="flex-1">
                    <p className="font-gothic text-gothic-100 text-sm">{name}</p>
                    {assignedChar && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">{assignedChar.icon}</span>
                        <span className="text-gothic-300 text-xs">{assignedChar.name}</span>
                        <CharacterTypeBadge type={assignedChar.type} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {assignedChar && (
                      <button
                        onClick={() => setShowAbility(showAbility === pid ? null : pid)}
                        className="text-xs text-gothic-400 hover:text-gothic-200 transition-colors"
                        title="Ver habilidad"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {bagMode ? (
                      alreadyDrawn ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-xs font-gothic">✓ Sacado</span>
                          <button
                            onClick={() => {
                              // Return char to bag and unassign
                              const charToReturn = allChars.find(c => c.id === assignments[pid]);
                              if (charToReturn) setBag(prev => [...prev, charToReturn]);
                              setAssignments(prev => { const n = { ...prev }; delete n[pid]; return n; });
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            title="Devolver a la bolsa"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => drawFromBag(pid, name)}
                          disabled={bag.length === 0}
                          className="btn-gold text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          Sacar rol
                        </button>
                      )
                    ) : (
                      <select
                        className="select-gothic text-sm"
                        value={assignments[pid] || ''}
                        onChange={e => assignRole(pid, e.target.value)}
                      >
                        <option value="">— Sin asignar —</option>
                        {['townsfolk', 'outsider', 'minion', 'demon'].map(type => {
                          const chars = scriptChars.filter(c => c.type === type);
                          if (!chars.length) return null;
                          return (
                            <optgroup key={type} label={type === 'townsfolk' ? 'Aldeanos' : type === 'outsider' ? 'Forasteros' : type === 'minion' ? 'Esbirros' : 'Demonios'}>
                              {chars.map(c => (
                                <option key={c.id} value={c.id}
                                  disabled={Object.values(assignments).includes(c.id) && assignments[pid] !== c.id}
                                >
                                  {c.icon} {c.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    )}
                  </div>
                  {/* Ability tooltip */}
                  {showAbility === pid && assignedChar && (
                    <div className="w-full mt-2 p-2 bg-dark-600 border border-dark-300 rounded text-xs text-gothic-300 leading-relaxed col-span-full">
                      <span className="font-gothic text-gothic-200">{assignedChar.name}: </span>
                      {assignedChar.ability}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!canStart && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm mb-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Asigna un rol a todos los jugadores para comenzar.</span>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep('players')} className="btn-secondary">
              ← Volver
            </button>
            <button onClick={handleStartGame} disabled={!canStart} className="btn-gold ml-auto">
              <ChevronRight className="w-4 h-4" />
              ¡Comenzar Partida!
            </button>
          </div>
        </div>
      )}

      {/* ---- Bag reveal overlay ---- */}
      {revealChar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={closeReveal}
        >
          <div
            className="relative max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
            style={{
              transform: revealed ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(40px)',
              opacity: revealed ? 1 : 0,
              transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
            }}
          >
            {/* Card */}
            <div
              className="rounded-2xl border-2 p-8 text-center shadow-2xl"
              style={{
                background: 'linear-gradient(160deg, #1a0505 0%, #2d0a0a 60%, #0d0000 100%)',
                borderColor:
                  revealChar.char.type === 'demon' ? '#dc2626' :
                  revealChar.char.type === 'minion' ? '#f97316' :
                  revealChar.char.type === 'outsider' ? '#a78bfa' :
                  '#3b82f6',
                boxShadow:
                  revealChar.char.type === 'demon' ? '0 0 40px 8px rgba(220,38,38,0.4)' :
                  revealChar.char.type === 'minion' ? '0 0 40px 8px rgba(249,115,22,0.35)' :
                  revealChar.char.type === 'outsider' ? '0 0 40px 8px rgba(167,139,250,0.35)' :
                  '0 0 40px 8px rgba(59,130,246,0.35)',
              }}
            >
              {/* Player name */}
              <p className="font-gothic text-gothic-400 text-sm mb-4 tracking-widest uppercase">
                {revealChar.playerName} saca de la bolsa...
              </p>

              {/* Icon */}
              <div className="text-8xl mb-4 leading-none" style={{ filter: 'drop-shadow(0 0 20px rgba(255,200,100,0.5))' }}>
                {revealChar.char.icon}
              </div>

              {/* Character name */}
              <h2 className="font-gothic text-3xl text-gothic-100 mb-2">{revealChar.char.name}</h2>

              {/* Type badge */}
              <div className="flex justify-center mb-4">
                <CharacterTypeBadge type={revealChar.char.type} />
              </div>

              {/* Ability */}
              <p className="text-gothic-300 text-sm leading-relaxed mb-6 italic">
                "{revealChar.char.ability}"
              </p>

              <button
                onClick={closeReveal}
                className="btn-gold w-full justify-center py-3 text-base"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
}