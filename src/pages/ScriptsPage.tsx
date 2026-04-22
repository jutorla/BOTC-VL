import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scroll, Star, Play, Plus, BookOpen, Users, Download, Upload, Trash2, Edit } from 'lucide-react';
import { OFFICIAL_SCRIPTS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data/scripts';
import { ALL_CHARACTERS } from '../data/characters';
import { CharacterTypeBadge } from '../components/UI/CharacterTypeBadge';
import { useApp } from '../context/AppContext';
import type { Script, Character } from '../types';

function ScriptCard({
  script,
  isCustom,
  onDelete,
  onEdit,
  onPlay,
}: {
  script: Script;
  isCustom?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onPlay: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { state } = useApp();
  const allChars = [...ALL_CHARACTERS, ...state.customCharacters];
  const chars = script.characters
    .map(id => allChars.find(c => c.id === id))
    .filter(Boolean) as Character[];

  const counts = {
    townsfolk: chars.filter(c => c.type === 'townsfolk').length,
    outsider: chars.filter(c => c.type === 'outsider').length,
    minion: chars.filter(c => c.type === 'minion').length,
    demon: chars.filter(c => c.type === 'demon').length,
  };

  return (
    <div className="card border-dark-200 hover:border-blood-700 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-gothic text-lg text-gold-400">{script.name}</h3>
            {script.difficulty && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-gothic ${DIFFICULTY_COLORS[script.difficulty]}`}
              >
                {DIFFICULTY_LABELS[script.difficulty]}
              </span>
            )}
            {isCustom && (
              <span className="text-xs px-2 py-0.5 rounded-full border text-purple-300 bg-purple-900/30 border-purple-700/50 font-gothic">
                Personalizado
              </span>
            )}
          </div>
          {script.author && (
            <p className="text-gothic-400 text-xs mb-2">por {script.author}</p>
          )}
          <p className="text-gothic-300 text-sm leading-relaxed mb-3">
            {script.description}
          </p>

          {/* Character counts */}
          <div className="flex gap-3 flex-wrap mb-3">
            <span className="badge-townsfolk">{counts.townsfolk} Aldeanos</span>
            <span className="badge-outsider">{counts.outsider} Forasteros</span>
            <span className="badge-minion">{counts.minion} Esbirros</span>
            <span className="badge-demon">{counts.demon} Demonios</span>
          </div>

          {/* Expand characters */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gothic-400 hover:text-gothic-200 transition-colors flex items-center gap-1"
          >
            <Users className="w-3 h-3" />
            {expanded ? "Ocultar personajes" : `Ver ${chars.length} personajes`}
          </button>

          {expanded && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {chars.map((char) => (
                <div key={char.id} className="flex items-center gap-2 text-xs">
                  <span className="text-base">{char.icon || "👤"}</span>
                  <span className="text-gothic-200 font-gothic">
                    {char.name}
                  </span>
                  <CharacterTypeBadge type={char.type} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={onPlay} className="btn-primary text-sm">
            <Play className="w-4 h-4" />
            <span className="hidden sm:block">Jugar</span>
          </button>
          {isCustom && onEdit && (
            <button onClick={onEdit} className="btn-secondary text-sm">
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>
          )}
          {isCustom && (
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify([script], null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${script.name.replace(/\s+/g, "-").toLowerCase()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="btn-secondary text-sm"
              title="Exportar este script"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          )}
          {isCustom && onDelete && (
            <button onClick={onDelete} className="btn-danger text-sm">
              <Trash2 className="w-4 h-4" />
              <span>Borrar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScriptsPage() {
  const navigate = useNavigate();
  const { state, deleteCustomScript, addCustomScript } = useApp();
  const [tab, setTab] = useState<'official' | 'custom'>('official');

  const exportScripts = () => {
    const data = JSON.stringify(state.customScripts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `botc-scripts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importScripts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const scripts: Script[] = JSON.parse(text);
        if (!Array.isArray(scripts)) throw new Error('Formato incorrecto');
        let imported = 0;
        for (const s of scripts) {
          if (s.id && s.name && Array.isArray(s.characters)) {
            const exists = state.customScripts.some(cs => cs.id === s.id);
            if (!exists) { addCustomScript({ ...s, isCustom: true, isOfficial: false }); imported++; }
          }
        }
        alert(`✅ Importados ${imported} script(s) nuevos.`);
      } catch {
        alert('❌ Error al importar: el archivo no es válido.');
      }
    };
    input.click();
  };

  const handlePlay = (script: Script) => {
    navigate('/game', { state: { scriptId: script.id } });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Scroll className="w-8 h-8 text-blood-500" />
        <h1 className="page-title">Scripts</h1>
      </div>
      <p className="text-gothic-300 mb-8">
        Elige un script oficial para tu partida o gestiona tus scripts personalizados.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-dark-200 pb-0">
        <button
          onClick={() => setTab('official')}
          className={`px-4 py-2 font-gothic text-sm border-b-2 transition-colors -mb-px ${
            tab === 'official'
              ? 'border-blood-500 text-gold-400'
              : 'border-transparent text-gothic-400 hover:text-gothic-200'
          }`}
        >
          <Star className="w-4 h-4 inline mr-1" />
          Oficiales ({OFFICIAL_SCRIPTS.length})
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`px-4 py-2 font-gothic text-sm border-b-2 transition-colors -mb-px ${
            tab === 'custom'
              ? 'border-blood-500 text-gold-400'
              : 'border-transparent text-gothic-400 hover:text-gothic-200'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-1" />
          Personalizados ({state.customScripts.length})
        </button>
      </div>

      {tab === 'official' && (
        <div className="space-y-4">
          {OFFICIAL_SCRIPTS.map(script => (
            <ScriptCard
              key={script.id}
              script={script}
              onPlay={() => handlePlay(script)}
            />
          ))}
        </div>
      )}

      {tab === 'custom' && (
        <div className="space-y-4">
          {/* Export/Import toolbar */}
          <div className="flex gap-2 justify-end flex-wrap">
            <button
              onClick={importScripts}
              className="btn-secondary text-xs"
              title="Importar scripts desde un archivo JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar JSON
            </button>
            {state.customScripts.length > 0 && (
              <button
                onClick={exportScripts}
                className="btn-secondary text-xs"
                title="Exportar todos tus scripts a un archivo JSON"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar todos
              </button>
            )}
          </div>
          {state.customScripts.length === 0 ? (
            <div className="card text-center py-12">
              <BookOpen className="w-12 h-12 text-gothic-500 mx-auto mb-3" />
              <p className="text-gothic-400 mb-4">No tienes scripts personalizados todavía.</p>
              <button onClick={() => navigate('/script-builder')} className="btn-primary mx-auto">
                <Plus className="w-4 h-4" />
                Crear mi primer script
              </button>
            </div>
          ) : (
            state.customScripts.map(script => (
              <ScriptCard
                key={script.id}
                script={script}
                isCustom
                onPlay={() => handlePlay(script)}
                onEdit={() => navigate('/script-builder', { state: { editId: script.id } })}
                onDelete={() => {
                  if (confirm(`¿Eliminar el script "${script.name}"?`)) {
                    deleteCustomScript(script.id);
                  }
                }}
              />
            ))
          )}
          <div className="flex justify-center pt-4">
            <button onClick={() => navigate('/script-builder')} className="btn-primary">
              <Plus className="w-4 h-4" />
              Nuevo Script
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
