import type { Player, Character } from '../../types';

export type SelectionMode = 'select-nominee' | 'select-nominator' | 'select-voter' | null;

interface Props {
  players: Player[];
  allChars: Character[];
  showRoles: boolean;
  selectedId?: string;
  onSelect: (player: Player) => void;
  highlightIds?: string[];
  centerContent?: React.ReactNode;
  isNight?: boolean;
  selectionMode?: SelectionMode;
  disabledIds?: string[];
}

function getTokenSize(count: number) {
  if (count <= 8) return { outer: 56, fontSize: 22, nameMax: 72 };
  if (count <= 12) return { outer: 48, fontSize: 18, nameMax: 60 };
  if (count <= 16) return { outer: 40, fontSize: 15, nameMax: 52 };
  return { outer: 34, fontSize: 12, nameMax: 44 };
}

function getTeamColor(char?: Character) {
  if (!char) return { border: '#4b5563', bg: '#1f2937' };
  if (char.type === 'demon') return { border: '#dc2626', bg: '#450a0a' };
  if (char.type === 'minion') return { border: '#f97316', bg: '#431407' };
  if (char.type === 'outsider') return { border: '#a78bfa', bg: '#2e1065' };
  return { border: '#3b82f6', bg: '#172554' };
}

export default function CircularPlayerBoard({
  players,
  allChars,
  showRoles,
  selectedId,
  onSelect,
  highlightIds = [],
  centerContent,
  isNight = false,
  selectionMode = null,
  disabledIds = [],
}: Props) {
  const n = players.length;
  const { outer, fontSize, nameMax } = getTokenSize(n);

  // Radius as percentage of container half-width
  const rPct = n <= 6 ? 34 : n <= 10 ? 38 : 40;

  const modeColor = selectionMode === 'select-nominee' ? '#ef4444'
    : selectionMode === 'select-nominator' ? '#f97316'
    : selectionMode === 'select-voter' ? '#eab308'
    : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Selection mode banner */}
      {selectionMode && (
        <div
          className="self-center px-3 py-1 rounded-full text-xs font-gothic font-bold animate-pulse"
          style={{
            background: modeColor ? `${modeColor}22` : undefined,
            border: `1px solid ${modeColor}`,
            color: modeColor ?? undefined,
          }}
        >
          {selectionMode === 'select-nominee' && '🎯 Selecciona al NOMINADO'}
          {selectionMode === 'select-nominator' && '👆 Selecciona al NOMINADOR'}
          {selectionMode === 'select-voter' && '🗳️ Selecciona al JUGADOR'}
        </div>
      )}
    <div className="relative w-full" style={{ paddingBottom: '100%', maxHeight: '520px' }}>
      <div className="absolute inset-0">
        {/* Decorative ring */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isNight ? '#1e3a5f' : '#7c2d12'} stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r={rPct} fill="url(#ringGrad)"
            stroke={isNight ? 'rgba(59,130,246,0.15)' : 'rgba(139,69,19,0.2)'}
            strokeWidth="0.4"
            strokeDasharray="1.5,1.5"
          />
          {/* Seat lines from center */}
          {players.map((_, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const x1 = 50 + (rPct - 4) * Math.cos(angle);
            const y1 = 50 + (rPct - 4) * Math.sin(angle);
            return (
              <line
                key={i}
                x1="50" y1="50"
                x2={x1} y2={y1}
                stroke={isNight ? 'rgba(59,130,246,0.06)' : 'rgba(180,100,20,0.08)'}
                strokeWidth="0.3"
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute top-1/2 left-1/2 z-10 text-center"
          style={{ transform: 'translate(-50%,-50%)', width: `${100 - rPct * 2 - 4}%` }}
        >
          {centerContent}
        </div>

        {/* Players */}
        {players.map((player, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + rPct * Math.cos(angle);
          const y = 50 + rPct * Math.sin(angle);
          const char = allChars.find(c => c.id === player.characterId);
          const isSelected = selectedId === player.id;
          const isHighlighted = highlightIds.includes(player.id);
          const isDisabled = disabledIds.includes(player.id);
          const colors = getTeamColor(showRoles ? char : undefined);

          const nameFontSize = n <= 8 ? 10 : n <= 12 ? 9 : 8;

          return (
            <div
              key={player.id}
              className="absolute z-20"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <button
                onClick={() => !isDisabled && onSelect(player)}
                disabled={isDisabled}
                className={`flex flex-col items-center gap-0.5 group transition-transform ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'} ${selectionMode && !isDisabled ? 'cursor-crosshair' : ''}`}
                title={`${player.name}${showRoles && char ? ` — ${char.name}` : ''}${isDisabled ? ' (no disponible)' : ''}`}
              >
                {/* Token */}
                <div
                  className="relative rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                  style={{
                    width: outer,
                    height: outer,
                    fontSize: fontSize,
                    border: `2px solid ${
                      isSelected
                        ? (modeColor ?? (isNight ? '#60a5fa' : '#ef4444'))
                        : isHighlighted
                        ? '#eab308'
                        : selectionMode && !isDisabled
                        ? `${modeColor}88`
                        : player.isAlive
                        ? colors.border
                        : '#374151'
                    }`,
                    background: player.isAlive
                      ? isSelected
                        ? modeColor ? `${modeColor}40` : isNight ? 'rgba(37,99,235,0.5)' : 'rgba(185,28,28,0.5)'
                        : isHighlighted
                        ? 'rgba(161,131,0,0.3)'
                        : colors.bg
                      : 'rgba(17,24,39,0.8)',
                    opacity: player.isAlive ? 1 : 0.55,
                    boxShadow: isSelected
                      ? `0 0 12px 3px ${modeColor ? `${modeColor}66` : isNight ? 'rgba(59,130,246,0.4)' : 'rgba(220,38,38,0.4)'}`
                      : isHighlighted
                      ? '0 0 8px 2px rgba(234,179,8,0.35)'
                      : selectionMode && !isDisabled
                      ? `0 0 6px 1px ${modeColor}44`
                      : undefined,
                  }}
                >
                  {!player.isAlive ? (
                    <span>💀</span>
                  ) : showRoles && char ? (
                    <span>{char.icon}</span>
                  ) : (
                    <span
                      className="font-gothic font-bold text-gothic-200"
                      style={{ fontSize: Math.max(outer * 0.3, 10) }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                  {/* Ping animation for selected */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{ border: `2px solid ${isNight ? '#60a5fa' : '#ef4444'}` }}
                    />
                  )}

                  {/* Dead vote ghost indicator */}
                  {!player.isAlive && !player.usedDeadVote && (
                    <div className="absolute -top-1 -right-1 text-xs">👻</div>
                  )}

                  {/* Seat number */}
                  <div
                    className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center font-bold"
                    style={{
                      width: 14,
                      height: 14,
                      fontSize: 8,
                      background: isNight ? '#1e3a5f' : '#3b0d0d',
                      border: `1px solid ${isNight ? '#3b82f6' : '#7f1d1d'}`,
                      color: isNight ? '#93c5fd' : '#fca5a5',
                    }}
                  >
                    {i + 1}
                  </div>
                </div>

                {/* Name */}
                <span
                  className="font-gothic text-center leading-tight"
                  style={{
                    fontSize: nameFontSize,
                    maxWidth: nameMax,
                    color: player.isAlive
                      ? isSelected
                        ? isNight ? '#93c5fd' : '#fca5a5'
                        : '#d1d5db'
                      : '#6b7280',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  }}
                >
                  {player.name}
                </span>

                {/* Role name under token (if showRoles) */}
                {showRoles && char && player.isAlive && (
                  <span
                    className="text-center leading-tight"
                    style={{
                      fontSize: 7,
                      color: colors.border,
                      maxWidth: nameMax,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {char.name}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
