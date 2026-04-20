import { Play, Trash2, Moon, Sun, Clock } from 'lucide-react';
import type { Game, Character } from '../../types';

interface Props {
  games: Game[];
  allChars: Character[];
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function GameSavedList({ games, onResume, onDelete }: Omit<Props, 'allChars'> & { allChars?: Character[] }) {
  if (games.length === 0) return null;

  return (
    <div className="card border-gold-600/20 mb-6">
      <h2 className="section-title mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gold-500" />
        Partidas Guardadas
      </h2>
      <div className="space-y-3">
        {games.map(game => {
          const alivePlayers = game.players.filter(p => p.isAlive).length;
          const isEnded = game.phase === 'ended';

          return (
            <div
              key={game.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isEnded
                  ? 'bg-dark-600/50 border-dark-300/30 opacity-70'
                  : 'bg-dark-400 border-dark-200 hover:border-blood-700'
              }`}
            >
              <div className="flex-shrink-0">
                {game.phase === 'night' && <Moon className="w-5 h-5 text-blue-400" />}
                {game.phase === 'day' && <Sun className="w-5 h-5 text-yellow-400" />}
                {game.phase === 'ended' && (
                  <span className="text-lg">{game.winner === 'evil' ? '😈' : '⚔️'}</span>
                )}
                {game.phase === 'setup' && <Clock className="w-5 h-5 text-gothic-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-gothic text-gothic-100 text-sm">{game.scriptName}</span>
                  <span className="text-gothic-500 text-xs">·</span>
                  <span className="text-gothic-400 text-xs">{game.players.length} jugadores</span>
                  <span className="text-gothic-500 text-xs">·</span>
                  <span className="text-gothic-400 text-xs">Ronda {game.round}</span>
                </div>
                <div className="flex gap-2 mt-0.5 text-xs text-gothic-500">
                  {isEnded ? (
                    <span className={game.winner === 'evil' ? 'text-red-400' : 'text-green-400'}>
                      {game.winner === 'evil' ? '😈 Ganó el Mal' : '⚔️ Ganó el Bien'}
                    </span>
                  ) : (
                    <>
                      <span className="text-green-500">🌟 {alivePlayers} vivos</span>
                      <span>·</span>
                      <span>{game.phase === 'night' ? '🌙 Noche' : '☀️ Día'}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {!isEnded && (
                  <button onClick={() => onResume(game.id)} className="btn-primary text-sm">
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:block">Continuar</span>
                  </button>
                )}
                <button onClick={() => onDelete(game.id)} className="btn-danger text-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
