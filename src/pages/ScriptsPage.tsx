import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scroll, Star, Play, Plus, BookOpen, Users, Download, Upload, Trash2, Edit, X } from 'lucide-react';
import { OFFICIAL_SCRIPTS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data/scripts';
import { ALL_CHARACTERS } from '../data/characters';
import { CharacterTypeBadge, CharacterIcon } from '../components/UI/CharacterTypeBadge';
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
                  <CharacterIcon character={char} size="md" />
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

/**
 * Genera un ID único para scripts importados sin ID fijo.
 * Usa los caracteres como firma para evitar duplicados.
 */
function generateImportId(characters: string[]): string {
  const hash = characters.sort().join(',');
  let h = 0;
  for (let i = 0; i < hash.length; i++) {
    h = ((h << 5) - h + hash.charCodeAt(i)) | 0;
  }
  return `imported_${Math.abs(h).toString(36)}_${Date.now().toString(36)}`;
}

/**
 * Interfaz para el objeto _meta del formato BOTC estándar.
 */
interface BotcMeta {
  id: string;
  author?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Convierte un array de character IDs (formato BOTC standar) en un script.
 * Ejemplo: ["chef","bountyhunter","balloonist"]
 * O con meta: [{"id":"_meta","author":"...","name":"..."},"chef","bountyhunter",...]
 */
function botcStdArrayToScript(characters: string[], meta?: BotcMeta): Script {
  const allChars = [...ALL_CHARACTERS];
  const validChars = characters.filter(id => allChars.find(c => c.id === id));
  
  // Determinar dificultad basada en cantidad de personajes
  let difficulty: Script['difficulty'] = 'beginner';
  if (validChars.length >= 10) difficulty = 'expert';
  else if (validChars.length >= 7) difficulty = 'advanced';
  else if (validChars.length >= 5) difficulty = 'intermediate';

  return {
    id: generateImportId(characters),
    name: meta?.name || `Script importado (${validChars.length} personajes)`,
    description: meta?.author 
      ? `Generado desde formato standar BOTC por ${meta.author}` 
      : `Generado desde formato standar BOTC: ${validChars.map(id => allChars.find(c => c.id === id)?.name || id).join(', ')}`,
    author: meta?.author || '',
    characters,
    isOfficial: false,
    isCustom: true,
    difficulty,
  };
}

/**
 * Convierte un objeto JSON que es un script completo.
 */
function jsonObjToScript(obj: unknown): Script | null {
  if (typeof obj !== 'object' || obj === null) return null;
  const s = obj as Record<string, unknown>;
  if (typeof s.id !== 'string' || typeof s.name !== 'string' || !Array.isArray(s.characters)) return null;
  return {
    id: s.id,
    name: s.name,
    description: (s.description as string) || '',
    author: (s.author as string) || '',
    edition: (s.edition as string) || undefined,
    characters: s.characters as string[],
    isOfficial: false,
    isCustom: true,
    difficulty: (s.difficulty as Script['difficulty']) || undefined,
  };
}

export default function ScriptsPage() {
  const navigate = useNavigate();
  const { state, deleteCustomScript, addCustomScript } = useApp();
  const [tab, setTab] = useState<'official' | 'custom'>('official');
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [importName, setImportName] = useState('');
  const [importAuthor, setImportAuthor] = useState('');
  const [importDifficulty, setImportDifficulty] = useState<Script['difficulty']>('beginner');
  const [showImportConfirmDialog, setShowImportConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await processImportedData(parsed);
    } catch {
      alert('❌ Error al leer el archivo JSON.');
    }
    // Reset input para poder importar el mismo archivo de nuevo
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImportedData = async (data: unknown): Promise<void> => {
    const scriptsToImport: Script[] = [];

    // Verificar si es un array de formato BOTC estándar:
    // - Empieza con objeto {id: "_meta", ...} o {name: ..., author: ...}
    // - Seguido de strings (character IDs)
    const isBotcStandardFormat = (arr: unknown[]): boolean => {
      if (arr.length === 0) return false;
      const first = arr[0];
      if (typeof first !== 'object' || first === null) return false;
      const meta = first as Record<string, unknown>;
      // Debe tener id="_meta" O tener name/author
      const isMeta = meta.id === '_meta' || meta.name !== undefined || meta.author !== undefined;
      if (!isMeta) return false;
      // El resto debe ser strings (character IDs)
      const rest = arr.slice(1);
      return rest.length > 0 && rest.every((item): item is string => typeof item === 'string');
    };

    // Función auxiliar para procesar un valor individual
    const processValue = (val: unknown) => {
      if (Array.isArray(val)) {
        // Formato BOTC estándar con meta: [{"id":"_meta",...},"chef","bountyhunter"]
        if (isBotcStandardFormat(val)) {
          const first = val[0] as BotcMeta;
          const charIds = val.slice(1).filter((item): item is string => typeof item === 'string');
          if (charIds.length > 0) {
            const script = botcStdArrayToScript(charIds, first);
            scriptsToImport.push(script);
          }
        } else if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          // Array anidado → procesar cada elemento
          for (const entry of val) {
            processValue(entry);
          }
        } else if (val.length > 0 && typeof val[0] === 'string') {
          // Es un array de strings → formato BOTC standar: character IDs directos
          const script = botcStdArrayToScript(val as unknown as string[]);
          scriptsToImport.push(script);
        }
      } else if (typeof val === 'object' && val !== null) {
        // Objeto → intentar como script
        const s = jsonObjToScript(val);
        if (s) scriptsToImport.push(s);
      }
    };

    if (Array.isArray(data)) {
      // Si el array principal es formato BOTC estándar, procesarlo como un solo script
      if (isBotcStandardFormat(data)) {
        const first = data[0] as BotcMeta;
        const charIds = data.slice(1).filter((item): item is string => typeof item === 'string');
        if (charIds.length > 0) {
          const script = botcStdArrayToScript(charIds, first);
          scriptsToImport.push(script);
        }
      } else {
        // Procesar cada elemento individualmente
        for (const item of data) {
          processValue(item);
        }
      }
    } else if (typeof data === 'object' && data !== null) {
      // Un solo objeto script
      const s = jsonObjToScript(data);
      if (s) scriptsToImport.push(s);
    }

    if (scriptsToImport.length === 0) {
      alert('❌ No se encontraron scripts válidos en los datos importados.');
      return;
    }

    // Importar solo los que no existen
    let imported = 0;
    for (const s of scriptsToImport) {
      const exists = state.customScripts.some(cs => cs.id === s.id);
      if (!exists) {
        addCustomScript(s);
        imported++;
      }
    }
    alert(`✅ Importados ${imported} script(s) nuevo(s).`);
  };

  const handlePasteImport = () => {
    if (!pasteText.trim()) {
      alert('❌ Por favor, pega el JSON aquí primero.');
      return;
    }
    try {
      const parsed = JSON.parse(pasteText);
      
      // Verificar si es formato BOTC estándar: [meta, ...charIds]
      if (Array.isArray(parsed) && parsed.length > 1) {
        const first = parsed[0];
        if (typeof first === 'object' && first !== null) {
          const meta = first as BotcMeta;
          if (meta.id === '_meta' || meta.name !== undefined || meta.author !== undefined) {
            // Verificar que el resto son strings
            const rest = parsed.slice(1);
            if (rest.every((item): item is string => typeof item === 'string')) {
              // Es formato BOTC estándar → mostrar diálogo de confirmación
              setImportName(meta.name || '');
              setImportAuthor(meta.author || '');
              setShowPasteDialog(false);
              setShowImportConfirmDialog(true);
              return;
            }
          }
        }
      }
      
      // No es formato BOTC estándar → importar directamente
      setShowPasteDialog(false);
      setPasteText('');
      processImportedData(parsed);
    } catch {
      alert('❌ El texto pegado no es un JSON válido.');
    }
  };

  const confirmBotcStandardImport = () => {
    if (!pasteText.trim()) return;

    // Recalcular personajes válidos basados en el pasteText actual
    let parsed: unknown;
    try {
      parsed = JSON.parse(pasteText);
    } catch {
      alert('❌ El texto pegado no es un JSON válido.');
      return;
    }

    if (!Array.isArray(parsed) || parsed.length < 2) {
      alert('❌ Formato JSON no válido.');
      return;
    }

    const first = parsed[0] as BotcMeta;
    const charIds = (parsed as unknown[]).slice(1).filter((item): item is string => typeof item === 'string');
      
      // Validar que los personajes existen
      const allChars = [...ALL_CHARACTERS];
      const validChars = charIds.filter(id => allChars.find(c => c.id === id));
      
      if (validChars.length === 0) {
        alert('❌ No se encontraron personajes válidos en el JSON.');
        setShowImportConfirmDialog(false);
        setPasteText('');
        return;
      }

      const script: Script = {
        id: generateImportId(charIds),
        name: importName || first?.name || `Script importado (${validChars.length} personajes)`,
        description: importAuthor
          ? `Script personalizado por ${importAuthor}`
          : first?.author 
            ? `Generado desde formato standar BOTC por ${first.author}` 
            : `Generado desde formato standar BOTC: ${validChars.map(id => allChars.find(c => c.id === id)?.name || id).join(', ')}`,
        author: importAuthor || first?.author || '',
        characters: charIds,
        isOfficial: false,
        isCustom: true,
        difficulty: importDifficulty,
      };

      addCustomScript(script);
      setShowImportConfirmDialog(false);
      setImportName('');
      setImportAuthor('');
      setImportDifficulty('beginner');
      setPasteText('');
      alert('✅ Script importado correctamente.');
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
              onClick={() => setShowPasteDialog(true)}
              className="btn-secondary text-xs"
              title="Pegar JSON directamente"
            >
              <Upload className="w-3.5 h-3.5" />
              Pegar JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-xs"
              title="Importar scripts desde un archivo JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar archivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileImport}
            />
            {state.customScripts.length > 0 && (
              <button
                onClick={() => {
                  const data = JSON.stringify(state.customScripts, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `botc-scripts-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn-secondary text-xs"
                title="Exportar todos tus scripts a un archivo JSON"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar todos
              </button>
            )}
          </div>

          {/* Paste JSON Dialog */}
          {showPasteDialog && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-dark-800 border border-dark-600 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
                <div className="flex items-center justify-between p-4 border-b border-dark-600">
                  <h3 className="font-gothic text-gold-400">Pegar JSON</h3>
                  <button onClick={() => { setShowPasteDialog(false); setPasteText(''); }} className="text-gothic-400 hover:text-gothic-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-gothic-300 text-xs mb-3">
                    Pega tu JSON aquí. Compatible con:
                  </p>
                  <ul className="text-gothic-400 text-xs mb-3 space-y-1">
                    <li>• Array de scripts: <code className="text-gold-300">[{`{id: "...", name: "...", characters: [...]}`}]</code></li>
                    <li>• Array de character IDs (formato BOTC standar): <code className="text-gold-300">["chef","bountyhunter","balloonist"]</code></li>
                    <li>• Formato BOTC estándar con meta: <code className="text-gold-300">[{`{"id":"_meta","author":"","name":""}`},"chef","bountyhunter"]</code></li>
                    <li>• Array de arrays de character IDs: <code className="text-gold-300">[["chef","bountyhunter"], ["balloonist","villageidiot"]]</code></li>
                  </ul>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder='Pega aquí tu JSON, por ejemplo: [{"id":"_meta","author":"","name":""},"chef","bountyhunter","balloonist"]'
                    className="w-full h-40 bg-dark-900 border border-dark-600 rounded p-3 text-gothic-200 text-sm font-mono resize-none focus:border-blood-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 p-4 border-t border-dark-600">
                  <button
                    onClick={() => { setShowPasteDialog(false); setPasteText(''); }}
                    className="btn-secondary text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePasteImport}
                    className="btn-primary text-sm"
                  >
                    Importar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Confirmation Dialog (para formato BOTC estándar con nombre/autor) */}
          {showImportConfirmDialog && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-dark-800 border border-dark-600 rounded-lg max-w-md w-full">
                <div className="flex items-center justify-between p-4 border-b border-dark-600">
                  <h3 className="font-gothic text-gold-400">Confirmar Importación</h3>
                  <button onClick={() => { setShowImportConfirmDialog(false); setImportName(''); setImportAuthor(''); setImportDifficulty('beginner'); setPasteText(''); }} className="text-gothic-400 hover:text-gothic-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-gothic-300 text-xs mb-1 block">Nombre del script:</label>
                    <input
                      type="text"
                      value={importName}
                      onChange={(e) => setImportName(e.target.value)}
                      placeholder="Nombre personalizado (opcional)"
                      className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-gothic-200 text-sm focus:border-blood-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gothic-300 text-xs mb-1 block">Autor:</label>
                    <input
                      type="text"
                      value={importAuthor}
                      onChange={(e) => setImportAuthor(e.target.value)}
                      placeholder="Autor personalizado (opcional)"
                      className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-gothic-200 text-sm focus:border-blood-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gothic-300 text-xs mb-1 block">Dificultad:</label>
                    <select
                      value={importDifficulty}
                      onChange={(e) => setImportDifficulty(e.target.value as Script['difficulty'])}
                      className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-gothic-200 text-sm focus:border-blood-500 focus:outline-none"
                    >
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                      <option value="expert">Experto</option>
                    </select>
                  </div>
                  {(() => {
                    try {
                      const parsed = JSON.parse(pasteText);
                      if (Array.isArray(parsed) && parsed.length > 1) {
                        const rest = parsed.slice(1).filter((item): item is string => typeof item === 'string');
                        return rest.length > 0 ? `${rest.length} personajes detectados` : 'JSON pegado';
                      }
                      return 'JSON pegado';
                    } catch {
                      return 'JSON pegado';
                    }
                  })()}
                </div>
                <div className="flex justify-end gap-2 p-4 border-t border-dark-600">
                  <button
                    onClick={() => { setShowImportConfirmDialog(false); setImportName(''); setImportAuthor(''); setImportDifficulty('beginner'); setPasteText(''); }}
                    className="btn-secondary text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmBotcStandardImport}
                    className="btn-primary text-sm"
                  >
                    Importar
                  </button>
                </div>
              </div>
            </div>
          )}

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