// Einmal AINS · Perfusor – Startbibliothek
//
// WICHTIG: Diese Konzentrationen und Bereiche sind eine allgemeine Ausgangsliste, KEIN geprüfter Hausstandard.
// Jeder Eintrag startet als „ungeprüft“ und muss in der App gegen den Perfusor-Standard der eigenen Abteilung
// abgeglichen und bestätigt werden. Der „Bereich“ ist ein Plausibilitätsnetz gegen Tipp- und Einheitenfehler,
// keine Dosierempfehlung.

export const CATEGORIES = [
  { id: 'vaso',  name: 'Vasoaktiva & Inotropika' },
  { id: 'sed',   name: 'Sedierung & Analgesie' },
  { id: 'kreis', name: 'Herz & Kreislauf' },
  { id: 'stoff', name: 'Gerinnung, Stoffwechsel & Elektrolyte' },
  { id: 'eigen', name: 'Eigene' },
];

// amount/unit/volume = Spritzeninhalt · dose = Standard-Dosiseinheit · range = [min, max] in dieser Einheit
export const DEFAULT_DRUGS = [
  { id: 'noradrenalin',  name: 'Noradrenalin',        cat: 'vaso',  amount: 5,     unit: 'mg',   volume: 50, dose: 'µg/kg/min', range: [0.01, 1] },
  { id: 'adrenalin',     name: 'Adrenalin',           cat: 'vaso',  amount: 5,     unit: 'mg',   volume: 50, dose: 'µg/kg/min', range: [0.01, 0.5] },
  { id: 'dobutamin',     name: 'Dobutamin',           cat: 'vaso',  amount: 250,   unit: 'mg',   volume: 50, dose: 'µg/kg/min', range: [2, 20] },
  { id: 'vasopressin',   name: 'Vasopressin',         cat: 'vaso',  amount: 40,    unit: 'IE',   volume: 40, dose: 'IE/min',    range: [0.01, 0.03], note: 'Fachinformation (Empressin): 0,01–0,03 IE/min.' },
  { id: 'milrinon',      name: 'Milrinon',            cat: 'vaso',  amount: 20,    unit: 'mg',   volume: 50, dose: 'µg/kg/min', range: [0.25, 0.75] },

  { id: 'propofol',      name: 'Propofol 2 %',        cat: 'sed',   amount: 1000,  unit: 'mg',   volume: 50, dose: 'mg/kg/h',   range: [0.3, 4], note: 'Langzeitsedierung über 4 mg/kg/h: Risiko für ein Propofol-Infusionssyndrom.' },
  { id: 'midazolam',     name: 'Midazolam',           cat: 'sed',   amount: 50,    unit: 'mg',   volume: 50, dose: 'mg/kg/h',   range: [0.02, 0.2] },
  { id: 'sufentanil',    name: 'Sufentanil',          cat: 'sed',   amount: 250,   unit: 'µg',   volume: 50, dose: 'µg/kg/h',   range: [0.1, 1] },
  { id: 'remifentanil',  name: 'Remifentanil',        cat: 'sed',   amount: 5,     unit: 'mg',   volume: 50, dose: 'µg/kg/min', range: [0.05, 0.5] },
  { id: 'esketamin',     name: 'Esketamin',           cat: 'sed',   amount: 500,   unit: 'mg',   volume: 50, dose: 'mg/kg/h',   range: [0.1, 2] },
  { id: 'dexmedetomidin',name: 'Dexmedetomidin',      cat: 'sed',   amount: 400,   unit: 'µg',   volume: 50, dose: 'µg/kg/h',   range: [0.2, 1.4], note: 'Fachinformation (Dexdor): 0,2–1,4 µg/kg/h.' },
  { id: 'clonidin',      name: 'Clonidin',            cat: 'sed',   amount: 1.5,   unit: 'mg',   volume: 50, dose: 'µg/kg/h',   range: [0.25, 2] },
  { id: 'morphin',       name: 'Morphin',             cat: 'sed',   amount: 50,    unit: 'mg',   volume: 50, dose: 'mg/h',      range: [0.5, 10] },

  { id: 'nitroglycerin', name: 'Nitroglycerin',       cat: 'kreis', amount: 50,    unit: 'mg',   volume: 50, dose: 'mg/h',      range: [0.5, 6] },
  { id: 'urapidil',      name: 'Urapidil',            cat: 'kreis', amount: 250,   unit: 'mg',   volume: 50, dose: 'mg/h',      range: [5, 30] },
  { id: 'esmolol',       name: 'Esmolol',             cat: 'kreis', amount: 2500,  unit: 'mg',   volume: 50, dose: 'µg/kg/min', range: [50, 300] },
  { id: 'amiodaron',     name: 'Amiodaron',           cat: 'kreis', amount: 900,   unit: 'mg',   volume: 50, dose: 'mg/d',      range: [300, 1200] },
  { id: 'nimodipin',     name: 'Nimodipin',           cat: 'kreis', amount: 10,    unit: 'mg',   volume: 50, dose: 'mg/h',      range: [1, 2] },

  { id: 'heparin',       name: 'Heparin',             cat: 'stoff', amount: 25000, unit: 'IE',   volume: 50, dose: 'IE/h',      range: [400, 2500] },
  { id: 'insulin',       name: 'Insulin (Normalinsulin)', cat: 'stoff', amount: 50, unit: 'IE',  volume: 50, dose: 'IE/h',      range: [0.5, 10] },
  { id: 'furosemid',     name: 'Furosemid',           cat: 'stoff', amount: 250,   unit: 'mg',   volume: 50, dose: 'mg/h',      range: [1, 40] },
  { id: 'kcl',           name: 'Kaliumchlorid 7,45 %',cat: 'stoff', amount: 50,    unit: 'mmol', volume: 50, dose: 'mmol/h',    range: [1, 20], note: 'Hochkonzentriert nur über ZVK. Maximalrate nach Hausstandard.' },
].map(d => ({ verified: false, note: '', ...d }));

export const LIBRARY_VERSION = 1;
