import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Trash2, Save, Search, Check } from 'lucide-react';
import { ALL_CHARACTERS } from '../data/characters';
import { DIFFICULTY_LABELS } from '../data/scripts';
import { CharacterTypeBadge } from '../components/UI/CharacterTypeBadge';
import { useApp } from '../context/AppContext';
import type { Script, CharacterType } from '../types';

const CHAR_TYPES: CharacterType[] = ['townsfolk', 'outsider', 'minion', 'demon'];

export default function ScriptBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, addCustomScript, updateCustomScript } = useApp();
  const editId = (location.state as { editId?: string } | null)?.editId;

  const existingScript = editId ? state.customScripts.find(s => s.id === editId) : null;

  const [name, setName] = useState(existingScript?.name || '');
  const [description, setDescription] = useState(existingScript?.description || '');
  const [difficulty, setDifficulty] = useState<Script['difficulty']>(existingScript?.difficulty || 'intermediate');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(existingScript?.characters || []));
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<CharacterType | 'all' | 'custom'>('all');

  const allChars = [...ALL_CHARACTERS, ...state.customCharacters];

  const filtered = allChars.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.ability.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || (filterType === 'custom' ? !!c.isCustom : c.type === filterType);
    return matchSearch && matchType;
  });

  const selectedChars = allChars.filter(c => selectedIds.has(c.id));

  const toggleChar = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const counts = {
    townsfolk: selectedChars.filter(c => c.type === 'townsfolk').length,
    outsider: selectedChars.filter(c => c.type === 'outsider').length,
    minion: selectedChars.filter(c => c.type === 'minion').length,
    demon: selectedChars.filter(c => c.type === 'demon').length,
  };

  const handleSave = () => {
    if (!name.trim()) return alert('El script necesita un nombre.');
    if (selectedIds.size < 4) return alert('Selecciona al menos 4 personajes.');
    if (counts.demon === 0) return alert('El script necesita al menos 1 Demonio.');

    const script: Script = {
      id: existingScript?.id || `custom_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      difficulty,
      isOfficial: false,
      isCustom: true,
      characters: [...selectedIds],
    };

    if (existingScript) {
      updateCustomScript(script);
    } else {
      addCustomScript(script);
    }
    navigate('/scripts');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-8 h-8 text-blood-500" />
        <h1 className="page-title">{existingScript ? 'Editar Script' : 'Crear Script'}</h1>
      </div>
      <p className="text-gothic-300 mb-8">
        Selecciona los personajes para tu script personalizado.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h2 className="section-title mb-4">Configuración</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gothic-300 font-gothic mb-1 block">Nombre del Script *</label>
                <input
                  className="input-gothic"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Mi script..."
                />
              </div>
              <div>
                <label className="text-sm text-gothic-300 font-gothic mb-1 block">Descripción</label>
                <textarea
                  className="textarea-gothic"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe tu script..."
                />
              </div>
              <div>
                <label className="text-sm text-gothic-300 font-gothic mb-1 block">Dificultad</label>
                <select
                  className="select-gothic"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as Script['difficulty'])}
                >
                  {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card">
            <h2 className="section-title mb-3">Selección ({selectedIds.size})</h2>
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="badge-townsfolk">Aldeanos</span>
                <span className="text-gothic-200">{counts.townsfolk}</span>
              </div>
              <div className="flex justify-between">
                <span className="badge-outsider">Forasteros</span>
                <span className="text-gothic-200">{counts.outsider}</span>
              </div>
              <div className="flex justify-between">
                <span className="badge-minion">Esbirros</span>
                <span className="text-gothic-200">{counts.minion}</span>
              </div>
              <div className="flex justify-between">
                <span className="badge-demon">Demonios</span>
                <span className="text-gothic-200">{counts.demon}</span>
              </div>
            </div>
            {selectedChars.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {selectedChars.map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-xs">
                    <span>{c.icon || '👤'}</span>
                    <span className="text-gothic-200">{c.name}</span>
                    <button
                      onClick={() => toggleChar(c.id)}
                      className="ml-auto text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleSave} className="btn-gold w-full mt-4 justify-center">
              <Save className="w-4 h-4" />
              {existingScript ? 'Guardar Cambios' : 'Crear Script'}
            </button>
          </div>
        </div>

        {/* Right: Character selector */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gothic-400" />
                <input
                  className="input-gothic pl-9"
                  placeholder="Buscar personaje..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded text-xs font-gothic border transition-all ${filterType === 'all' ? 'bg-blood-700 border-blood-500 text-gothic-100' : 'bg-dark-400 border-dark-200 text-gothic-300 hover:border-dark-100'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType('custom')}
                  className={`px-3 py-1.5 rounded text-xs font-gothic border transition-all ${filterType === 'custom' ? 'bg-green-800 border-green-600 text-green-100' : 'bg-dark-400 border-dark-200 text-green-400 hover:border-green-700'}`}
                >
                  ✨ Custom
                </button>
                {CHAR_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded text-xs font-gothic border transition-all badge-${t} ${filterType === t ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                  >
                    {t === 'townsfolk' ? 'Aldeanos' : t === 'outsider' ? 'Forasteros' : t === 'minion' ? 'Esbirros' : 'Demonios'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
              {filtered.map(char => {
                const isSelected = selectedIds.has(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => toggleChar(char.id)}
                    className={`text-left p-3 rounded-lg border transition-all duration-150 ${
                      isSelected
                        ? 'bg-blood-900/40 border-blood-500'
                        : 'bg-dark-400 border-dark-200 hover:border-dark-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{char.icon || '👤'}</span>
                      <span className="font-gothic text-sm text-gothic-100 flex-1">{char.name}</span>
                      {char.isCustom && <span className="text-xs text-green-400 border border-green-700/50 bg-green-950/30 rounded px-1 py-0.5 font-gothic">✨</span>}
                      {isSelected && <Check className="w-4 h-4 text-blood-400 flex-shrink-0" />}
                    </div>
                    <CharacterTypeBadge type={char.type} />
                    <p className="text-gothic-400 text-xs mt-1 leading-relaxed line-clamp-2">{char.ability}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
