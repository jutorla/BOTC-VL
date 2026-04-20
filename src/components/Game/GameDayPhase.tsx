import { useState } from 'react';
import {
  Sun, Moon, Skull, FileText, ThumbsUp, X,
  Check, MessageSquare, User, Clock, Users, Swords, Ghost, Target, Hand
} from 'lucide-react';
import type { Game, Character, Nomination, DayEvent } from '../../types';
import { CharacterTypeBadge } from '../UI/CharacterTypeBadge';
import PlayerStatusBar from './PlayerStatusBar';
import CircularPlayerBoard, { type SelectionMode } from './CircularPlayerBoard';
import Modal from '../UI/Modal';
import { getDistribution } from '../../data/scripts';
import RoleActionsPanel from './RoleActionsPanel';
import {
  getOnNominatedActions, getOnExecutedActions, getOnNominatingActions,
  getOnDeathActions, isActionBlocked, type RoleAction,
} from '../../data/roleActions';

interface Props {
  game: Game;
  allChars: Character[];
  onUpdate: (game: Game) => void;
}

function getChar(charId: string, allChars: Character[]) {
  return allChars.find(c => c.id === charId);
}

export default function GameDayPhase({ game, allChars, onUpdate }: Props) {
  const currentRound = game.rounds[game.rounds.length - 1];
  const [nominations, setNominations] = useState<Nomination[]>(currentRound.nominations || []);
  const [activeNomination, setActiveNomination] = useState<Nomination | null>(null);
  const [nominatorId, setNominatorId] = useState('');
  const [nomineeId, setNomineeId] = useState('');
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [events, setEvents] = useState<DayEvent[]>(currentRound.events || []);
  const [notes, setNotes] = useState(game.storytellerNotes);
  const [showRoles, setShowRoles] = useState(true);
  const [playerNotes, setPlayerNotes] = useState<Record<string, string>>(
    Object.fromEntries(game.players.map(p => [p.id, p.notes]))
  );

  const alivePlayers = game.players.filter(p => p.isAlive);
  const voteThreshold = Math.ceil(alivePlayers.length / 2);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>();
  const distribution = getDistribution(game.players.length);

  // Nomination flow via circular board
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
  const [pendingNominatorId, setPendingNominatorId] = useState<string | undefined>();
  const [pendingNomineeId, setPendingNomineeId] = useState<string | undefined>();

  const cancelSelection = () => {
    setSelectionMode(null);
    setPendingNominatorId(undefined);
    setPendingNomineeId(undefined);
    setSelectedPlayerId(undefined);
  };

  const handleCircleClick = (player: import('../../types').Player) => {
    // Role action target selection (e.g. Cazadora shoot, Moonchild)
    if (selectionMode === 'select-voter' && pendingRoleAction && pendingRolePlayerId) {
      const sourcePlayer = game.players.find(p => p.id === pendingRolePlayerId);
      const sourceChar = sourcePlayer ? getChar(sourcePlayer.characterId, allChars) : null;
      if (sourcePlayer && sourceChar) {
        if (pendingRoleAction.characterId === 'slayer') {
          // Cazadora: if target is demon, dies — always show result popup
          const targetChar = getChar(player.characterId, allChars);
          const isDemon = targetChar?.type === 'demon';
          if (isDemon) {
            killPlayer(player.id, `Disparo de la Cazadora (${sourcePlayer.name})`);
          }
          addReminderToPlayer(sourcePlayer.id, 'Sin Disparo');
          setRoleResult({
            icon: '⚔️',
            title: isDemon ? '¡Impacto! El Demonio ha muerto' : 'Fallo — No es el Demonio',
            lines: isDemon
              ? [
                  `${sourcePlayer.name} dispara a ${player.name} ${targetChar?.icon ?? ''}.`,
                  `${player.name} era el ${targetChar?.name ?? 'Demonio'} y muere inmediatamente.`,
                  `La Cazadora ha usado su único disparo.`,
                ]
              : [
                  `${sourcePlayer.name} dispara a ${player.name} ${targetChar?.icon ?? ''}.`,
                  `${player.name} no es el Demonio. No ocurre nada.`,
                  `La Cazadora ha usado su único disparo.`,
                ],
            isDangerous: isDemon,
          });
        } else if (pendingRoleAction.characterId === 'moonchild') {
          const targetChar = getChar(player.characterId, allChars);
          const isGood = targetChar?.type === 'townsfolk' || targetChar?.type === 'outsider';
          if (isGood) {
            killPlayer(player.id, `Señalado por el Hijo de la Luna al morir (${sourcePlayer.name})`);
          }
          setRoleResult({
            icon: '🌛',
            title: isGood ? `${player.name} muere` : 'Sin efecto',
            lines: isGood
              ? [`${sourcePlayer.name} señala a ${player.name} (${targetChar?.name}).`, `Es bueno — muere.`]
              : [`${sourcePlayer.name} señala a ${player.name} (${targetChar?.name}).`, `No es bueno — sin efecto.`],
            isDangerous: isGood,
          });
        } else if (pendingRoleAction.characterId === 'klutz') {
          const targetChar = getChar(player.characterId, allChars);
          const isGood = targetChar?.type === 'townsfolk' || targetChar?.type === 'outsider';
          if (isGood) triggerEvilWins(`El Patoso ${sourcePlayer.name} señaló a ${player.name}, que es bueno.`);
          setRoleResult({
            icon: '🤦',
            title: isGood ? '¡El Mal gana!' : 'Sin efecto',
            lines: [`${sourcePlayer.name} (Patoso) señala a ${player.name} (${targetChar?.name}).`,
              isGood ? '¡Es bueno! El Mal gana.' : 'No es bueno — sin efecto.'],
            isDangerous: isGood,
          });
        } else {
          addNoteToLog(`[${sourceChar.icon} ${sourceChar.name}] ${pendingRoleAction.label}: objetivo → ${player.name}`);
        }
      }
      setPendingRoleAction(null);
      setPendingRolePlayerId(undefined);
      setSelectionMode(null);
      return;
    }

    // If in selection mode, handle nomination step
    if (selectionMode === 'select-nominee') {
      // pendingNominatorId is set, this player is the nominee
      const nom: Nomination = {
        id: crypto.randomUUID(),
        nominatorId: pendingNominatorId!,
        nomineeId: player.id,
        votes: [],
        executed: false,
        aborted: false,
      };
      if (nominations.some(n => n.nomineeId === player.id && !n.aborted)) {
        alert('Este jugador ya ha sido nominado hoy.');
        cancelSelection();
        return;
      }
      setNominations(prev => [...prev, nom]);
      setActiveNomination(nom);
      const savedNominatorId = pendingNominatorId!;
      cancelSelection();
      runNominationTriggers(savedNominatorId, player.id);
      return;
    }
    if (selectionMode === 'select-nominator') {
      // pendingNomineeId is set, this player is the nominator
      if (nominations.some(n => n.nomineeId === pendingNomineeId && !n.aborted)) {
        alert('Ese jugador ya ha sido nominado hoy.');
        cancelSelection();
        return;
      }
      const nom: Nomination = {
        id: crypto.randomUUID(),
        nominatorId: player.id,
        nomineeId: pendingNomineeId!,
        votes: [],
        executed: false,
        aborted: false,
      };
      const savedNomineeId = pendingNomineeId!;
      setNominations(prev => [...prev, nom]);
      setActiveNomination(nom);
      cancelSelection();
      runNominationTriggers(player.id, savedNomineeId);
      return;
    }
    // Normal select
    setSelectedPlayerId(prev => prev === player.id ? undefined : player.id);
  };

  // Quick actions from selected player panel
  const startNominatesFlow = (nominatorId: string) => {
    setPendingNominatorId(nominatorId);
    setSelectedPlayerId(undefined);
    setSelectionMode('select-nominee');
  };

  const startIsNominatedFlow = (nomineeId: string) => {
    setPendingNomineeId(nomineeId);
    setSelectedPlayerId(undefined);
    setSelectionMode('select-nominator');
  };

  const killOrRevivePlayer = (playerId: string) => {
    const updatedPlayers = game.players.map(p =>
      p.id === playerId ? { ...p, isAlive: !p.isAlive } : p
    );
    onUpdate({ ...game, players: updatedPlayers, updatedAt: Date.now() });
    setSelectedPlayerId(undefined);
  };

  const spendDeadVote = (playerId: string) => {
    const updatedPlayers = game.players.map(p =>
      p.id === playerId ? { ...p, usedDeadVote: true } : p
    );
    onUpdate({ ...game, players: updatedPlayers, updatedAt: Date.now() });
    setSelectedPlayerId(undefined);
  };

  const selectedPlayer = game.players.find(p => p.id === selectedPlayerId);
  const selectedChar = selectedPlayer ? getChar(selectedPlayer.characterId, allChars) : null;

  // ── Role action states ───────────────────────────────────────
  // Auto-trigger modal: shown when a nomination/execution triggers a role ability
  type AutoTrigger = { action: RoleAction; sourcePlayer: import('../../types').Player; targetPlayer?: import('../../types').Player };
  const [autoTrigger, setAutoTrigger] = useState<AutoTrigger | null>(null);
  // Pending role action that needs a target from the circle (e.g. Slayer shoot)
  const [pendingRoleAction, setPendingRoleAction] = useState<RoleAction | null>(null);
  const [pendingRolePlayerId, setPendingRolePlayerId] = useState<string | undefined>();
  // Result popup for resolved role actions (Cazadora, Moonchild, Klutz)
  type RoleResult = { icon: string; title: string; lines: string[]; isDangerous: boolean };
  const [roleResult, setRoleResult] = useState<RoleResult | null>(null);

  // ── Shared helpers ───────────────────────────────────────────
  const addEventLog = (ev: DayEvent) => setEvents(prev => [...prev, ev]);

  const killPlayer = (playerId: string, reason: string) => {
    const p = game.players.find(pl => pl.id === playerId);
    if (!p || !p.isAlive) return;
    addEventLog({ type: 'death', description: `${p.name} ha muerto. (${reason})`, playerId, timestamp: Date.now() });
    const updatedPlayers = game.players.map(pl => pl.id === playerId ? { ...pl, isAlive: false } : pl);
    onUpdate({ ...game, players: updatedPlayers, updatedAt: Date.now() });
    setSelectedPlayerId(undefined);
  };

  const addReminderToPlayer = (playerId: string, reminder: string) => {
    const updatedPlayers = game.players.map(p =>
      p.id === playerId ? { ...p, reminders: [...p.reminders.filter(r => r !== reminder), reminder] } : p
    );
    onUpdate({ ...game, players: updatedPlayers, updatedAt: Date.now() });
  };

  const triggerEvilWins = (reason: string) => {
    addEventLog({ type: 'note', description: `😈 EL MAL GANA: ${reason}`, timestamp: Date.now() });
    const updatedGame: Game = { ...game, phase: 'ended', winner: 'evil', winReason: reason, updatedAt: Date.now() };
    onUpdate(updatedGame);
  };

  const triggerGoodWins = (reason: string) => {
    addEventLog({ type: 'note', description: `⚔️ EL BIEN GANA: ${reason}`, timestamp: Date.now() });
    const updatedGame: Game = { ...game, phase: 'ended', winner: 'good', winReason: reason, updatedAt: Date.now() };
    onUpdate(updatedGame);
  };

  const addNoteToLog = (note: string) => {
    addEventLog({ type: 'note', description: note, timestamp: Date.now() });
  };

  // Starts target selection on circle for a role action (e.g. Cazadora disparo)
  const startRoleTargetSelection = (action: RoleAction, sourcePlayerId: string) => {
    setPendingRoleAction(action);
    setPendingRolePlayerId(sourcePlayerId);
    setSelectedPlayerId(undefined);
    setSelectionMode('select-voter'); // reuse voter color (yellow) as generic target
  };

  // ── Auto-trigger confirm ──────────────────────────────────────
  const confirmAutoTrigger = () => {
    if (!autoTrigger) return;
    const { action, sourcePlayer, targetPlayer } = autoTrigger;
    const char = getChar(sourcePlayer.characterId, allChars);

    switch (action.result) {
      case 'kill-nominator':
        if (targetPlayer) killPlayer(targetPlayer.id, `Habilidad de ${char?.name ?? action.characterId}`);
        break;
      case 'kill-self':
        killPlayer(sourcePlayer.id, `Habilidad de ${char?.name ?? action.characterId}`);
        break;
      case 'evil-wins':
        triggerEvilWins(`Habilidad de ${char?.name ?? action.characterId} — ${sourcePlayer.name}`);
        break;
      case 'good-wins':
        triggerGoodWins(`Habilidad de ${char?.name ?? action.characterId} — ${sourcePlayer.name}`);
        break;
      case 'prompt':
        addNoteToLog(`[${char?.icon ?? ''} ${char?.name ?? action.characterId}] ${action.label} — ${sourcePlayer.name}`);
        break;
      default:
        break;
    }
    if (action.usedMarker) addReminderToPlayer(sourcePlayer.id, action.usedMarker);
    setAutoTrigger(null);
  };

  // ── Shared nomination trigger checker ───────────────────────
  const runNominationTriggers = (nomId: string, nomeeId: string) => {
    const nomineePlayer = game.players.find(p => p.id === nomeeId);
    const nominatorPlayer = game.players.find(p => p.id === nomId);
    if (!nomineePlayer) return;

    // Virgin: triggers if nominator is townsfolk and hability not yet used
    const onNominatedActions = getOnNominatedActions(nomineePlayer.characterId);
    for (const action of onNominatedActions) {
      if (isActionBlocked(action, nomineePlayer.reminders)) continue;
      if (action.requiresAlive && !nomineePlayer.isAlive) continue;
      if (action.characterId === 'virgin') {
        const nominatorChar = nominatorPlayer ? getChar(nominatorPlayer.characterId, allChars) : null;
        if (nominatorChar?.type !== 'townsfolk') continue;
      }
      setAutoTrigger({ action, sourcePlayer: nomineePlayer, targetPlayer: nominatorPlayer ?? undefined });
      break;
    }

    // Witch curse: if nominator has 'Maldito' reminder
    if (nominatorPlayer) {
      const onNominatingActions = getOnNominatingActions(nominatorPlayer.characterId);
      for (const action of onNominatingActions) {
        if (isActionBlocked(action, nominatorPlayer.reminders)) continue;
        if (action.characterId === 'witch' && !nominatorPlayer.reminders.includes('Maldito')) continue;
        setAutoTrigger({ action, sourcePlayer: nominatorPlayer, targetPlayer: nomineePlayer });
        break;
      }
    }
  };

  const addNomination = () => {
    if (!nominatorId || !nomineeId) return;

    // Check: nominated player hasn't been nominated today
    if (nominations.some(n => n.nomineeId === nomineeId && !n.aborted)) {
      alert('Este jugador ya ha sido nominado hoy.');
      return;
    }

    const nomination: Nomination = {
      id: `nom_${Date.now()}`,
      nominatorId,
      nomineeId,
      votes: [],
      executed: false,
      aborted: false,
    };
    setNominations(prev => [...prev, nomination]);
    setActiveNomination(nomination);
    setNominatorId('');
    setNomineeId('');
    setShowNominateModal(false);

    runNominationTriggers(nominatorId, nomineeId);
  };

  const toggleVote = (nominationId: string, playerId: string) => {
    setNominations(prev => prev.map(n => {
      if (n.id !== nominationId) return n;
      const votes = n.votes.includes(playerId)
        ? n.votes.filter(v => v !== playerId)
        : [...n.votes, playerId];
      return { ...n, votes };
    }));
    if (activeNomination?.id === nominationId) {
      setActiveNomination(prev => {
        if (!prev) return null;
        const votes = prev.votes.includes(playerId)
          ? prev.votes.filter(v => v !== playerId)
          : [...prev.votes, playerId];
        return { ...prev, votes };
      });
    }
  };

  const executePlayer = (nominationId: string) => {
    const nom = nominations.find(n => n.id === nominationId);
    if (!nom) return;

    if (game.hasExecutionToday) {
      alert('Solo puede haber una ejecución por día.');
      return;
    }

    const player = game.players.find(p => p.id === nom.nomineeId);
    if (!player) return;

    const newEvent: DayEvent = {
      type: 'execution',
      description: `${player.name} fue ejecutado/a.`,
      playerId: nom.nomineeId,
      timestamp: Date.now(),
    };

    setNominations(prev => prev.map(n =>
      n.id === nominationId ? { ...n, executed: true } : n
    ));
    setEvents(prev => [...prev, newEvent]);

    const updatedPlayers = game.players.map(p =>
      p.id === nom.nomineeId ? { ...p, isAlive: false } : p
    );

    const updatedGame: Game = {
      ...game,
      players: updatedPlayers,
      hasExecutionToday: true,
      rounds: game.rounds.map((r, i) =>
        i === game.rounds.length - 1
          ? { ...r, nominations: [...nominations.map(n => n.id === nominationId ? { ...n, executed: true } : n)], events: [...events, newEvent] }
          : r
      ),
      updatedAt: Date.now(),
    };

    onUpdate(updatedGame);

    // ── Auto-triggers on execution ────────────────────────────
    const onExecutedActions = getOnExecutedActions(player.characterId);
    for (const action of onExecutedActions) {
      if (isActionBlocked(action, player.reminders)) continue;
      setAutoTrigger({ action, sourcePlayer: player });
      break; // show one at a time; user will dismiss and next will not re-trigger
    }
    // Also check if any alive Scarlet Woman should rise (demon executed)
    const executedChar = getChar(player.characterId, allChars);
    if (executedChar?.type === 'demon') {
      const scarletWoman = game.players.find(p => p.isAlive && getChar(p.characterId, allChars)?.id === 'scarlet_woman');
      if (scarletWoman && game.players.filter(p => p.isAlive).length >= 5) {
        const swActions = getOnDeathActions('scarlet_woman');
        for (const action of swActions) {
          setAutoTrigger({ action, sourcePlayer: scarletWoman });
          break;
        }
      }
    }
  };

  const abortNomination = (nominationId: string) => {
    setNominations(prev => prev.map(n =>
      n.id === nominationId ? { ...n, aborted: true } : n
    ));
    if (activeNomination?.id === nominationId) setActiveNomination(null);
  };

  const endDay = () => {
    const roundNight = {
      round: game.round + 1,
      phase: 'night' as const,
      events: [],
      nightActions: [],
      nominations: [],
      deaths: [],
    };

    const updatedPlayers = game.players.map(p => ({
      ...p,
      notes: playerNotes[p.id] || p.notes,
    }));

    const updatedGame: Game = {
      ...game,
      players: updatedPlayers,
      phase: 'night',
      round: game.round + 1,
      rounds: [
        ...game.rounds.map((r, i) =>
          i === game.rounds.length - 1
            ? { ...r, nominations, events, storytellerNotes: notes }
            : r
        ),
        roundNight,
      ],
      hasExecutionToday: false,
      storytellerNotes: notes,
      updatedAt: Date.now(),
    };

    onUpdate(updatedGame);
  };

  const endGame = (winner: 'good' | 'evil', reason: string) => {
    const updatedPlayers = game.players.map(p => ({
      ...p,
      notes: playerNotes[p.id] || p.notes,
    }));

    const updatedGame: Game = {
      ...game,
      players: updatedPlayers,
      phase: 'ended',
      winner,
      winReason: reason,
      rounds: game.rounds.map((r, i) =>
        i === game.rounds.length - 1 ? { ...r, nominations, events, storytellerNotes: notes } : r
      ),
      storytellerNotes: notes,
      updatedAt: Date.now(),
    };

    onUpdate(updatedGame);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a0800 0%, #200d00 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Sun className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="font-gothic text-2xl text-yellow-300">Día {game.round}</h1>
              <p className="text-yellow-600 text-sm">{game.scriptName}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowRoles(!showRoles)}
              className="btn-secondary text-sm"
            >
              <User className="w-4 h-4" />
              {showRoles ? 'Ocultar roles' : 'Mostrar roles'}
            </button>
            <button onClick={endDay} className="btn-secondary text-sm">
              <Moon className="w-4 h-4" />
              Anochecer
            </button>
            <button
              onClick={() => {
                if (confirm('¿El Bien gana? (Demonio ejecutado u otra condición de victoria)')) {
                  endGame('good', 'El pueblo ejecutó al Demonio.');
                }
              }}
              className="btn-secondary text-sm border-blue-700/50 text-blue-300 hover:border-blue-500"
            >
              ⚔️ Victoria del Bien
            </button>
            <button
              onClick={() => {
                if (confirm('¿El Mal gana? (Solo quedan 2 jugadores vivos u otra condición)')) {
                  endGame('evil', 'Solo quedaron 2 jugadores vivos.');
                }
              }}
              className="btn-danger text-sm"
            >
              😈 Victoria del Mal
            </button>
          </div>
        </div>

        {/* Player status */}
        <PlayerStatusBar players={game.players} allChars={allChars} showRoles={showRoles} />

        {/* Vote threshold */}
        <div className="flex items-center gap-2 mt-3 text-sm text-yellow-400 font-gothic">
          <Clock className="w-4 h-4" />
          <span>Se necesitan <strong>{voteThreshold}</strong> votos para ejecutar ({alivePlayers.length} vivos)</span>
          {game.hasExecutionToday && (
            <span className="ml-2 text-red-400 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Ya hubo ejecución hoy
            </span>
          )}
        </div>

        {/* Circular board */}
        <div className="mt-4 card border-yellow-900/30 p-4" style={{ background: 'rgba(20,10,0,0.6)' }}>
          {/* Distribution strip */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-gothic text-yellow-400 text-sm flex items-center gap-2">
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

          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* Circle */}
            <div className="w-full lg:max-w-sm mx-auto" style={{ maxWidth: 440 }}>
              <CircularPlayerBoard
                players={game.players}
                allChars={allChars}
                showRoles={showRoles}
                selectedId={selectedPlayerId}
                onSelect={handleCircleClick}
                highlightIds={[
                  ...(activeNomination ? [activeNomination.nomineeId, activeNomination.nominatorId] : []),
                  ...(pendingNominatorId ? [pendingNominatorId] : []),
                  ...(pendingNomineeId ? [pendingNomineeId] : []),
                ]}
                selectionMode={selectionMode}
                disabledIds={
                  selectionMode === 'select-nominee'
                    ? [
                        pendingNominatorId!,
                        ...game.players.filter(p => !p.isAlive).map(p => p.id),
                        ...nominations.filter(n => !n.aborted).map(n => n.nomineeId),
                      ]
                    : selectionMode === 'select-nominator'
                    ? [
                        pendingNomineeId!,
                        ...game.players.filter(p => !p.isAlive).map(p => p.id),
                      ]
                    : []
                }
                centerContent={
                  selectionMode ? (
                    <div className="text-center">
                      <p className="font-gothic text-xs" style={{ color: selectionMode === 'select-nominee' ? '#ef4444' : '#f97316' }}>
                        {selectionMode === 'select-nominee' ? '🎯 ¿Quién es nominado?' : '👆 ¿Quién nomina?'}
                      </p>
                      <button
                        onClick={cancelSelection}
                        className="mt-1 text-xs text-gothic-400 hover:text-gothic-200 underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Sun className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                      <p className="font-gothic text-yellow-400 text-sm">Día {game.round}</p>
                      <p className="text-yellow-600 text-xs">{alivePlayers.length} vivos</p>
                      {game.hasExecutionToday && <p className="text-red-400 text-xs mt-1">⚔️ Ejecutado</p>}
                    </div>
                  )
                }
              />
            </div>

            {/* Selected player panel */}
            {selectedPlayer && !selectionMode && (
              <div className="flex-1 min-w-0 p-4 rounded-lg border border-yellow-800/40 bg-dark-500/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {selectedChar && <span className="text-3xl">{selectedChar.icon}</span>}
                    <div>
                      <h4 className="font-gothic text-gothic-100 text-lg">{selectedPlayer.name}</h4>
                      {selectedChar && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gothic-300 text-sm">{selectedChar.name}</span>
                          <CharacterTypeBadge type={selectedChar.type} />
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${selectedPlayer.isAlive ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedPlayer.isAlive ? '🌟 Vivo' : '💀 Muerto'}
                        {!selectedPlayer.isAlive && !selectedPlayer.usedDeadVote && ' · 👻 Voto fantasma disponible'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPlayerId(undefined)} className="text-gothic-500 hover:text-gothic-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {selectedPlayer.isAlive && (
                    <>
                      <button
                        onClick={() => startNominatesFlow(selectedPlayer.id)}
                        disabled={game.hasExecutionToday}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-gothic transition-all bg-red-950/40 border-red-800/50 text-red-300 hover:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Este jugador nomina a otro (click en el tablero)"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Nomina a…</span>
                      </button>
                      <button
                        onClick={() => startIsNominatedFlow(selectedPlayer.id)}
                        disabled={game.hasExecutionToday || nominations.some(n => n.nomineeId === selectedPlayer.id && !n.aborted)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-gothic transition-all bg-orange-950/40 border-orange-800/50 text-orange-300 hover:bg-orange-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Alguien nomina a este jugador (click en el tablero)"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Es nominado por…</span>
                      </button>
                    </>
                  )}
                  {!selectedPlayer.isAlive && !selectedPlayer.usedDeadVote && activeNomination && !activeNomination.aborted && !activeNomination.executed && (
                    <button
                      onClick={() => spendDeadVote(selectedPlayer.id)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-gothic transition-all bg-purple-950/40 border-purple-800/50 text-purple-300 hover:bg-purple-900/50 col-span-2"
                    >
                      <Ghost className="w-3.5 h-3.5" />
                      <span>Usar voto fantasma</span>
                    </button>
                  )}
                  <button
                    onClick={() => killOrRevivePlayer(selectedPlayer.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-gothic transition-all col-span-${selectedPlayer.isAlive ? 1 : 2} ${
                      selectedPlayer.isAlive
                        ? 'bg-gray-900/40 border-gray-700/50 text-gray-300 hover:bg-gray-800/50'
                        : 'bg-green-950/40 border-green-800/50 text-green-300 hover:bg-green-900/50'
                    }`}
                  >
                    {selectedPlayer.isAlive
                      ? <><Skull className="w-3.5 h-3.5" /><span>Matar</span></>
                      : <><Hand className="w-3.5 h-3.5" /><span>Revivir</span></>}
                  </button>
                  {selectedPlayer.isAlive && (
                    <button
                      onClick={() => {
                        // Abrir votacion rapida en nominacion activa
                        if (activeNomination && !activeNomination.aborted && !activeNomination.executed) {
                          toggleVote(activeNomination.id, selectedPlayer.id);
                          setSelectedPlayerId(undefined);
                        }
                      }}
                      disabled={!activeNomination || activeNomination.aborted || activeNomination.executed}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-gothic transition-all bg-yellow-950/40 border-yellow-800/50 text-yellow-300 hover:bg-yellow-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Registrar voto de este jugador en la nominación activa"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Votar</span>
                    </button>
                  )}
                </div>

                {selectedChar && (
                  <p className="text-xs text-gothic-400 italic mb-3 leading-relaxed">"{selectedChar.ability}"</p>
                )}

                {/* Role-specific actions */}
                <RoleActionsPanel
                  player={selectedPlayer}
                  character={selectedChar ?? undefined}
                  game={game}
                  allChars={allChars}
                  onStartTargetSelection={action => startRoleTargetSelection(action, selectedPlayer.id)}
                  onKillPlayer={killPlayer}
                  onAddReminder={addReminderToPlayer}
                  onEvilWins={triggerEvilWins}
                  onGoodWins={triggerGoodWins}
                  onAddNote={addNoteToLog}
                />

                <textarea
                  className="textarea-gothic text-xs w-full mt-3"
                  rows={2}
                  value={playerNotes[selectedPlayer.id] || ''}
                  onChange={e => setPlayerNotes(prev => ({ ...prev, [selectedPlayer.id]: e.target.value }))}
                  placeholder={`Notas sobre ${selectedPlayer.name}...`}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left: Players with actions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Nominate button */}
            <button
              onClick={() => setShowNominateModal(true)}
              disabled={game.hasExecutionToday}
              className="btn-primary w-full justify-center py-3"
            >
              <MessageSquare className="w-5 h-5" />
              Nueva Nominación
            </button>

            {/* Active nomination voting */}
            {activeNomination && !activeNomination.aborted && !activeNomination.executed && (
              <div className="card border-yellow-700/50" style={{ background: 'rgba(40,25,0,0.8)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-gothic text-yellow-300 text-lg">
                      Votación en curso
                    </h2>
                    <p className="text-yellow-600 text-sm">
                      {game.players.find(p => p.id === activeNomination.nominatorId)?.name} nomina a{' '}
                      <strong className="text-yellow-400">
                        {game.players.find(p => p.id === activeNomination.nomineeId)?.name}
                      </strong>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-gothic text-3xl text-yellow-400">{activeNomination.votes.length}</p>
                    <p className="text-yellow-600 text-xs">/ {voteThreshold} votos</p>
                  </div>
                </div>

                {/* Voter list */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {game.players.map(player => {
                    const canVote = player.isAlive || (!player.usedDeadVote);
                    const hasVoted = activeNomination.votes.includes(player.id);
                    if (!canVote && !hasVoted) return null;

                    return (
                      <button
                        key={player.id}
                        onClick={() => toggleVote(activeNomination.id, player.id)}
                        className={`flex items-center gap-2 p-2 rounded border text-sm transition-all ${
                          hasVoted
                            ? 'bg-yellow-900/30 border-yellow-600 text-yellow-300'
                            : 'bg-dark-400 border-dark-200 text-gothic-300 hover:border-dark-100'
                        } ${!player.isAlive ? 'opacity-70' : ''}`}
                      >
                        {hasVoted
                          ? <ThumbsUp className="w-3 h-3 text-yellow-400" />
                          : <div className="w-3 h-3 rounded-full border border-gothic-500" />
                        }
                        <span className="font-gothic truncate">{player.name}</span>
                        {!player.isAlive && <span title="Voto fantasma" className="text-purple-400 text-xs">👻</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  {activeNomination.votes.length >= voteThreshold && !game.hasExecutionToday && (
                    <button
                      onClick={() => executePlayer(activeNomination.id)}
                      className="btn-danger flex-1 justify-center"
                    >
                      <Skull className="w-4 h-4" />
                      Ejecutar a {game.players.find(p => p.id === activeNomination.nomineeId)?.name}
                    </button>
                  )}
                  <button
                    onClick={() => abortNomination(activeNomination.id)}
                    className="btn-secondary"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Past nominations */}
            {nominations.length > 0 && (
              <div className="card border-dark-200">
                <h3 className="font-gothic text-gothic-300 text-sm mb-3">Nominaciones del día</h3>
                <div className="space-y-2">
                  {nominations.map(nom => {
                    const nominator = game.players.find(p => p.id === nom.nominatorId);
                    const nominee = game.players.find(p => p.id === nom.nomineeId);
                    const char = nominee ? getChar(nominee.characterId, allChars) : null;
                    const passed = nom.votes.length >= voteThreshold;

                    return (
                      <div
                        key={nom.id}
                        className={`flex items-center gap-3 p-2 rounded border text-sm ${
                          nom.executed
                            ? 'bg-red-900/20 border-red-800/40 text-red-300'
                            : nom.aborted
                            ? 'bg-dark-600/30 border-dark-300/20 text-gothic-500 opacity-60'
                            : passed
                            ? 'bg-yellow-900/20 border-yellow-700/40 text-yellow-300'
                            : 'bg-dark-400 border-dark-200 text-gothic-300'
                        }`}
                      >
                        <span className="font-gothic">{nominator?.name}</span>
                        <span className="text-gothic-500">→</span>
                        <span className="font-gothic">{nominee?.name}</span>
                        {char && <span>{char.icon}</span>}
                        <span className="ml-auto text-xs">
                          {nom.votes.length} voto{nom.votes.length !== 1 ? 's' : ''}
                        </span>
                        {nom.executed && <span className="text-xs text-red-400">💀 Ejecutado</span>}
                        {nom.aborted && <span className="text-xs text-gothic-500">Cancelado</span>}
                        {!nom.executed && !nom.aborted && nom !== activeNomination && (
                          <button
                            onClick={() => setActiveNomination(nom)}
                            className="text-xs text-yellow-400 hover:text-yellow-300"
                          >
                            Reabrir
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Player notes */}
            <div className="card border-dark-200">
              <h3 className="font-gothic text-gothic-300 text-sm mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Notas por jugador
              </h3>
              <div className="space-y-2">
                {game.players.map(player => {
                  const char = getChar(player.characterId, allChars);
                  return (
                    <div key={player.id} className={`${!player.isAlive ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {char && <span>{char.icon}</span>}
                        <span className="font-gothic text-sm text-gothic-200">{player.name}</span>
                        {char && <CharacterTypeBadge type={char.type} />}
                        {!player.isAlive && <span className="text-red-400 text-xs">💀</span>}
                      </div>
                      <textarea
                        className="textarea-gothic text-xs"
                        rows={2}
                        value={playerNotes[player.id] || ''}
                        onChange={e => setPlayerNotes(prev => ({ ...prev, [player.id]: e.target.value }))}
                        placeholder={`Notas sobre ${player.name}...`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Log & notes */}
          <div className="space-y-4">
            {/* Events log */}
            <div className="card border-dark-200" style={{ background: 'rgba(15,8,0,0.8)' }}>
              <h2 className="font-gothic text-yellow-300 text-base mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Registro del Día
              </h2>
              {events.length === 0 ? (
                <p className="text-gothic-500 text-xs">Sin eventos todavía...</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {events.map((ev, i) => (
                    <div key={i} className="text-xs text-gothic-300 p-2 bg-dark-600/50 rounded border border-dark-300/30">
                      {ev.type === 'death' && '💀'}
                      {ev.type === 'execution' && '⚔️'}
                      {ev.type === 'nomination' && '📢'}
                      {' '}{ev.description}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Night deaths summary */}
            {game.rounds.length > 0 && (() => {
              const lastNightRound = game.rounds.find(r => r.phase === 'night' && r.round === game.round);
              const nightDeaths = lastNightRound?.deaths || [];
              if (nightDeaths.length === 0) return null;
              return (
                <div className="card border-blue-900/30">
                  <h3 className="font-gothic text-blue-300 text-sm mb-2 flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Muertos anoche
                  </h3>
                  {nightDeaths.map(pid => {
                    const p = game.players.find(pl => pl.id === pid);
                    const c = p ? getChar(p.characterId, allChars) : null;
                    return (
                      <div key={pid} className="flex items-center gap-2 text-sm text-blue-300">
                        <Skull className="w-3 h-3" />
                        {c && <span>{c.icon}</span>}
                        <span>{p?.name}</span>
                        {c && <CharacterTypeBadge type={c.type} />}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Storyteller notes */}
            <div className="card border-dark-200">
              <h2 className="font-gothic text-gothic-300 text-base mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas del Narrador
              </h2>
              <textarea
                className="textarea-gothic text-sm"
                rows={6}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Información secreta..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nominate modal */}
      <Modal
        isOpen={showNominateModal}
        onClose={() => setShowNominateModal(false)}
        title="Nueva Nominación"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gothic-300 font-gothic mb-1 block">Nominador</label>
            <select
              className="select-gothic"
              value={nominatorId}
              onChange={e => setNominatorId(e.target.value)}
            >
              <option value="">Selecciona quién nomina...</option>
              {game.players.filter(p => p.isAlive).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gothic-300 font-gothic mb-1 block">Nominado</label>
            <select
              className="select-gothic"
              value={nomineeId}
              onChange={e => setNomineeId(e.target.value)}
            >
              <option value="">Selecciona quién es nominado...</option>
              {game.players.filter(p => p.isAlive && p.id !== nominatorId).map(p => {
                const alreadyNominated = nominations.some(n => n.nomineeId === p.id && !n.aborted);
                return (
                  <option key={p.id} value={p.id} disabled={alreadyNominated}>
                    {p.name}{alreadyNominated ? ' (ya nominado)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          {nominatorId && nomineeId && (
            <div className="p-3 bg-dark-400 rounded border border-dark-200 text-sm text-gothic-300">
              <strong className="text-gothic-100">{game.players.find(p => p.id === nominatorId)?.name}</strong>
              {' '}nomina a{' '}
              <strong className="text-gothic-100">{game.players.find(p => p.id === nomineeId)?.name}</strong>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={addNomination}
              disabled={!nominatorId || !nomineeId}
              className="btn-primary flex-1 justify-center"
            >
              <MessageSquare className="w-4 h-4" />
              Confirmar Nominación
            </button>
            <button onClick={() => setShowNominateModal(false)} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Role action result popup (Cazadora, Moonchild, Klutz…) */}
      <Modal
        isOpen={!!roleResult}
        onClose={() => setRoleResult(null)}
        title={roleResult ? `${roleResult.icon} ${roleResult.title}` : ''}
      >
        {roleResult && (
          <div className="space-y-4">
            <div className={`p-4 rounded border text-sm leading-relaxed space-y-2 ${
              roleResult.isDangerous
                ? 'border-red-800/50 bg-red-950/30 text-red-200'
                : 'border-dark-200 bg-dark-500/50 text-gothic-200'
            }`}>
              {roleResult.lines.map((line, i) => (
                <p key={i} className={i === 0 ? 'text-gothic-100' : 'text-gothic-300 text-xs'}>{line}</p>
              ))}
            </div>
            <button
              onClick={() => setRoleResult(null)}
              className={roleResult.isDangerous ? 'btn-danger w-full justify-center' : 'btn-primary w-full justify-center'}
            >
              {roleResult.isDangerous ? '📌 Entendido' : '✅ Entendido'}
            </button>
          </div>
        )}
      </Modal>

      {/* Auto-trigger role ability modal */}
      <Modal
        isOpen={!!autoTrigger}
        onClose={() => setAutoTrigger(null)}
        title={autoTrigger ? `${autoTrigger.action.icon} Habilidad activada` : ''}
      >
        {autoTrigger && (() => {
          const { action, sourcePlayer, targetPlayer } = autoTrigger;
          const srcChar = getChar(sourcePlayer.characterId, allChars);
          const tgtChar = targetPlayer ? getChar(targetPlayer.characterId, allChars) : null;
          const isDangerous = action.result === 'evil-wins' || action.result === 'kill-nominator' || action.result === 'kill-self';
          return (
            <div className="space-y-4">
              {/* Role banner */}
              <div className={`flex items-center gap-3 p-3 rounded border ${isDangerous ? 'border-red-800/50 bg-red-950/30' : 'border-yellow-800/40 bg-yellow-950/20'}`}>
                <span className="text-3xl">{srcChar?.icon}</span>
                <div>
                  <p className={`font-gothic font-bold text-base ${isDangerous ? 'text-red-300' : 'text-yellow-300'}`}>
                    {srcChar?.name ?? action.characterId}
                  </p>
                  <p className="text-xs text-gothic-400">{sourcePlayer.name}</p>
                </div>
                <span className="ml-auto text-2xl">{action.icon}</span>
              </div>

              <div className={`p-3 rounded border text-sm leading-relaxed ${isDangerous ? 'border-red-900/40 bg-red-950/20 text-red-200' : 'border-dark-200 bg-dark-500/50 text-gothic-200'}`}>
                {action.confirmText ?? action.description}
              </div>

              {/* Target info */}
              {targetPlayer && action.result === 'kill-nominator' && (
                <div className="flex items-center gap-3 p-2 rounded border border-orange-800/40 bg-orange-950/20">
                  <span className="text-xl">{tgtChar?.icon}</span>
                  <div>
                    <p className="text-sm text-orange-300 font-gothic">{targetPlayer.name} <span className="text-orange-500">({tgtChar?.name})</span></p>
                    <p className="text-xs text-orange-600">Nominador — {tgtChar?.type === 'townsfolk' ? 'Es Aldeano ✓' : 'No es Aldeano — habilidad no aplica'}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={confirmAutoTrigger}
                  className={`flex-1 justify-center ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
                >
                  {action.result === 'kill-nominator' && `💀 Confirmar — ${targetPlayer?.name} muere`}
                  {action.result === 'kill-self' && `💀 Confirmar — ${sourcePlayer.name} muere`}
                  {action.result === 'evil-wins' && '😈 Confirmar — El Mal gana'}
                  {action.result === 'good-wins' && '⚔️ Confirmar — El Bien gana'}
                  {action.result === 'prompt' && '✅ Registrar en log'}
                  {(action.result === 'note' || action.result === 'select-target') && '✅ Anotado'}
                </button>
                <button onClick={() => setAutoTrigger(null)} className="btn-ghost">
                  No aplica
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
