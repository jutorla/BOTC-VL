import { Link, useLocation } from 'react-router-dom';
import { Scroll, BookOpen, User, Swords, Home, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/scripts', label: 'Scripts', icon: Scroll },
  { to: '/script-builder', label: 'Crear Script', icon: BookOpen },
  { to: '/character-creator', label: 'Personajes', icon: User },
  { to: '/game', label: 'Dirigir Partida', icon: Swords },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { state } = useApp();
  const activeGame = state.savedGames.find(g => g.id === state.activeGameId);

  return (
    <nav className="sticky top-0 z-40 bg-dark-600/95 backdrop-blur border-b border-dark-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Moon className="w-7 h-7 text-blood-500 group-hover:text-blood-400 transition-colors" />
            <span className="font-gothic text-xl text-gold-400 group-hover:text-gold-300 transition-colors hidden sm:block">
              Valentia on the Ludicatower
            </span>
            <span className="font-gothic text-xl text-gold-400 group-hover:text-gold-300 transition-colors sm:hidden">
              BotC
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded text-sm font-gothic transition-all duration-200 ${
                    isActive
                      ? 'text-gold-400 bg-blood-900/30'
                      : 'text-gothic-300 hover:text-gothic-100 hover:bg-dark-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:block">{label}</span>
                  {to === '/game' && activeGame && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-blood-500 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
