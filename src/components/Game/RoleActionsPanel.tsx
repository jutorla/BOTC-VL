import { useState } from 'react';
import { AlertTriangle, Info, Zap } from 'lucide-react';
import type { Player, Game } from '../../types';
import type { Character } from '../../types';
import {
  getActionsForCharacter,
  isActionBlocked,
  getActionColorClasses,
  type RoleAction,
} from '../../data/roleActions';
import Modal from '../UI/Modal';

interface Props {
  player: Player;
  character: Character | undefined;
  game: Game;
  allChars: Character[];
  /** Inicia la selección de objetivo en el tablero circular */
  onStartTargetSelection: (action: RoleAction) => void;
  /** Mata a un jugador */
  onKillPlayer: (playerId: string, reason: string) => void;
  /** Marca un reminder en el jugador */
  onAddReminder: (playerId: string, reminder: string) => void;
  /** El mal gana */
  onEvilWins: (reason: string) => void;
  /** El bien gana */
  onGoodWins: (reason: string) => void;
  /** Añade una nota al log */
  onAddNote: (note: string) => void;
}

export default function RoleActionsPanel({
  player,
  character,
  game,
  onStartTargetSelection,
  onKillPlayer,
  onAddReminder,
  onEvilWins,
  onGoodWins,
  onAddNote,
}: Props) {
  const [promptAction, setPromptAction] = useState<RoleAction | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState<string | null>(null); // action id

  const actions = getActionsForCharacter(character?.id ?? '').filter(
    a => a.trigger === 'manual'
  );

  if (!character || actions.length === 0) return null;

  const alivePlayers = game.players.filter(p => p.isAlive);

  const executeAction = (action: RoleAction) => {
    // Comprobar bloqueo
    if (isActionBlocked(action, player.reminders)) return;
    // Comprobar jugador vivo si se requiere
    if (action.requiresAlive && !player.isAlive) return;

    switch (action.result) {
      case 'select-target':
        onStartTargetSelection(action);
        break;

      case 'good-wins': {
        if (action.confirmText) {
          setPromptAction(action);
        } else {
          onGoodWins(`Habilidad de ${character.name}: ${action.description}`);
          if (action.usedMarker) onAddReminder(player.id, action.usedMarker);
        }
        break;
      }

      case 'evil-wins': {
        if (action.confirmText) {
          setPromptAction(action);
        } else {
          onEvilWins(`Habilidad de ${character.name}: ${action.description}`);
          if (action.usedMarker) onAddReminder(player.id, action.usedMarker);
        }
        break;
      }

      case 'kill-self': {
        if (action.confirmText) {
          setPromptAction(action);
        } else {
          onKillPlayer(player.id, `Habilidad de ${character.name}`);
          if (action.usedMarker) onAddReminder(player.id, action.usedMarker);
        }
        break;
      }

      case 'prompt':
        setPromptAction(action);
        break;

      case 'note':
        setShowNoteInput(action.id);
        break;

      default:
        break;
    }
  };

  const confirmPromptAction = () => {
    if (!promptAction) return;

    switch (promptAction.result) {
      case 'good-wins':
        onGoodWins(`Habilidad de ${character.name}: ${promptAction.label}`);
        break;
      case 'evil-wins':
        onEvilWins(`Habilidad de ${character.name}: ${promptAction.label}`);
        break;
      case 'kill-self':
        onKillPlayer(player.id, `Habilidad de ${character.name}: ${promptAction.label}`);
        break;
      case 'prompt':
        onAddNote(`[${character.icon} ${character.name}] ${promptAction.label} — ${player.name}`);
        break;
      default:
        break;
    }

    if (promptAction.usedMarker) onAddReminder(player.id, promptAction.usedMarker);
    setPromptAction(null);
  };

  const submitNote = (action: RoleAction) => {
    if (noteText.trim()) {
      onAddNote(`[${character.icon} ${character.name} — ${player.name}] ${action.label}: ${noteText}`);
    }
    if (action.usedMarker) onAddReminder(player.id, action.usedMarker);
    setNoteText('');
    setShowNoteInput(null);
  };

  return (
    <>
      <div className="mt-2">
        <p className="text-xs text-gothic-500 font-gothic mb-1.5 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Acciones del rol
        </p>
        <div className="flex flex-col gap-1.5">
          {actions.map(action => {
            const blocked = isActionBlocked(action, player.reminders);
            const deadBlocked = action.requiresAlive && !player.isAlive;
            const disabled = blocked || deadBlocked;

            // Mayoraccount: check 3 alive condition
            const mayorUnavailable =
              action.characterId === 'mayor' && action.id === 'mayor-win' &&
              (alivePlayers.length !== 3 || game.hasExecutionToday);

            return (
              <div key={action.id}>
                <button
                  onClick={() => executeAction(action)}
                  disabled={disabled || mayorUnavailable}
                  title={action.description}
                  className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded border text-xs font-gothic transition-all ${
                    disabled || mayorUnavailable
                      ? 'opacity-30 cursor-not-allowed bg-dark-600 border-dark-400 text-gothic-500'
                      : getActionColorClasses(action.color)
                  }`}
                >
                  <span className="text-sm">{action.icon}</span>
                  <span className="flex-1 text-left">{action.label}</span>
                  {blocked && <span className="text-xs opacity-60">(Usado)</span>}
                  {mayorUnavailable && <span className="text-xs opacity-60">(No disponible)</span>}
                </button>

                {/* Input de nota inline */}
                {showNoteInput === action.id && (
                  <div className="mt-1 p-2 bg-dark-600/60 rounded border border-dark-300/40">
                    <p className="text-xs text-gothic-400 mb-1">{action.description}</p>
                    <textarea
                      className="textarea-gothic text-xs w-full"
                      rows={2}
                      value={noteText}
                      autoFocus
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Escribe la declaración o nota..."
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => submitNote(action)}
                        className="btn-primary text-xs py-1 px-2"
                      >
                        Registrar
                      </button>
                      <button
                        onClick={() => { setShowNoteInput(null); setNoteText(''); }}
                        className="btn-ghost text-xs py-1 px-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recordatorios activos */}
        {player.reminders.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {player.reminders.map((r, i) => (
              <span
                key={i}
                className="text-xs px-1.5 py-0.5 rounded border border-yellow-800/40 bg-yellow-950/30 text-yellow-500 font-gothic"
              >
                📌 {r}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <Modal
        isOpen={!!promptAction}
        onClose={() => setPromptAction(null)}
        title={promptAction ? `${promptAction.icon} ${promptAction.label}` : ''}
      >
        {promptAction && (
          <div className="space-y-4">
            <div className="flex gap-3 p-3 rounded border border-yellow-800/40 bg-yellow-950/20">
              {promptAction.result === 'evil-wins' || promptAction.result === 'kill-self' ? (
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm text-gothic-200 leading-relaxed">
                  {promptAction.confirmText ?? promptAction.description}
                </p>
                <p className="text-xs text-gothic-500 mt-1 italic">{character.icon} {character.name} — {player.name}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmPromptAction}
                className={`flex-1 justify-center ${
                  promptAction.result === 'evil-wins' || promptAction.result === 'kill-self'
                    ? 'btn-danger'
                    : 'btn-primary'
                }`}
              >
                {promptAction.result === 'evil-wins' && '😈 Confirmar — El Mal gana'}
                {promptAction.result === 'good-wins' && '⚔️ Confirmar — El Bien gana'}
                {promptAction.result === 'kill-self' && '💀 Confirmar — Muere'}
                {promptAction.result === 'prompt' && '✅ Registrar en el log'}
              </button>
              <button onClick={() => setPromptAction(null)} className="btn-ghost">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
