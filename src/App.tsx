import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import ScriptsPage from './pages/ScriptsPage';
import ScriptBuilderPage from './pages/ScriptBuilderPage';
import CharacterCreatorPage from './pages/CharacterCreatorPage';
import GamePage from './pages/GamePage';
import RulesPage from './pages/RulesPage';

function AppRoutes() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #050a1a 0%, #0a0d20 100%)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🕯️</div>
          <p className="font-gothic text-blue-400 text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scripts" element={<ScriptsPage />} />
          <Route path="/script-builder" element={<ScriptBuilderPage />} />
          <Route path="/character-creator" element={<CharacterCreatorPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/rules" element={<RulesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
