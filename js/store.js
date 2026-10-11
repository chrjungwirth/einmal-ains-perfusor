// Einmal AINS · Perfusor – Speicher (nur auf diesem Gerät, localStorage)
// Das Körpergewicht wird bewusst NICHT gespeichert: es gilt nur bis die App geschlossen wird.

import { DEFAULT_DRUGS, LIBRARY_VERSION, CATEGORIES } from './drugs.js';
import { AMOUNT, parseDoseUnit, unitFamily } from './calc.js';

const KEY = 'ea-perfusor-v1';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}
function write(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}

const clone = (x) => JSON.parse(JSON.stringify(x));

function fresh() {
  return { v: LIBRARY_VERSION, drugs: clone(DEFAULT_DRUGS), favorites: [], theme: 'system', noticeDismissed: false };
}

let state = read();
if (!state || !Array.isArray(state.drugs)) state = fresh();

export const store = {
  get drugs() { return state.drugs; },
  get favorites() { return new Set(state.favorites); },
  get theme() { return state.theme || 'system'; },
  get noticeDismissed() { return !!state.noticeDismissed; },
  persistent: write(state),

  drug(id) { return state.drugs.find(d => d.id === id) || null; },

  setTheme(t) { state.theme = t; write(state); },
  dismissNotice() { state.noticeDismissed = true; write(state); },

  toggleFavorite(id) {
    const f = new Set(state.favorites);
    f.has(id) ? f.delete(id) : f.add(id);
    state.favorites = [...f];
    write(state);
    return f.has(id);
  },

  saveDrug(drug) {
    const d = validateDrug(drug);
    const i = state.drugs.findIndex(x => x.id === d.id);
    if (i >= 0) state.drugs[i] = d; else state.drugs.push(d);
    write(state);
    return d;
  },

  deleteDrug(id) {
    state.drugs = state.drugs.filter(d => d.id !== id);
    state.favorites = state.favorites.filter(f => f !== id);
    write(state);
  },

  newId(name) {
    const base = String(name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'medikament';
    let id = base, n = 2;
    while (state.drugs.some(d => d.id === id)) id = `${base}-${n++}`;
    return id;
  },

  reset() {
    const keepTheme = state.theme;
    state = fresh();
    state.theme = keepTheme;
    write(state);
  },

  exportJSON() {
    return JSON.stringify({ app: 'einmal-ains-perfusor', v: LIBRARY_VERSION, exported: new Date().toISOString(), drugs: state.drugs, favorites: state.favorites }, null, 2);
  },

  /** Ersetzt die Bibliothek durch eine exportierte Datei. Wirft bei ungültigem Inhalt. */
  importJSON(text) {
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('Die Datei ist kein gültiges JSON.'); }
    if (!data || data.app !== 'einmal-ains-perfusor' || !Array.isArray(data.drugs)) throw new Error('Das ist keine Perfusor-Bibliothek aus dieser App.');
    const drugs = data.drugs.map(validateDrug);
    const ids = new Set();
    for (const d of drugs) { if (ids.has(d.id)) throw new Error(`Doppelte ID: ${d.id}`); ids.add(d.id); }
    state.drugs = drugs;
    state.favorites = (data.favorites || []).filter(id => ids.has(id));
    write(state);
    return drugs.length;
  },
};

export function validateDrug(d) {
  const err = (m) => { throw new Error(`${d && d.name ? d.name + ': ' : ''}${m}`); };
  if (!d || typeof d !== 'object') err('Eintrag fehlt.');
  const name = String(d.name || '').trim();
  if (!name) err('Name fehlt.');
  if (!/^[a-z0-9-]+$/.test(String(d.id || ''))) err('Ungültige ID.');
  if (!AMOUNT[d.unit]) err('Unbekannte Wirkstoffeinheit.');
  if (!(Number(d.amount) > 0)) err('Wirkstoffmenge muss größer als 0 sein.');
  if (!(Number(d.volume) > 0) || Number(d.volume) > 1000) err('Volumen muss zwischen 0 und 1000 ml liegen.');
  let u;
  try { u = parseDoseUnit(d.dose); } catch { err('Ungültige Dosiseinheit.'); }
  if (u.family !== unitFamily(d.unit)) err('Dosiseinheit passt nicht zur Wirkstoffeinheit.');
  let range = null;
  if (Array.isArray(d.range) && d.range.length === 2 && d.range.every(x => Number.isFinite(Number(x)))) {
    const [lo, hi] = d.range.map(Number);
    if (lo < 0 || hi <= lo) err('Bereich: „bis“ muss größer als „von“ sein.');
    range = [lo, hi];
  }
  const cat = CATEGORIES.some(c => c.id === d.cat) ? d.cat : 'eigen';
  return {
    id: d.id, name, cat,
    amount: Number(d.amount), unit: d.unit, volume: Number(d.volume),
    dose: d.dose, range,
    note: String(d.note || '').trim().slice(0, 500),
    verified: !!d.verified,
    custom: !!d.custom,
  };
}
