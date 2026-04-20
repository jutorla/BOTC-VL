import type { CharacterType } from '../../types';

const TYPE_LABELS: Record<CharacterType, string> = {
  townsfolk: 'Aldeano',
  outsider: 'Forastero',
  minion: 'Esbirro',
  demon: 'Demonio',
  traveller: 'Viajero',
  fabled: 'Legendario',
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
