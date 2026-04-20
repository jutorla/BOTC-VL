import { Link } from 'react-router-dom';
import { Scroll, BookOpen, User, Swords, Moon, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

const features = [
  {
    to: '/scripts',
    icon: Scroll,
    title: 'Scripts',
    description: 'Explora los 3 scripts oficiales o accede a tus creaciones personalizadas.',
    color: 'border-blue-700/50 hover:border-blue-500',
    iconColor: 'text-blue-400',
  },
  {
    to: '/script-builder',
    icon: BookOpen,
    title: 'Crear Script',
    description: 'Diseña tu propio script combinando personajes de las ediciones oficiales.',
    color: 'border-purple-700/50 hover:border-purple-500',
    iconColor: 'text-purple-400',
  },
  {
    to: '/character-creator',
    icon: User,
    title: 'Crear Personaje',
    description: 'Diseña personajes únicos con habilidades propias para tus partidas.',
    color: 'border-green-700/50 hover:border-green-500',
    iconColor: 'text-green-400',
  },
  {
    to: '/game',
    icon: Swords,
    title: 'Dirigir Partida',
    description: 'Herramienta completa para dirigir una partida de principio a fin.',
    color: 'border-blood-600/50 hover:border-blood-500',
    iconColor: 'text-blood-400',
    highlight: true,
  },
];

export default function HomePage() {
  const { state } = useApp();
  const activeGame = state.savedGames.find(g => g.id === state.activeGameId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <Moon className="w-16 h-16 text-blood-500" />
        </div>
        <h1 className="page-title text-5xl mb-4">Blood on the Clocktower</h1>
        <p className="text-gothic-300 text-xl font-body italic max-w-2xl mx-auto leading-relaxed">
          "En Ravenswood Bluff, el Demonio acecha entre vosotros. Solo la astucia del pueblo puede salvar el alba."
        </p>
        <div className="flex justify-center mt-4">
          <span className="text-gold-600 text-2xl select-none">✦ ✦ ✦</span>
        </div>
      </div>

      {/* Active game alert */}
      {activeGame && (
        <div className="mb-8 p-4 bg-blood-900/30 border border-blood-600 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-blood-500 rounded-full animate-pulse" />
            <div>
              <p className="font-gothic text-gold-400 text-sm">Partida activa</p>
              <p className="text-gothic-200 text-sm">
                {activeGame.scriptName} · Ronda {activeGame.round} ·{' '}
                {activeGame.players.filter(p => p.isAlive).length} jugadores vivos
              </p>
            </div>
          </div>
          <Link to="/game" className="btn-primary text-sm">
            <Swords className="w-4 h-4" />
            Continuar
          </Link>
        </div>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {features.map(({ to, icon: Icon, title, description, color, iconColor, highlight }) => (
          <Link
            key={to}
            to={to}
            className={`card border-2 ${color} transition-all duration-300 hover:shadow-xl group ${
              highlight ? 'glow-blood' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-dark-400 border border-dark-200 ${highlight ? 'group-hover:border-blood-600' : ''}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-gothic text-lg text-gothic-100 mb-1 group-hover:text-gold-400 transition-colors">
                  {title}
                  {highlight && <span className="ml-2 text-xs text-blood-400 font-gothic">(Principal)</span>}
                </h3>
                <p className="text-gothic-300 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      {(state.customScripts.length > 0 || state.customCharacters.length > 0 || state.savedGames.length > 0) && (
        <div className="card border-gold-600/30">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-gold-400" />
            <h2 className="section-title mb-0">Tu Colección</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-gothic text-3xl text-blood-400">{state.customScripts.length}</p>
              <p className="text-gothic-400 text-sm">Scripts propios</p>
            </div>
            <div>
              <p className="font-gothic text-3xl text-blood-400">{state.customCharacters.length}</p>
              <p className="text-gothic-400 text-sm">Personajes creados</p>
            </div>
            <div>
              <p className="font-gothic text-3xl text-blood-400">{state.savedGames.length}</p>
              <p className="text-gothic-400 text-sm">Partidas guardadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-gothic-500 text-xs mt-12 font-body">
        Herramienta de ayuda al Narrador · Blood on the Clocktower es un juego de Pandemonium Institute
      </p>
    </div>
  );
}
