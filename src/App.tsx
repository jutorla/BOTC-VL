import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import ScriptsPage from './pages/ScriptsPage';
import ScriptBuilderPage from './pages/ScriptBuilderPage';
import CharacterCreatorPage from './pages/CharacterCreatorPage';
import GamePage from './pages/GamePage';

function AppRoutes() {
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
