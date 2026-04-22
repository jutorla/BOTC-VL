import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { OFFICIAL_SCRIPTS } from '../data/scripts';
import { ALL_CHARACTERS, loricCharacters } from '../data/characters';
import type { Script } from '../types';
import GameSetupPhase from '../components/Game/GameSetupPhase';
import GameNightPhase from '../components/Game/GameNightPhase';
import GameDayPhase from '../components/Game/GameDayPhase';
import GameEndScreen from '../components/Game/GameEndScreen';
import GameSavedList from '../components/Game/GameSavedList';
import { Swords } from 'lucide-react';

export default function GamePage() {
  const location = useLocation();
  const { state, saveGame, deleteGame, setActiveGame } = useApp();

  const locationState = location.state as { scriptId?: string } | null;
  const allScripts: Script[] = [...OFFICIAL_SCRIPTS, ...state.customScripts];
  const allChars = [...ALL_CHARACTERS, ...loricCharacters, ...state.customCharacters];

  const activeGame = state.savedGames.find(g => g.id === state.activeGameId);

  // If there's an active game, show it
  if (activeGame && activeGame.phase !== 'ended') {
    const activeScript = allScripts.find(s => s.id === activeGame.scriptId);
    const activeScriptChars = activeScript
      ? activeScript.characters.map(id => allChars.find(c => c.id === id)).filter(Boolean) as import('../types').Character[]
      : [];

    if (activeGame.phase === 'night') {
      return (
        <GameNightPhase
          game={activeGame}
          allChars={allChars}
          scriptChars={activeScriptChars}
          onUpdate={saveGame}
        />
      );
    }
    if (activeGame.phase === 'day') {
      return (
        <GameDayPhase
          game={activeGame}
          allChars={allChars}
          onUpdate={saveGame}
        />
      );
    }
  }

  if (activeGame && activeGame.phase === 'ended') {
    return (
      <GameEndScreen
        game={activeGame}
        allChars={allChars}
        onNewGame={() => { setActiveGame(undefined); }}
        onDelete={() => { deleteGame(activeGame.id); setActiveGame(undefined); }}
      />
    );
  }

  // Show setup or saved games
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Swords className="w-8 h-8 text-blood-500" />
        <h1 className="page-title">Director de Partida</h1>
      </div>
      <p className="text-gothic-300 mb-8">
        Configura y dirige una partida de Blood on the Clocktower de principio a fin.
      </p>

      {/* Saved games */}
      {state.savedGames.length > 0 && (
        <GameSavedList
          games={state.savedGames}
          allChars={allChars}
          onResume={id => setActiveGame(id)}
          onDelete={id => {
            if (confirm('¿Eliminar esta partida guardada?')) deleteGame(id);
          }}
        />
      )}

      {/* Setup new game */}
      <GameSetupPhase
        scripts={allScripts}
        allChars={allChars}
        extraLorics={state.customCharacters.filter(c => c.type === 'loric')}
        initialScriptId={locationState?.scriptId}
        onStart={(game) => {
          saveGame(game);
        }}
      />
    </div>
  );
}
