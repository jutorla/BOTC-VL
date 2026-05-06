import type { CharacterType } from '../../types';

const TYPE_LABELS: Record<CharacterType, string> = {
  townsfolk: 'Aldeano',
  outsider: 'Forastero',
  minion: 'Esbirro',
  demon: 'Demonio',
  traveller: 'Viajero',
  fabled: 'Legendario',
  loric: 'Loric',
};

export function CharacterTypeBadge({ type }: { type: CharacterType }) {
  return (
    <span className={`badge-${type} font-gothic text-xs px-2 py-0.5 rounded-full border`}>
      {TYPE_LABELS[type]}
    </span>
  );
}

export function getTypeBadgeClass(type: CharacterType): string {
  return `badge-${type}`;
}

export { TYPE_LABELS };

const SIZE_PX: Record<string, number> = {
  sm: 16,
  md: 24,
  lg: 48,
  xl: 96,
  xxl: 192,
};

export function CharacterIcon({
  character,
  size = 'md',
  className = '',
}: {
  character: { icon?: string; iconUrl?: string; name?: string };
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
}) {
  const sizePx = SIZE_PX[size] || SIZE_PX.md;

  if (character.iconUrl) {
    return (
      <span className={className}>
        <img
          src={character.iconUrl}
          alt={character.name || ''}
          width={sizePx}
          height={sizePx}
          style={{ imageRendering: 'pixelated', display: 'block' }}
        />
      </span>
    );
  }

  return (
    <span className={className} style={{ fontSize: `${sizePx}px` }}>
      {character.icon || '👤'}
    </span>
  );
}