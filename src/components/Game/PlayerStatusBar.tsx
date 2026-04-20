import type { Player, Character } from '../../types';

interface Props {
  players: Player[];
  allChars: Character[];
  showRoles?: boolean;
}

export default function PlayerStatusBar({ players, allChars, showRoles = false }: Props) {
  const alive = players.filter(p => p.isAlive).length;
  const dead = players.filter(p => !p.isAlive).length;

  return (
    <div className="card border-dark-200 bg-dark-500/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-4 text-sm">
          <span className="text-green-400 font-gothic">🌟 {alive} vivos</span>
          <span className="text-red-400 font-gothic">💀 {dead} muertos</span>
        </div>
        <span className="text-gothic-500 text-xs">{players.length} jugadores total</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map(player => {
          const char = allChars.find(c => c.id === player.characterId);
          return (
            <div
              key={player.id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-gothic transition-all ${
                player.isAlive
                  ? 'bg-dark-400 border-dark-200 text-gothic-200'
                  : 'bg-dark-700/50 border-dark-300/30 text-gothic-500 line-through opacity-60'
              }`}
            >
              {!player.isAlive && <span>💀</span>}
              {char && <span>{char.icon || '👤'}</span>}
              <span>{player.name}</span>
              {showRoles && char && (
                <span className="text-gothic-400">({char.name})</span>
              )}
              {!player.isAlive && !player.usedDeadVote && (
                <span title="Tiene voto fantasma" className="text-purple-400">👻</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
