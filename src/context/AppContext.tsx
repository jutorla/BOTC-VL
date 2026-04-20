import React, { createContext, useContext } from 'react';
import type { AppState, Script, Character, Game } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  state: AppState;
  addCustomScript: (script: Script) => void;
  updateCustomScript: (script: Script) => void;
  deleteCustomScript: (id: string) => void;
  addCustomCharacter: (char: Character) => void;
  updateCustomCharacter: (char: Character) => void;
  deleteCustomCharacter: (id: string) => void;
  saveGame: (game: Game) => void;
  deleteGame: (id: string) => void;
  setActiveGame: (id: string | undefined) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_STATE: AppState = {
  customScripts: [],
  customCharacters: [],
  savedGames: [],
  activeGameId: undefined,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<AppState>('botc-app-state', INITIAL_STATE);

  const addCustomScript = (script: Script) => {
    setState(prev => ({ ...prev, customScripts: [...prev.customScripts, script] }));
  };

  const updateCustomScript = (script: Script) => {
    setState(prev => ({
      ...prev,
      customScripts: prev.customScripts.map(s => s.id === script.id ? script : s),
    }));
  };

  const deleteCustomScript = (id: string) => {
    setState(prev => ({ ...prev, customScripts: prev.customScripts.filter(s => s.id !== id) }));
  };

  const addCustomCharacter = (char: Character) => {
    setState(prev => ({ ...prev, customCharacters: [...prev.customCharacters, char] }));
  };

  const updateCustomCharacter = (char: Character) => {
    setState(prev => ({
      ...prev,
      customCharacters: prev.customCharacters.map(c => c.id === char.id ? char : c),
    }));
  };

  const deleteCustomCharacter = (id: string) => {
    setState(prev => ({ ...prev, customCharacters: prev.customCharacters.filter(c => c.id !== id) }));
  };

  const saveGame = (game: Game) => {
    setState(prev => {
      const exists = prev.savedGames.some(g => g.id === game.id);
      return {
        ...prev,
        savedGames: exists
          ? prev.savedGames.map(g => g.id === game.id ? game : g)
          : [...prev.savedGames, game],
        activeGameId: game.id,
      };
    });
  };

  const deleteGame = (id: string) => {
    setState(prev => ({
      ...prev,
      savedGames: prev.savedGames.filter(g => g.id !== id),
      activeGameId: prev.activeGameId === id ? undefined : prev.activeGameId,
    }));
  };

  const setActiveGame = (id: string | undefined) => {
    setState(prev => ({ ...prev, activeGameId: id }));
  };

  return (
    <AppContext.Provider value={{
      state, addCustomScript, updateCustomScript, deleteCustomScript,
      addCustomCharacter, updateCustomCharacter, deleteCustomCharacter,
      saveGame, deleteGame, setActiveGame,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
