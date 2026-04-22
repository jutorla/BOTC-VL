import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppState, Script, Character, Game } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { loadSharedData, saveSharedData } from '../lib/jsonbin';
import type { SharedData } from '../lib/jsonbin';

interface LocalData {
  savedGames: Game[];
  activeGameId: string | undefined;
}

interface AppContextType {
  state: AppState;
  loading: boolean;
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

const INITIAL_LOCAL: LocalData = {
  savedGames: [],
  activeGameId: undefined,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [shared, setShared] = useState<SharedData>({ customScripts: [], customCharacters: [] });
  const [loading, setLoading] = useState(true);
  const [local, setLocal] = useLocalStorage<LocalData>('botc-local-state', INITIAL_LOCAL);

  useEffect(() => {
    loadSharedData()
      .then(data => setShared(data))
      .catch(err => console.error('Could not load shared data:', err))
      .finally(() => setLoading(false));
  }, []);

  const updateShared = useCallback((updater: (prev: SharedData) => SharedData) => {
    setShared(prev => {
      const next = updater(prev);
      saveSharedData(next).catch(err => console.error('Could not save shared data:', err));
      return next;
    });
  }, []);

  const addCustomScript = (script: Script) =>
    updateShared(prev => ({ ...prev, customScripts: [...prev.customScripts, script] }));

  const updateCustomScript = (script: Script) =>
    updateShared(prev => ({
      ...prev,
      customScripts: prev.customScripts.map(s => s.id === script.id ? script : s),
    }));

  const deleteCustomScript = (id: string) =>
    updateShared(prev => ({ ...prev, customScripts: prev.customScripts.filter(s => s.id !== id) }));

  const addCustomCharacter = (char: Character) =>
    updateShared(prev => ({ ...prev, customCharacters: [...prev.customCharacters, char] }));

  const updateCustomCharacter = (char: Character) =>
    updateShared(prev => ({
      ...prev,
      customCharacters: prev.customCharacters.map(c => c.id === char.id ? char : c),
    }));

  const deleteCustomCharacter = (id: string) =>
    updateShared(prev => ({ ...prev, customCharacters: prev.customCharacters.filter(c => c.id !== id) }));

  const saveGame = (game: Game) => {
    setLocal(prev => {
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
    setLocal(prev => ({
      ...prev,
      savedGames: prev.savedGames.filter(g => g.id !== id),
      activeGameId: prev.activeGameId === id ? undefined : prev.activeGameId,
    }));
  };

  const setActiveGame = (id: string | undefined) => {
    setLocal(prev => ({ ...prev, activeGameId: id }));
  };

  const state: AppState = {
    customScripts: shared.customScripts,
    customCharacters: shared.customCharacters,
    savedGames: local.savedGames,
    activeGameId: local.activeGameId,
  };

  return (
    <AppContext.Provider value={{
      state, loading,
      addCustomScript, updateCustomScript, deleteCustomScript,
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
