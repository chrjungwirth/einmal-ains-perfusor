// Einmal AINS · Perfusor – Rechenkern (reine Funktionen, ohne DOM)
//
// Grundgleichung:
//   Laufrate [ml/h] = Dosis pro Stunde (absolut, in Wirkstoff-Basiseinheit) ÷ Konzentration [Basiseinheit/ml]
// Basiseinheiten: Masse → mg, Internationale Einheiten → IE, Stoffmenge → mmol.

export const AMOUNT = {
  'µg':   { family: 'mass', toBase: 0.001 },
  'mg':   { family: 'mass', toBase: 1 },
  'g':    { family: 'mass', toBase: 1000 },
  'IE':   { family: 'ie',   toBase: 1 },
  'mmol': { family: 'mmol', toBase: 1 },
};

const PER_HOUR = { min: 60, h: 1, d: 1 / 24 };

// Auswählbare Dosiseinheiten je Wirkstoff-Familie (Reihenfolge = Anzeige)
export const DOSE_UNITS = {
  mass: ['µg/kg/min', 'µg/kg/h', 'mg/kg/h', 'µg/min', 'µg/h', 'mg/min', 'mg/h', 'mg/d'],
  ie:   ['IE/kg/h', 'IE/min', 'IE/h', 'IE/d'],
  mmol: ['mmol/kg/h', 'mmol/h', 'mmol/d'],
};

export function parseDoseUnit(str) {
  const parts = String(str).split('/');
  if (parts.length < 2 || parts.length > 3) throw new Error('Ungültige Dosiseinheit: ' + str);
  const amount = parts[0];
  const perKg = parts.length === 3;
  if (perKg && parts[1] !== 'kg') throw new Error('Ungültige Dosiseinheit: ' + str);
  const time = parts[parts.length - 1];
  if (!AMOUNT[amount] || !(time in PER_HOUR)) throw new Error('Ungültige Dosiseinheit: ' + str);
  return { amount, perKg, time, family: AMOUNT[amount].family };
}

export function unitFamily(amountUnit) {
  const a = AMOUNT[amountUnit];
  if (!a) throw new Error('Unbekannte Wirkstoffeinheit: ' + amountUnit);
  return a.family;
}

export function unitsFor(amountUnit) {
  return DOSE_UNITS[unitFamily(amountUnit)];
}

/** Anzeige: „mg/d“ → „mg/24 h“ */
export function displayUnit(str) {
  return String(str).replace(/\/d$/, '/24 h');
}

/** Konzentration in Basiseinheit pro ml */
export function concentration(amount, amountUnit, volumeMl) {
  if (!(amount > 0) || !(volumeMl > 0)) return NaN;
  return (amount * AMOUNT[amountUnit].toBase) / volumeMl;
}

/** Faktor: 1 Dosiseinheit → Basiseinheit pro Stunde (absolut, d. h. inkl. Gewicht) */
function doseFactor(doseUnit, weightKg) {
  const u = parseDoseUnit(doseUnit);
  let f = AMOUNT[u.amount].toBase * PER_HOUR[u.time];
  if (u.perKg) {
    if (!(weightKg > 0)) return NaN;
    f *= weightKg;
  }
  return f;
}

export function needsWeight(doseUnit) {
  return parseDoseUnit(doseUnit).perKg;
}

/** Dosis → Laufrate [ml/h] */
export function rateFromDose({ dose, doseUnit, weightKg, amount, amountUnit, volumeMl }) {
  checkFamily(doseUnit, amountUnit);
  const c = concentration(amount, amountUnit, volumeMl);
  const f = doseFactor(doseUnit, weightKg);
  if (!(dose >= 0) || !(c > 0) || !(f > 0)) return NaN;
  return (dose * f) / c;
}

/** Laufrate [ml/h] → Dosis */
export function doseFromRate({ rate, doseUnit, weightKg, amount, amountUnit, volumeMl }) {
  checkFamily(doseUnit, amountUnit);
  const c = concentration(amount, amountUnit, volumeMl);
  const f = doseFactor(doseUnit, weightKg);
  if (!(rate >= 0) || !(c > 0) || !(f > 0)) return NaN;
  return (rate * c) / f;
}

/** Wert von einer Dosiseinheit in eine andere umrechnen (Gewicht nötig, wenn genau eine pro kg ist) */
export function convertDose(value, fromUnit, toUnit, weightKg) {
  const a = parseDoseUnit(fromUnit), b = parseDoseUnit(toUnit);
  if (a.family !== b.family) return NaN;
  const fa = doseFactor(fromUnit, weightKg), fb = doseFactor(toUnit, weightKg);
  if (!(fa > 0) || !(fb > 0)) return NaN;
  return (value * fa) / fb;
}

/** Laufzeit einer Spritze in Stunden */
export function syringeHours(volumeMl, rate) {
  if (!(volumeMl > 0) || !(rate > 0)) return NaN;
  return volumeMl / rate;
}

function checkFamily(doseUnit, amountUnit) {
  if (parseDoseUnit(doseUnit).family !== unitFamily(amountUnit)) {
    throw new Error(`Dosiseinheit ${doseUnit} passt nicht zur Wirkstoffeinheit ${amountUnit}`);
  }
}

// ---------- Zahlen lesen und schreiben (Dezimalkomma, Tausenderpunkt) ----------

/**
 * Zahl lesen: „0,1“ · „0.1“ · „1.000,5“ · „25000“.
 * Ein Punkt mit genau drei Ziffern danach und ohne Komma („1.250“) ist mehrdeutig
 * (1,25 oder 1250?) und wird abgelehnt – lieber eine Rückfrage als ein Faktor 1000.
 * → { value, error }  (value NaN bei leer/ungültig)
 */
export function readNum(input) {
  let s = String(input ?? '').trim().replace(/[\s  ']/g, '');
  if (!s) return { value: NaN, error: null };
  if (s.includes(',')) {
    if ((s.match(/,/g) || []).length > 1) return { value: NaN, error: 'Ungültige Zahl.' };
    if (s.includes('.') && !/^\d{1,3}(\.\d{3})+,\d*$/.test(s)) return { value: NaN, error: 'Ungültige Zahl.' };
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(s)) {
    return { value: NaN, error: `„${input}“ ist mehrdeutig – Dezimalstellen mit Komma schreiben (z. B. 1,25) oder Tausenderpunkt weglassen (1250).` };
  }
  if (!/^\d*\.?\d+$/.test(s)) return { value: NaN, error: 'Ungültige Zahl.' };
  return { value: Number(s), error: null };
}

export function parseNum(input) {
  return readNum(input).value;
}

const nf = (min, max, grouping = true) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: min, maximumFractionDigits: max, useGrouping: grouping });

/** Laufrate: ≥ 1 ml/h auf 0,1 – darunter auf 0,01 (Perfusor-Auflösung) */
export function formatRate(rate) {
  if (!Number.isFinite(rate)) return '–';
  if (rate < 1) return nf(2, 2).format(roundTo(rate, 0.01));
  return nf(1, 1).format(roundTo(rate, 0.1));
}

/** Dosis: 3 signifikante Stellen, ohne überflüssige Nullen */
export function formatDose(v) {
  if (!Number.isFinite(v)) return '–';
  if (v === 0) return '0';
  const digits = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(v))));
  return nf(0, Math.min(digits, 4)).format(Number(v.toPrecision(3)));
}

/** Allgemeine Zahl für Eingabefelder (bis 4 Nachkommastellen) */
export function formatInput(v) {
  if (!Number.isFinite(v)) return '';
  return nf(0, 4, false).format(v);
}

export function formatHours(h) {
  if (!Number.isFinite(h)) return '–';
  if (h >= 48) return nf(1, 1).format(h / 24) + ' Tage';
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  if (mm === 60) return `${hh + 1} h`;
  if (hh === 0) return `${mm} min`;
  return mm ? `${hh} h ${mm} min` : `${hh} h`;
}

function roundTo(v, step) {
  return Math.round(v / step) * step;
}

/** „Schöne“ Stufen für die Dosistabelle zwischen lo und hi */
export function niceSteps(lo, hi, maxSteps = 8) {
  if (!(hi > lo) || !(lo >= 0)) return [];
  const raw = (hi - lo) / (maxSteps - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw);
  const out = [];
  let start = Math.ceil(lo / step - 1e-9) * step;
  if (start - lo > 1e-12) out.push(lo);
  // feinere Stufe am unteren Ende (z. B. 0,01 · 0,05 · 0,1 …)
  const half = Number((step / 2).toPrecision(10));
  if (half > lo + 1e-12 && half < start - 1e-12) out.push(half);
  for (let v = start; v <= hi + step * 1e-6 && out.length < maxSteps + 2; v += step) {
    out.push(Number(v.toPrecision(10)));
  }
  if (out[0] === 0) out.shift();
  return out;
}

// ---------- Plausibilität ----------

/**
 * Liefert Hinweise zu einer Berechnung.
 * level: 'danger' | 'warn'
 */
export function checks({ rate, dose, range, weightKg, weightNeeded, volumeMl }) {
  const out = [];
  if (weightNeeded && Number.isFinite(weightKg)) {
    if (weightKg < 0.3 || weightKg > 350) out.push({ level: 'danger', text: 'Körpergewicht außerhalb 0,3–350 kg – Eingabe prüfen.' });
  }
  if (Number.isFinite(rate)) {
    if (rate > 99.9) out.push({ level: 'danger', text: 'Laufrate über 99,9 ml/h – Konzentration und Dosiseinheit prüfen.' });
    else if (rate > 0 && rate < 0.1) out.push({ level: 'warn', text: 'Laufrate unter 0,1 ml/h – stärker verdünnen, damit die Förderung gleichmäßig bleibt.' });
    if (volumeMl > 0 && rate > 0 && volumeMl / rate < 1) out.push({ level: 'warn', text: 'Spritze ist in weniger als 1 h leer.' });
  }
  if (range && Number.isFinite(dose) && range.length === 2) {
    const [lo, hi] = range;
    if (dose > hi) out.push({ level: dose > hi * 3 ? 'danger' : 'warn', text: `Dosis über dem hinterlegten Bereich (${formatDose(lo)}–${formatDose(hi)}). Eingabe und Einheit prüfen.` });
    else if (dose > 0 && dose < lo) out.push({ level: dose < lo / 3 ? 'danger' : 'warn', text: `Dosis unter dem hinterlegten Bereich (${formatDose(lo)}–${formatDose(hi)}). Eingabe und Einheit prüfen.` });
  }
  return out;
}
