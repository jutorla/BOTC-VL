import { useState } from 'react';
import { User, Plus, Trash2, Save, Edit, X, Download, Upload } from 'lucide-react';
import { CharacterTypeBadge, TYPE_LABELS } from '../components/UI/CharacterTypeBadge';
import { useApp } from '../context/AppContext';
import type { Character, CharacterType } from '../types';
import Modal from '../components/UI/Modal';

const CHAR_TYPES: CharacterType[] = ['townsfolk', 'outsider', 'minion', 'demon', 'traveller'];
const EMOJIS = ['👤','🧙','⚔️','🛡️','🔮','💀','👹','😈','🌙','☠️','🗡️','🔱','💎','🌟','🎭','🧟','👿','🐉','🦇','🌑','⚡','🔥','❄️','🌊','🌿','🎯','💜','🩸','🏰','⚰️'];

const EMPTY_CHAR: Omit<Character, 'id'> = {
  name: '',
  type: 'townsfolk',
  ability: '',
  icon: '👤',
  firstNight: 0,
  otherNight: 0,
  firstNightReminder: '',
  otherNightReminder: '',
  reminders: [],
  isCustom: true,
};

function nightOrderLabel(n: number): { text: string; color: string } {
  if (n === 0) return { text: 'No actúa esta noche', color: 'text-gothic-600' };
  if (n <= 2)  return { text: '⚡ Muy temprano — entre los primeros', color: 'text-purple-400' };
  if (n <= 5)  return { text: '🌙 Temprano (antes de la mayoría)', color: 'text-blue-400' };
  if (n <= 9)  return { text: '🕯️ A mitad del turno nocturno', color: 'text-blue-300' };
  if (n <= 14) return { text: '🔮 Tarde (después de la mayoría)', color: 'text-indigo-400' };
  return       { text: '💀 Muy tarde — de los últimos', color: 'text-red-400' };
}

// Reference anchors taken from official Trouble Brewing night order
function NightOrderReference() {
  const [open, setOpen] = useState(false);
  const firstRef = [
    { n: 2,  label: 'Envenenadora' },
    { n: 3,  label: 'Lavandera / Info aldeano' },
    { n: 5,  label: 'Investigadora / Esbirros' },
    { n: 8,  label: 'Adivino' },
    { n: 9,  label: 'Mayordomo' },
    { n: 11, label: 'Espía' },
  ];
  const otherRef = [
    { n: 2, label: "Envenenadora" },
    { n: 3, label: "Monje / Protectores" },
    { n: 4, label: "Demonio (mata)" },
    { n: 5, label: "Empático" },
    { n: 7, label: "Adivino" },
    { n: 11, label: "Mayordomo" },
  ];
  return (
    <div className="mt-3 border-t border-blue-900/30 pt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-xs text-blue-500 hover:text-blue-300 transition-colors flex items-center gap-1 font-gothic"
      >
        📖 {open ? 'Ocultar referencia' : 'Ver referencia de personajes oficiales'}
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-blue-500 font-gothic mb-1">Primera Noche</p>
            <div className="space-y-0.5">
              {firstRef.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-mono w-5 text-right text-blue-400 font-bold">{r.n}</span>
                  <span className="text-gothic-400">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-blue-500 font-gothic mb-1">Otras Noches</p>
            <div className="space-y-0.5">
              {otherRef.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-mono w-5 text-right text-blue-400 font-bold">{r.n}</span>
                  <span className="text-gothic-400">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CharacterForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Character;
  onSave: (char: Omit<Character, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Character, 'id'> & { id?: string }>(
    initial || EMPTY_CHAR
  );
  const [reminderInput, setReminderInput] = useState('');

  const addReminder = () => {
    if (!reminderInput.trim()) return;
    setForm(f => ({ ...f, reminders: [...(f.reminders || []), reminderInput.trim()] }));
    setReminderInput('');
  };

  const removeReminder = (i: number) => {
    setForm(f => ({ ...f, reminders: (f.reminders || []).filter((_, idx) => idx !== i) }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return alert('El personaje necesita un nombre.');
    if (!form.ability.trim()) return alert('El personaje necesita una habilidad.');
    onSave(form);
  };

  return (
    <div className="space-y-4">
      {/* Icon picker */}
      <div>
        <label className="text-sm text-gothic-300 font-gothic mb-2 block">Icono</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setForm(f => ({ ...f, icon: e }))}
              className={`text-lg p-1.5 rounded border transition-all ${form.icon === e ? 'border-blood-500 bg-blood-900/30' : 'border-dark-200 hover:border-dark-100 bg-dark-400'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gothic-300 font-gothic mb-1 block">Nombre *</label>
          <input
            className="input-gothic"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nombre del personaje..."
          />
        </div>
        <div>
          <label className="text-sm text-gothic-300 font-gothic mb-1 block">Tipo *</label>
          <select
            className="select-gothic"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as CharacterType }))}
          >
            {CHAR_TYPES.map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-gothic-300 font-gothic mb-1 block">Habilidad *</label>
        <textarea
          className="textarea-gothic"
          rows={3}
          value={form.ability}
          onChange={e => setForm(f => ({ ...f, ability: e.target.value }))}
          placeholder="Describe la habilidad del personaje..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gothic-300 font-gothic mb-1 block">
            Recordatorio 1ª Noche
          </label>
          <textarea
            className="textarea-gothic"
            rows={2}
            value={form.firstNightReminder || ''}
            onChange={e => setForm(f => ({ ...f, firstNightReminder: e.target.value }))}
            placeholder="Qué hacer la primera noche..."
          />
        </div>
        <div>
          <label className="text-sm text-gothic-300 font-gothic mb-1 block">
            Recordatorio Otras Noches
          </label>
          <textarea
            className="textarea-gothic"
            rows={2}
            value={form.otherNightReminder || ''}
            onChange={e => setForm(f => ({ ...f, otherNightReminder: e.target.value }))}
            placeholder="Qué hacer las demás noches..."
          />
        </div>
      </div>

      {/* Night order */}
      <div className="rounded-lg border border-blue-900/40 bg-blue-950/20 p-3">
        <p className="text-sm text-blue-300 font-gothic mb-1 flex items-center gap-2">
          🌙 Orden de despertar por la noche
        </p>
        <p className="text-xs text-gothic-500 mb-3 leading-relaxed">
          Indica la posición en el turno de noche. Usa <strong className="text-gothic-300">0</strong> si este personaje no actúa esa noche. Números más bajos despiertan antes.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-blue-400 font-gothic mb-1 block">Primera Noche</label>
            <input
              type="number"
              min={0}
              max={99}
              className="input-gothic text-center"
              value={form.firstNight ?? 0}
              onChange={e => setForm(f => ({ ...f, firstNight: Math.max(0, parseInt(e.target.value) || 0) }))}
            />
            <p className={`text-xs mt-1 text-center font-gothic ${nightOrderLabel(form.firstNight ?? 0).color}`}>
              {nightOrderLabel(form.firstNight ?? 0).text}
            </p>
          </div>
          <div>
            <label className="text-xs text-blue-400 font-gothic mb-1 block">Otras Noches</label>
            <input
              type="number"
              min={0}
              max={99}
              className="input-gothic text-center"
              value={form.otherNight ?? 0}
              onChange={e => setForm(f => ({ ...f, otherNight: Math.max(0, parseInt(e.target.value) || 0) }))}
            />
            <p className={`text-xs mt-1 text-center font-gothic ${nightOrderLabel(form.otherNight ?? 0).color}`}>
              {nightOrderLabel(form.otherNight ?? 0).text}
            </p>
          </div>
        </div>
        {/* Reference table */}
        <NightOrderReference />
      </div>

      <div>
        <label className="text-sm text-gothic-300 font-gothic mb-1 block">Fichas de Recordatorio</label>
        <div className="flex gap-2 mb-2">
          <input
            className="input-gothic flex-1"
            value={reminderInput}
            onChange={e => setReminderInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addReminder()}
            placeholder="Nueva ficha..."
          />
          <button onClick={addReminder} className="btn-secondary">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(form.reminders || []).map((r, i) => (
            <span key={i} className="bg-dark-400 border border-dark-200 text-gothic-200 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              {r}
              <button onClick={() => removeReminder(i)}>
                <X className="w-3 h-3 text-gothic-400 hover:text-red-400" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} className="btn-gold flex-1 justify-center">
          <Save className="w-4 h-4" />
          {initial ? 'Guardar Cambios' : 'Crear Personaje'}
        </button>
        <button onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function CharacterCreatorPage() {
  const { state, addCustomCharacter, updateCustomCharacter, deleteCustomCharacter } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editChar, setEditChar] = useState<Character | null>(null);

  const exportCharacters = () => {
    const blob = new Blob([JSON.stringify(state.customCharacters, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `botc-personajes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCharacters = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const chars: Character[] = JSON.parse(text);
        if (!Array.isArray(chars)) throw new Error();
        let imported = 0;
        for (const c of chars) {
          if (c.id && c.name && c.ability) {
            const exists = state.customCharacters.some(ec => ec.id === c.id);
            if (!exists) { addCustomCharacter({ ...c, isCustom: true }); imported++; }
          }
        }
        alert(`✅ Importados ${imported} personaje(s) nuevos.`);
      } catch {
        alert('❌ Error al importar: el archivo no es válido.');
      }
    };
    input.click();
  };

  const handleSave = (data: Omit<Character, 'id'> & { id?: string }) => {
    if (data.id) {
      updateCustomCharacter(data as Character);
    } else {
      addCustomCharacter({ ...data, id: `custom_char_${Date.now()}` } as Character);
    }
    setShowForm(false);
    setEditChar(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-blood-500" />
          <div>
            <h1 className="page-title mb-0">Personajes</h1>
            <p className="text-gothic-300 text-sm">Crea personajes únicos para tus scripts.</p>
          </div>
        </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={importCharacters} className="btn-secondary text-sm" title="Importar personajes desde JSON">
          <Upload className="w-4 h-4" />
          Importar
        </button>
        {state.customCharacters.length > 0 && (
          <button onClick={exportCharacters} className="btn-secondary text-sm" title="Exportar personajes a JSON">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        )}
        <button onClick={() => { setEditChar(null); setShowForm(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Personaje
        </button>
      </div>
      </div>

      {/* Form modal */}
      <Modal
        isOpen={showForm || !!editChar}
        onClose={() => { setShowForm(false); setEditChar(null); }}
        title={editChar ? `Editar: ${editChar.name}` : 'Nuevo Personaje'}
        maxWidth="max-w-2xl"
      >
        <CharacterForm
          initial={editChar || undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditChar(null); }}
        />
      </Modal>

      {/* Character list */}
      {state.customCharacters.length === 0 ? (
        <div className="card text-center py-16">
          <User className="w-16 h-16 text-gothic-600 mx-auto mb-4" />
          <h3 className="font-gothic text-xl text-gothic-400 mb-2">Sin personajes personalizados</h3>
          <p className="text-gothic-500 mb-6">Crea personajes únicos para usar en tus scripts.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" />
            Crear primer personaje
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.customCharacters.map(char => (
            <div key={char.id} className="card border-dark-200 hover:border-blood-700 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{char.icon || '👤'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-gothic text-gold-400">{char.name}</h3>
                    <CharacterTypeBadge type={char.type} />
                  </div>
                  <p className="text-gothic-300 text-sm leading-relaxed mb-2">{char.ability}</p>
                  {char.reminders && char.reminders.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {char.reminders.map((r, i) => (
                        <span key={i} className="bg-dark-400 border border-dark-200 text-gothic-400 text-xs px-1.5 py-0.5 rounded">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => setEditChar(char)} className="btn-secondary p-1.5">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar "${char.name}"?`)) deleteCustomCharacter(char.id);
                    }}
                    className="btn-danger p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
