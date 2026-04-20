import { useState } from 'react';
import { RefreshCw, Trash2, BarChart2, Moon, Sun, FileText, ChevronDown, ChevronUp, Skull, Sword, ScrollText, MessageSquare } from 'lucide-react';
import type { Game, Character } from '../../types';
import { CharacterTypeBadge } from '../UI/CharacterTypeBadge';

interface Props {
  game: Game;
  allChars: Character[];
  onNewGame: () => void;
  onDelete: () => void;
}

export default function GameEndScreen({ game, allChars, onNewGame, onDelete }: Props) {
  const [showChronicle, setShowChronicle] = useState(true);
  const [showPlayers, setShowPlayers] = useState(true);

  const evilWon = game.winner === 'evil';
  const evilPlayers = game.players.filter(p => {
    const char = allChars.find(c => c.id === p.characterId);
    return char?.type === 'minion' || char?.type === 'demon';
  });
  const goodPlayers = game.players.filter(p => {
    const char = allChars.find(c => c.id === p.characterId);
    return char?.type === 'townsfolk' || char?.type === 'outsider';
  });
  const aliveFinal = game.players.filter(p => p.isAlive).length;
  const deadFinal = game.players.filter(p => !p.isAlive).length;
  const totalRounds = game.round;

  // Group rounds into night+day pairs
  const nightRounds = game.rounds.filter(r => r.phase === 'night');
  const dayRounds = game.rounds.filter(r => r.phase === 'day');

  const playerName = (id: string) => game.players.find(p => p.id === id)?.name ?? 'Desconocido';

  return (
    <div className="min-h-screen" style={{
      background: evilWon
        ? 'linear-gradient(135deg, #1a0000 0%, #2a0000 100%)'
        : 'linear-gradient(135deg, #001a08 0%, #002a10 100%)',
    }}>
      <div className="max-w-3xl w-full mx-auto px-4 py-12 space-y-6">

        {/* Victory banner */}
        <div className="text-center">
          <div className="text-6xl mb-4">{evilWon ? '😈' : '⚔️'}</div>
          <h1 className={`font-gothic text-5xl font-bold mb-3 ${evilWon ? 'text-red-400' : 'text-green-400'}`}>
            {evilWon ? '¡Gana el Mal!' : '¡Gana el Bien!'}
          </h1>
          {game.winReason && (
            <p className={`text-lg italic ${evilWon ? 'text-red-300' : 'text-green-300'}`}>{game.winReason}</p>
          )}
          <div className="flex justify-center mt-3">
            <span className={`${evilWon ? 'text-red-600' : 'text-green-600'} text-2xl select-none`}>✦ ✦ ✦</span>
          </div>
        </div>

        {/* Stats */}
        <div className="card border-dark-200">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blood-500" />
            Estadísticas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="font-gothic text-2xl text-gold-400">{game.players.length}</p>
              <p className="text-gothic-400 text-sm">Jugadores</p>
            </div>
            <div>
              <p className="font-gothic text-2xl text-gold-400">{totalRounds}</p>
              <p className="text-gothic-400 text-sm">Rondas</p>
            </div>
            <div>
              <p className="font-gothic text-2xl text-green-400">{aliveFinal}</p>
              <p className="text-gothic-400 text-sm">Vivos al final</p>
            </div>
            <div>
              <p className="font-gothic text-2xl text-red-400">{deadFinal}</p>
              <p className="text-gothic-400 text-sm">Muertos totales</p>
            </div>
          </div>
        </div>

        {/* Players section */}
        <div className="card border-dark-200">
          <button
            className="w-full flex items-center justify-between text-left"
            onClick={() => setShowPlayers(v => !v)}
          >
            <h2 className="section-title mb-0 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-blood-500" />
              Roles Revelados
            </h2>
            {showPlayers ? <ChevronUp className="w-4 h-4 text-gothic-400" /> : <ChevronDown className="w-4 h-4 text-gothic-400" />}
          </button>
          {showPlayers && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { label: 'Equipo del Bien', players: goodPlayers, color: 'text-blue-300', icon: '👼' },
                { label: 'Equipo del Mal', players: evilPlayers, color: 'text-red-300', icon: '😈' },
              ].map(({ label, players, color, icon }) => (
                <div key={label}>
                  <h3 className={`font-gothic text-sm ${color} mb-2`}>{icon} {label}</h3>
                  <div className="space-y-1">
                    {players.map(player => {
                      const char = allChars.find(c => c.id === player.characterId);
                      return (
                        <div key={player.id} className={`flex items-center gap-2 text-xs ${!player.isAlive ? 'opacity-50' : ''}`}>
                          {!player.isAlive && <Skull className="w-3 h-3 text-red-400 flex-shrink-0" />}
                          {char && <span>{char.icon}</span>}
                          <span className="text-gothic-200 font-gothic">{player.name}</span>
                          {char && <CharacterTypeBadge type={char.type} />}
                          {char && <span className="text-gothic-500">({char.name})</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Player individual notes */}
          {showPlayers && game.players.some(p => p.notes?.trim()) && (
            <div className="mt-4 border-t border-dark-200 pt-4">
              <p className="text-xs text-gothic-500 font-gothic uppercase tracking-widest mb-3">Notas por jugador</p>
              <div className="space-y-2">
                {game.players.filter(p => p.notes?.trim()).map(p => {
                  const char = allChars.find(c => c.id === p.characterId);
                  return (
                    <div key={p.id} className="bg-dark-400 border border-dark-200 rounded p-2 text-xs">
                      <p className="font-gothic text-gothic-200 mb-0.5 flex items-center gap-1">
                        <span>{char?.icon}</span>{p.name}
                      </p>
                      <p className="text-gothic-400 leading-relaxed whitespace-pre-wrap">{p.notes}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chronicle */}
        <div className="card border-dark-200">
          <button
            className="w-full flex items-center justify-between text-left"
            onClick={() => setShowChronicle(v => !v)}
          >
            <h2 className="section-title mb-0 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blood-500" />
              Crónica de la Partida
            </h2>
            {showChronicle ? <ChevronUp className="w-4 h-4 text-gothic-400" /> : <ChevronDown className="w-4 h-4 text-gothic-400" />}
          </button>

          {showChronicle && (
            <div className="mt-4 space-y-6">
              {nightRounds.map((nightRound) => {
                const dayRound = dayRounds.find(d => d.round === nightRound.round);
                const nightDeaths = nightRound.deaths.map(id => playerName(id));
                const actionNotes = nightRound.nightActions.filter(a => a.note?.trim());
                const dayDeaths = dayRound?.deaths.map(id => playerName(id)) ?? [];
                const executions = dayRound?.nominations?.filter(n => n.executed) ?? [];
                const dayEvents = dayRound?.events?.filter(e => e.type !== 'death') ?? [];

                return (
                  <div key={nightRound.round} className="border border-dark-200 rounded-lg overflow-hidden">
                    {/* Round header */}
                    <div className="bg-dark-400 px-4 py-2 border-b border-dark-200">
                      <p className="font-gothic text-gold-400 text-sm">Ronda {nightRound.round}</p>
                    </div>

                    {/* Night block */}
                    <div className="px-4 py-3 border-b border-dark-300" style={{ background: 'rgba(5,10,30,0.5)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Moon className="w-4 h-4 text-blue-400" />
                        <span className="font-gothic text-blue-300 text-xs uppercase tracking-widest">
                          Noche {nightRound.round}{nightRound.round === 1 ? ' (Primera)' : ''}
                        </span>
                      </div>

                      {nightDeaths.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {nightDeaths.map((name, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs bg-red-950/40 border border-red-900/40 text-red-300 px-2 py-0.5 rounded-full">
                              <Skull className="w-3 h-3" />{name} murió
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gothic-600 italic mb-2">Sin muertes nocturnas.</p>
                      )}

                      {actionNotes.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {actionNotes.map((a, i) => {
                            const char = allChars.find(c => c.id === a.characterId);
                            const player = game.players.find(p => p.id === a.playerId);
                            return (
                              <div key={i} className="text-xs text-gothic-400 flex items-start gap-1.5">
                                <MessageSquare className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>
                                  <span className="text-gothic-300 font-gothic">{char?.icon} {char?.name}</span>
                                  {player && <span className="text-gothic-500"> ({player.name})</span>}
                                  {': '}
                                  <span className="italic">{a.note}</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {nightRound.storytellerNotes?.trim() && (
                        <div className="mt-2 bg-blue-950/20 border border-blue-900/30 rounded p-2 text-xs text-blue-300">
                          <p className="font-gothic text-blue-500 mb-0.5">📝 Notas del narrador:</p>
                          <p className="whitespace-pre-wrap">{nightRound.storytellerNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Day block */}
                    {dayRound && (
                      <div className="px-4 py-3" style={{ background: 'rgba(30,15,5,0.4)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="w-4 h-4 text-yellow-400" />
                          <span className="font-gothic text-yellow-300 text-xs uppercase tracking-widest">
                            Día {dayRound.round}
                          </span>
                        </div>

                        {executions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {executions.map(n => (
                              <span key={n.id} className="flex items-center gap-1 text-xs bg-orange-950/40 border border-orange-900/40 text-orange-300 px-2 py-0.5 rounded-full">
                                <Sword className="w-3 h-3" />
                                {playerName(n.nominatorId)} ejecutó a {playerName(n.nomineeId)} ({n.votes.length} votos)
                              </span>
                            ))}
                          </div>
                        )}

                        {dayDeaths.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {dayDeaths.map((name, i) => (
                              <span key={i} className="flex items-center gap-1 text-xs bg-red-950/40 border border-red-900/40 text-red-300 px-2 py-0.5 rounded-full">
                                <Skull className="w-3 h-3" />{name} murió
                              </span>
                            ))}
                          </div>
                        )}

                        {dayEvents.map((ev, i) => (
                          <div key={i} className="text-xs text-gothic-400 flex items-start gap-1.5 mb-1">
                            <MessageSquare className="w-3 h-3 text-yellow-700 mt-0.5 flex-shrink-0" />
                            <span className="italic">{ev.description}</span>
                          </div>
                        ))}

                        {!executions.length && !dayDeaths.length && !dayEvents.length && (
                          <p className="text-xs text-gothic-600 italic">Sin ejecuciones ni eventos relevantes.</p>
                        )}

                        {dayRound.storytellerNotes?.trim() && (
                          <div className="mt-2 bg-yellow-950/20 border border-yellow-900/30 rounded p-2 text-xs text-yellow-200">
                            <p className="font-gothic text-yellow-600 mb-0.5">📝 Notas del narrador:</p>
                            <p className="whitespace-pre-wrap">{dayRound.storytellerNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Global storyteller notes if no per-round notes */}
              {game.storytellerNotes?.trim() && !nightRounds.some(r => r.storytellerNotes?.trim()) && !dayRounds.some(r => r.storytellerNotes?.trim()) && (
                <div className="bg-dark-400 border border-dark-200 rounded p-3 text-xs">
                  <p className="font-gothic text-gothic-400 mb-1">📝 Notas generales del narrador:</p>
                  <p className="text-gothic-300 whitespace-pre-wrap">{game.storytellerNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button onClick={onNewGame} className="btn-gold">
            <RefreshCw className="w-4 h-4" />
            Nueva Partida
          </button>
          <button onClick={onDelete} className="btn-danger">
            <Trash2 className="w-4 h-4" />
            Eliminar registro
          </button>
        </div>
      </div>
    </div>
  );
}
