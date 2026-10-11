// Einmal AINS · Perfusor – Oberfläche
import * as C from './calc.js';
import { CATEGORIES } from './drugs.js';
import { store } from './store.js';

export const VERSION = '1.0.0';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const view = $('#view');

// ---------- Icons (24er Strich) ----------
const I = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5L21.5 20h-19z"/><path d="M12 10v4.5M12 17.5h.01"/></svg>',
  danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
  ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
};

// ---------- Sitzung (nur im Arbeitsspeicher) ----------
const session = {
  weightText: '',
  mode: 'dose',             // 'dose' = Dosis → Laufrate · 'rate' = Laufrate → Dosis
  perDrug: {},              // { [id]: { doseText, rateText, unit, amountText, volumeText } }
  query: '',
  filter: 'alle',
};
const weightOf = () => C.parseNum(session.weightText);
const per = (id) => (session.perDrug[id] ||= { doseText: '', rateText: '', unit: null, amountText: null, volumeText: null });

// ---------- Theme ----------
const mql = matchMedia('(prefers-color-scheme: dark)');
function effectiveTheme() {
  const t = store.theme;
  return t === 'system' ? (mql.matches ? 'dark' : 'light') : t;
}
function applyTheme() {
  const t = store.theme;
  if (t === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  const dark = effectiveTheme() === 'dark';
  $$('meta[name="theme-color"]').forEach(m => m.remove());
  const m = document.createElement('meta');
  m.name = 'theme-color'; m.content = dark ? '#0A1416' : '#F3F6F5';
  document.head.appendChild(m);
  const btn = $('#theme-quick');
  if (btn) {
    btn.innerHTML = dark ? I.sun : I.moon;
    btn.setAttribute('aria-label', dark ? 'Helles Farbschema' : 'Dunkles Farbschema (Nachtdienst)');
  }
}
mql.addEventListener?.('change', applyTheme);

// ---------- Toast ----------
let toastTimer;
function toast(text, action) {
  const host = $('#toasts');
  clearTimeout(toastTimer);
  host.innerHTML = `<div class="toast" role="status"><span>${esc(text)}</span>${action ? `<button class="ea-btn" type="button">${esc(action.label)}</button>` : ''}</div>`;
  if (action) $('button', host).addEventListener('click', () => { host.innerHTML = ''; action.run(); });
  if (!action || !action.sticky) toastTimer = setTimeout(() => (host.innerHTML = ''), action ? 8000 : 2600);
}

// ---------- Hilfen ----------
const catName = (id) => (CATEGORIES.find(c => c.id === id) || { name: 'Eigene' }).name;
const fmtAmount = (d) => `${C.formatDose(d.amount)} ${d.unit} / ${C.formatDose(d.volume)} ml`;

function concText(amount, unit, volume) {
  const c = C.concentration(amount, unit, volume);
  if (!Number.isFinite(c)) return '–';
  const fam = C.unitFamily(unit);
  if (fam === 'mass') return c < 1 ? `${C.formatDose(c * 1000)} µg/ml` : `${C.formatDose(c)} mg/ml`;
  return `${C.formatDose(c)} ${fam === 'ie' ? 'IE' : 'mmol'}/ml`;
}

function absoluteText(perHourBase, unit) {
  if (!Number.isFinite(perHourBase)) return '–';
  const fam = C.unitFamily(unit);
  if (fam === 'mass') {
    const mgH = perHourBase, ugMin = (perHourBase * 1000) / 60;
    return mgH < 1 ? `${C.formatDose(ugMin)} µg/min · ${C.formatDose(mgH * 1000)} µg/h` : `${C.formatDose(ugMin)} µg/min · ${C.formatDose(mgH)} mg/h`;
  }
  const u = fam === 'ie' ? 'IE' : 'mmol';
  return `${C.formatDose(perHourBase / 60)} ${u}/min · ${C.formatDose(perHourBase)} ${u}/h · ${C.formatDose(perHourBase * 24)} ${u}/24 h`;
}

function note(level, title, body, extra = '') {
  const icon = { info: I.info, warn: I.warn, danger: I.danger, ok: I.ok }[level];
  const cls = level === 'info' ? '' : ` ea-note--${level}`;
  return `<div class="ea-note${cls}" role="${level === 'danger' ? 'alert' : 'note'}">${icon}<span class="ea-note__title">${esc(title)}</span><p>${body}</p>${extra}</div>`;
}

function statusChip(d) {
  return d.verified
    ? `<span class="ea-chip ea-chip--ok">${I.ok}Hausstandard bestätigt</span>`
    : `<span class="ea-chip ea-chip--warn">${I.warn}Ungeprüft</span>`;
}

function setHeader({ back } = {}) {
  const right = $('#header-right');
  right.innerHTML = `
    <button class="icon-btn" id="theme-quick" type="button"></button>
    ${back ? '' : `<a class="icon-btn" href="#/einstellungen" aria-label="Einstellungen">${I.gear}</a>`}`;
  $('#theme-quick').addEventListener('click', () => {
    store.setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
    applyTheme();
    if (location.hash === '#/einstellungen') render();
  });
  applyTheme();
}

// ---------- Ansicht: Liste ----------
function renderList() {
  setHeader();
  document.title = 'Perfusor · Einmal AINS';
  const total = store.drugs.length, verified = store.drugs.filter(d => d.verified).length;
  const showNotice = !store.noticeDismissed || verified === 0;
  const hasPatient = session.weightText || Object.keys(session.perDrug).length;
  view.innerHTML = `
    ${showNotice ? note('warn', 'Startliste ist ungeprüft',
      `Die Konzentrationen sind allgemeine Vorschläge. Gleiche jedes Medikament mit eurem Perfusor-Standard ab und bestätige es, bevor du es am Patienten verwendest. Bisher bestätigt: <b>${verified} von ${total}</b>.`,
      store.noticeDismissed ? '' : `<div class="btn-row"><button class="ea-btn ea-btn--secondary ea-btn--sm" type="button" id="dismiss">Verstanden</button></div>`) : ''}
    <div class="search">
      ${I.search}
      <label class="sr-only" for="q">Medikament suchen</label>
      <input id="q" type="search" placeholder="Medikament suchen" autocomplete="off" enterkeyhint="search" value="${esc(session.query)}">
    </div>
    <div class="filters" role="group" aria-label="Filter">
      ${[['alle', 'Alle'], ['fav', 'Favoriten'], ...CATEGORIES.map(c => [c.id, c.name])]
        .map(([id, name]) => `<button class="filter" type="button" data-filter="${id}" aria-pressed="${session.filter === id}">${esc(name)}</button>`).join('')}
    </div>
    <div id="results" class="view" style="padding:0"></div>
    <div class="btn-row">
      <a class="ea-btn ea-btn--secondary" href="#/neu">${I.plus}Eigenes Medikament</a>
      ${hasPatient ? `<button class="ea-btn ea-btn--ghost" type="button" id="new-patient">Neuer Patient</button>` : ''}
    </div>
    <p class="footnote">Die Berechnung ersetzt nicht die klinische Beurteilung, die Fachinformation und den Hausstandard. Vor Anwendung Konzentration, Einheit und Laufrate am Gerät gegenprüfen.</p>`;

  $('#dismiss')?.addEventListener('click', () => { store.dismissNotice(); renderList(); });
  $('#new-patient')?.addEventListener('click', newPatient);
  const q = $('#q');
  q.addEventListener('input', () => { session.query = q.value; renderResults(); });
  $$('.filter').forEach(b => b.addEventListener('click', () => {
    session.filter = b.dataset.filter;
    $$('.filter').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderResults();
  }));
  renderResults();
}

function renderResults() {
  const box = $('#results');
  const q = session.query.trim().toLowerCase();
  const fav = store.favorites;
  let list = store.drugs.filter(d => !q || d.name.toLowerCase().includes(q));
  if (session.filter === 'fav') list = list.filter(d => fav.has(d.id));
  else if (session.filter !== 'alle') list = list.filter(d => d.cat === session.filter);

  if (!list.length) {
    box.innerHTML = `<div class="empty">${session.filter === 'fav' && !q
      ? 'Noch keine Favoriten. Tippe auf den Stern neben einem Medikament.'
      : `Kein Medikament gefunden${q ? ` für „${esc(session.query)}“` : ''}.`}</div>`;
    return;
  }
  const groups = CATEGORIES.map(c => ({ c, items: list.filter(d => d.cat === c.id) })).filter(g => g.items.length);
  box.innerHTML = groups.map(({ c, items }) => `
    <section class="group" aria-label="${esc(c.name)}">
      <h2 class="label group__title">${esc(c.name)}</h2>
      <div class="list">
        ${items.map(d => `
          <div class="row">
            <a class="row__main" href="#/m/${d.id}">
              <span class="row__name">${esc(d.name)}${d.verified ? '' : '<span class="dot dot--warn" title="Ungeprüft"></span><span class="sr-only">(ungeprüft)</span>'}</span>
              <span class="row__meta">${esc(fmtAmount(d))} · ${esc(C.displayUnit(d.dose))}</span>
            </a>
            <button class="star" type="button" data-fav="${d.id}" aria-pressed="${fav.has(d.id)}" aria-label="${esc(d.name)} als Favorit">${I.star}</button>
          </div>`).join('')}
      </div>
    </section>`).join('');
  $$('[data-fav]', box).forEach(b => b.addEventListener('click', () => {
    const on = store.toggleFavorite(b.dataset.fav);
    b.setAttribute('aria-pressed', String(on));
    if (session.filter === 'fav') renderResults();
  }));
}

function newPatient() {
  session.weightText = '';
  session.perDrug = {};
  toast('Eingaben gelöscht – bereit für den nächsten Patienten.');
  render();
}

// ---------- Ansicht: Rechner ----------
function renderCalc(id) {
  const d = store.drug(id);
  if (!d) { location.hash = '#/'; return; }
  setHeader();
  document.title = `${d.name} · Perfusor`;
  const p = per(id);
  if (!p.unit || !C.unitsFor(d.unit).includes(p.unit)) p.unit = d.dose;
  const units = C.unitsFor(d.unit);
  const overridden = p.amountText !== null;

  view.innerHTML = `
    <a class="back" href="#/">${I.back}Alle Medikamente</a>
    <div class="drug-head">
      <span class="label">${esc(catName(d.cat))}</span>
      <h1 class="heading">${esc(d.name)}</h1>
      <div class="drug-head__row">
        ${statusChip(d)}
        <a class="ea-btn ea-btn--ghost ea-btn--sm" href="#/bearbeiten/${d.id}">${I.edit}${d.verified ? 'Bearbeiten' : 'Prüfen &amp; bestätigen'}</a>
      </div>
    </div>

    <form class="card card--raised" id="calc" novalidate autocomplete="off">
      <div class="conc${overridden ? ' conc--changed' : ''}" id="conc">
        <div>
          <div class="conc__val" id="conc-val"></div>
          <div class="conc__sub" id="conc-sub"></div>
        </div>
        <button class="ea-btn ea-btn--ghost ea-btn--sm" type="button" id="conc-toggle" aria-expanded="${overridden}">${overridden ? 'Standard' : 'Ändern'}</button>
      </div>
      <div class="grid-2" id="conc-edit" ${overridden ? '' : 'hidden'}>
        <div class="ea-field">
          <label class="ea-field__label" for="c-amount">Wirkstoff</label>
          <div class="ea-field__control"><input class="ea-field__input" id="c-amount" inputmode="decimal" value="${esc(p.amountText ?? C.formatInput(d.amount))}"><span class="ea-field__unit">${esc(d.unit)}</span></div>
        </div>
        <div class="ea-field">
          <label class="ea-field__label" for="c-volume">Volumen</label>
          <div class="ea-field__control"><input class="ea-field__input" id="c-volume" inputmode="decimal" value="${esc(p.volumeText ?? C.formatInput(d.volume))}"><span class="ea-field__unit">ml</span></div>
        </div>
      </div>

      <div class="segmented" role="group" aria-label="Rechenrichtung">
        <button type="button" data-mode="dose" aria-pressed="${session.mode === 'dose'}">Dosis → ml/h</button>
        <button type="button" data-mode="rate" aria-pressed="${session.mode === 'rate'}">ml/h → Dosis</button>
      </div>

      <div class="ea-field" id="weight-field">
        <label class="ea-field__label" for="w">Körpergewicht</label>
        <div class="ea-field__control"><input class="ea-field__input" id="w" inputmode="decimal" placeholder="z. B. 75" value="${esc(session.weightText)}"><span class="ea-field__unit">kg</span></div>
        <span class="ea-field__hint" id="w-hint">Gilt für alle Medikamente, bis du „Neuer Patient“ wählst oder die App schließt.</span>
      </div>

      <div class="ea-field" id="dose-field" ${session.mode === 'dose' ? '' : 'hidden'}>
        <label class="ea-field__label" for="dose">Dosis</label>
        <div class="ea-field__control">
          <input class="ea-field__input" id="dose" inputmode="decimal" placeholder="${d.range ? esc(C.formatDose(d.range[0])) : ''}" value="${esc(p.doseText)}">
          <label class="sr-only" for="unit">Dosiseinheit</label>
          <select class="unit-select" id="unit">${units.map(u => `<option value="${u}" ${u === p.unit ? 'selected' : ''}>${esc(C.displayUnit(u))}</option>`).join('')}</select>
        </div>
        <span class="ea-field__hint" id="dose-hint"></span>
      </div>

      <div class="ea-field" id="rate-field" ${session.mode === 'rate' ? '' : 'hidden'}>
        <label class="ea-field__label" for="rate">Laufrate</label>
        <div class="ea-field__control"><input class="ea-field__input" id="rate" inputmode="decimal" placeholder="z. B. 4,8" value="${esc(p.rateText)}"><span class="ea-field__unit">ml/h</span></div>
        <span class="ea-field__hint" id="rate-hint"></span>
      </div>
      <div class="ea-field" id="outunit-field" ${session.mode === 'rate' ? '' : 'hidden'}>
        <label class="ea-field__label" for="outunit">Dosis anzeigen in</label>
        <select class="select mono" id="outunit">${units.map(u => `<option value="${u}" ${u === p.unit ? 'selected' : ''}>${esc(C.displayUnit(u))}</option>`).join('')}</select>
      </div>

      <div class="ea-result" id="result" role="status" aria-live="polite" aria-atomic="true">
        <span class="label" id="res-label"></span>
        <span class="ea-result__value"><span id="res-val">–</span> <span class="ea-result__unit" id="res-unit"></span></span>
        <span class="caption muted" id="res-hint"></span>
      </div>

      <div class="notes" id="notes"></div>

      <div class="ea-rows" id="details"></div>
      <p class="caption muted" id="formula"></p>

      <details class="more" id="table-box">
        <summary>Dosistabelle</summary>
        <div id="table"></div>
      </details>
    </form>
    ${d.note ? note('info', 'Hinweis', esc(d.note)) : ''}
    <div class="btn-row"><button class="ea-btn ea-btn--ghost" type="button" id="new-patient">Neuer Patient</button></div>
    <p class="footnote">Ergebnis vor Anwendung am Perfusor gegenprüfen. Die Berechnung ersetzt nicht die klinische Beurteilung, die Fachinformation und den Hausstandard.</p>`;

  const form = $('#calc');
  form.addEventListener('submit', e => e.preventDefault());
  $('#new-patient').addEventListener('click', newPatient);

  $('#conc-toggle').addEventListener('click', () => {
    if (p.amountText !== null) { p.amountText = null; p.volumeText = null; }
    else { p.amountText = C.formatInput(d.amount); p.volumeText = C.formatInput(d.volume); }
    renderCalc(id);
    if (p.amountText !== null) $('#c-amount').focus();
  });
  $('#c-amount').addEventListener('input', e => { p.amountText = e.target.value; update(); });
  $('#c-volume').addEventListener('input', e => { p.volumeText = e.target.value; update(); });

  $$('[data-mode]').forEach(b => b.addEventListener('click', () => {
    const next = b.dataset.mode;
    if (next === session.mode) return;
    // aktuelles Ergebnis in das andere Feld übernehmen, damit nichts verloren geht
    const r = compute(d);
    if (next === 'rate' && Number.isFinite(r.rate)) p.rateText = C.formatInput(r.rate < 1 ? Math.round(r.rate * 100) / 100 : Math.round(r.rate * 10) / 10);
    if (next === 'dose' && Number.isFinite(r.dose)) p.doseText = C.formatInput(Number(r.dose.toPrecision(3)));
    session.mode = next;
    renderCalc(id);
  }));

  $('#w').addEventListener('input', e => { session.weightText = e.target.value; update(); });
  $('#dose').addEventListener('input', e => { p.doseText = e.target.value; update(); });
  $('#rate').addEventListener('input', e => { p.rateText = e.target.value; update(); });
  const onUnit = (sel) => {
    const prev = p.unit, next = sel.value;
    if (session.mode === 'dose') {
      const v = C.parseNum(p.doseText);
      const conv = Number.isFinite(v) ? C.convertDose(v, prev, next, weightOf()) : NaN;
      p.doseText = Number.isFinite(conv) ? C.formatInput(Number(conv.toPrecision(4))) : '';
      $('#dose').value = p.doseText;
    }
    p.unit = next;
    $('#unit').value = next; $('#outunit').value = next;
    update();
  };
  $('#unit').addEventListener('change', e => onUnit(e.target));
  $('#outunit').addEventListener('change', e => onUnit(e.target));

  update();

  function update() { updateCalc(d); }
}

/** Liest alle Eingaben und rechnet. */
function compute(d) {
  const p = per(d.id);
  const amountR = p.amountText !== null ? C.readNum(p.amountText) : { value: d.amount, error: null };
  const volumeR = p.volumeText !== null ? C.readNum(p.volumeText) : { value: d.volume, error: null };
  const weightR = C.readNum(session.weightText);
  const doseR = C.readNum(p.doseText);
  const rateR = C.readNum(p.rateText);
  const unit = p.unit || d.dose;
  const weightNeeded = C.needsWeight(unit) || (d.range && C.needsWeight(d.dose));
  const base = { doseUnit: unit, weightKg: weightR.value, amount: amountR.value, amountUnit: d.unit, volumeMl: volumeR.value };

  let rate = NaN, dose = NaN;
  if (session.mode === 'dose') { dose = doseR.value; rate = C.rateFromDose({ ...base, dose }); }
  else { rate = rateR.value; dose = C.doseFromRate({ ...base, rate }); }

  const range = d.range ? d.range.map(v => C.convertDose(v, d.dose, unit, weightR.value)) : null;
  const perHourBase = Number.isFinite(rate) ? rate * C.concentration(amountR.value, d.unit, volumeR.value) : NaN;
  return { amountR, volumeR, weightR, doseR, rateR, unit, weightNeeded, rate, dose, range: range && range.every(Number.isFinite) ? range : null, perHourBase };
}

function updateCalc(d) {
  const p = per(d.id);
  const r = compute(d);
  const isDose = session.mode === 'dose';
  const needW = C.needsWeight(r.unit);

  // Konzentration
  const amount = r.amountR.value, volume = r.volumeR.value;
  $('#conc-val').textContent = Number.isFinite(amount) && Number.isFinite(volume) ? `${C.formatDose(amount)} ${d.unit} / ${C.formatDose(volume)} ml` : '–';
  const changed = p.amountText !== null && (amount !== d.amount || volume !== d.volume);
  $('#conc-sub').textContent = `= ${concText(amount, d.unit, volume)}${changed ? ' · abweichend vom Standard' : ''}`;
  $('#conc').classList.toggle('conc--changed', changed);

  // Feldfehler
  fieldState('#weight-field', r.weightR.error, '#w-hint', 'Gilt für alle Medikamente, bis du „Neuer Patient“ wählst oder die App schließt.');
  $('#weight-field').hidden = !needW && !(d.range && C.needsWeight(d.dose));
  fieldState('#dose-field', r.doseR.error, '#dose-hint', d.range ? `Hinterlegter Bereich: ${C.formatDose(d.range[0])}–${C.formatDose(d.range[1])} ${C.displayUnit(d.dose)}` : '');
  fieldState('#rate-field', r.rateR.error, '#rate-hint', '');

  // Ergebnis
  const res = $('#result');
  $('#res-label').textContent = isDose ? 'Laufrate' : 'Dosis';
  $('#res-unit').textContent = isDose ? 'ml/h' : C.displayUnit(r.unit);
  let missing = '';
  if (!(Number.isFinite(amount) && amount > 0 && Number.isFinite(volume) && volume > 0)) missing = 'Konzentration prüfen.';
  else if (needW && !Number.isFinite(r.weightR.value)) missing = 'Körpergewicht eingeben.';
  else if (isDose && !Number.isFinite(r.doseR.value)) missing = 'Dosis eingeben.';
  else if (!isDose && !Number.isFinite(r.rateR.value)) missing = 'Laufrate eingeben.';
  const value = isDose ? r.rate : r.dose;
  const ok = !missing && Number.isFinite(value);
  $('#res-val').textContent = ok ? (isDose ? C.formatRate(value) : C.formatDose(value)) : '–';
  $('#res-hint').textContent = missing;
  res.classList.toggle('ea-result--empty', !ok);

  // Hinweise
  const list = ok ? C.checks({ rate: r.rate, dose: r.dose, range: r.range, weightKg: r.weightR.value, weightNeeded: needW, volumeMl: volume }) : [];
  res.classList.toggle('ea-result--danger', list.some(n => n.level === 'danger'));
  res.classList.toggle('ea-result--warn', !list.some(n => n.level === 'danger') && list.some(n => n.level === 'warn'));
  if (ok && isDose && r.rate > 0 && r.rate < 1) list.push({ level: 'info', text: 'Laufrate unter 1 ml/h wird auf 0,01 ml/h genau angezeigt.' });
  $('#notes').innerHTML = list.map(n => note(n.level, n.level === 'danger' ? 'Unplausibel' : n.level === 'warn' ? 'Prüfen' : 'Hinweis', esc(n.text))).join('');

  // Details
  const rows = [];
  if (ok) {
    if (isDose) rows.push(['Dosis', `${C.formatDose(r.dose)} ${C.displayUnit(r.unit)}`]);
    else rows.push(['Laufrate', `${C.formatRate(r.rate)} ml/h`]);
    rows.push(['Absolut', absoluteText(r.perHourBase, d.unit)]);
    if (needW) rows.push(['Gewicht', `${C.formatDose(r.weightR.value)} kg`]);
    rows.push(['Spritze leer nach', C.formatHours(C.syringeHours(volume, r.rate))]);
  }
  $('#details').innerHTML = rows.map(([k, v]) => `<div class="ea-rows__row"><span class="ea-rows__key">${esc(k)}</span><span class="ea-rows__val">${esc(v)}</span></div>`).join('');
  $('#details').hidden = !rows.length;

  const u = C.parseDoseUnit(r.unit);
  const t = { min: ' × 60', h: '', d: ' ÷ 24' }[u.time];
  $('#formula').textContent = isDose
    ? `ml/h = Dosis${u.perKg ? ' × kg' : ''}${t} ÷ Konzentration (${concText(amount, d.unit, volume)})`
    : `Dosis = ml/h × Konzentration (${concText(amount, d.unit, volume)})${u.perKg ? ' ÷ kg' : ''}${{ min: ' ÷ 60', h: '', d: ' × 24' }[u.time]}`;

  // Dosistabelle
  const tbl = $('#table');
  if (!r.range) {
    tbl.innerHTML = `<p class="small muted">${d.range ? 'Für die Tabelle zuerst das Körpergewicht eingeben.' : 'Für dieses Medikament ist kein Bereich hinterlegt. Unter „Bearbeiten“ lässt sich einer eintragen.'}</p>`;
  } else if (needW && !Number.isFinite(r.weightR.value)) {
    tbl.innerHTML = '<p class="small muted">Für die Tabelle zuerst das Körpergewicht eingeben.</p>';
  } else {
    const steps = C.niceSteps(r.range[0], r.range[1], 11);
    const cur = r.dose;
    const body = steps.map(s => {
      const rr = C.rateFromDose({ dose: s, doseUnit: r.unit, weightKg: r.weightR.value, amount, amountUnit: d.unit, volumeMl: volume });
      const isCur = Number.isFinite(cur) && Math.abs(s - cur) < 1e-9 * Math.max(1, s);
      return `<tr class="${isCur ? 'is-current' : ''}"><td>${C.formatDose(s)}</td><td class="${rr > 99.9 ? 'out' : ''}">${C.formatRate(rr)}</td></tr>`;
    }).join('');
    tbl.innerHTML = `
      <div class="table-wrap"><table class="dose">
        <thead><tr><th scope="col">${esc(C.displayUnit(r.unit))}</th><th scope="col">ml/h</th></tr></thead>
        <tbody>${body}</tbody>
      </table></div>
      <p class="caption muted">${esc(fmtAmountRaw(amount, d.unit, volume))}${needW ? ` · ${C.formatDose(r.weightR.value)} kg` : ''}</p>`;
  }
}

const fmtAmountRaw = (a, u, v) => `${C.formatDose(a)} ${u} / ${C.formatDose(v)} ml`;

function fieldState(fieldSel, error, hintSel, defaultHint) {
  const f = $(fieldSel); if (!f) return;
  f.classList.toggle('ea-field--error', !!error);
  const h = $(hintSel);
  if (h) { h.textContent = error || defaultHint; h.hidden = !(error || defaultHint); }
  const input = $('input', f);
  if (input) error ? input.setAttribute('aria-invalid', 'true') : input.removeAttribute('aria-invalid');
}

// ---------- Ansicht: Bearbeiten / Neu ----------
function renderEdit(id) {
  const isNew = !id;
  const d = isNew
    ? { id: '', name: '', cat: 'eigen', amount: '', unit: 'mg', volume: 50, dose: 'mg/h', range: null, note: '', verified: false, custom: true }
    : store.drug(id);
  if (!d) { location.hash = '#/'; return; }
  setHeader({ back: true });
  document.title = isNew ? 'Neues Medikament · Perfusor' : `${d.name} bearbeiten · Perfusor`;
  const amountUnits = Object.keys(C.AMOUNT);
  const unitOptions = (amountUnit, sel) => C.unitsFor(amountUnit).map(u => `<option value="${u}" ${u === sel ? 'selected' : ''}>${esc(C.displayUnit(u))}</option>`).join('');

  view.innerHTML = `
    <a class="back" href="${isNew ? '#/' : `#/m/${d.id}`}">${I.back}${isNew ? 'Alle Medikamente' : 'Zurück zum Rechner'}</a>
    <h1 class="heading">${isNew ? 'Eigenes Medikament' : 'Medikament bearbeiten'}</h1>
    ${isNew ? '' : note(d.verified ? 'ok' : 'warn', d.verified ? 'Hausstandard bestätigt' : 'Noch nicht geprüft',
      d.verified ? 'Änderungen an Konzentration oder Einheit heben die Bestätigung auf.' : 'Vergleiche Wirkstoffmenge, Volumen und Dosiseinheit mit eurem Perfusor-Standard. Passe sie an und setze dann das Häkchen unten.')}
    <form class="card" id="edit" novalidate autocomplete="off">
      <div class="ea-field">
        <label class="ea-field__label" for="e-name">Name</label>
        <div class="ea-field__control"><input class="ea-field__input ea-field__input--text" id="e-name" value="${esc(d.name)}" placeholder="z. B. Levosimendan" maxlength="60"></div>
      </div>
      <div class="ea-field">
        <label class="ea-field__label" for="e-cat">Kategorie</label>
        <select class="select" id="e-cat">${CATEGORIES.map(c => `<option value="${c.id}" ${c.id === d.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
      </div>
      <div>
        <span class="ea-field__label">Spritzeninhalt</span>
        <div class="grid-2" style="margin-top:6px">
          <div class="ea-field">
            <label class="sr-only" for="e-amount">Wirkstoffmenge</label>
            <div class="ea-field__control"><input class="ea-field__input" id="e-amount" inputmode="decimal" value="${esc(d.amount === '' ? '' : C.formatInput(d.amount))}" placeholder="Menge">
              <label class="sr-only" for="e-unit">Wirkstoffeinheit</label>
              <select class="unit-select" id="e-unit">${amountUnits.map(u => `<option value="${u}" ${u === d.unit ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
          </div>
          <div class="ea-field">
            <label class="sr-only" for="e-volume">Volumen</label>
            <div class="ea-field__control"><input class="ea-field__input" id="e-volume" inputmode="decimal" value="${esc(C.formatInput(d.volume))}" placeholder="Volumen"><span class="ea-field__unit">ml</span></div>
          </div>
        </div>
        <span class="ea-field__hint" id="e-conc"></span>
      </div>
      <div class="ea-field">
        <label class="ea-field__label" for="e-dose">Standard-Dosiseinheit</label>
        <select class="select mono" id="e-dose">${unitOptions(d.unit, d.dose)}</select>
      </div>
      <div>
        <span class="ea-field__label">Plausibilitätsbereich <span class="muted" style="font-weight:400">(optional, in Standard-Dosiseinheit)</span></span>
        <div class="grid-2" style="margin-top:6px">
          <div class="ea-field"><label class="sr-only" for="e-lo">von</label><div class="ea-field__control"><input class="ea-field__input" id="e-lo" inputmode="decimal" placeholder="von" value="${d.range ? esc(C.formatInput(d.range[0])) : ''}"></div></div>
          <div class="ea-field"><label class="sr-only" for="e-hi">bis</label><div class="ea-field__control"><input class="ea-field__input" id="e-hi" inputmode="decimal" placeholder="bis" value="${d.range ? esc(C.formatInput(d.range[1])) : ''}"></div></div>
        </div>
        <span class="ea-field__hint">Außerhalb des Bereichs warnt der Rechner. Das ist ein Netz gegen Tippfehler, keine Dosierempfehlung.</span>
      </div>
      <div class="ea-field">
        <label class="ea-field__label" for="e-note">Hinweis <span class="muted" style="font-weight:400">(optional)</span></label>
        <div class="ea-field__control"><textarea class="ea-field__input ea-field__input--text" id="e-note" maxlength="500" placeholder="z. B. nur über ZVK">${esc(d.note)}</textarea></div>
      </div>
      <label class="check"><input type="checkbox" id="e-verified" ${d.verified ? 'checked' : ''}><span><b>Mit unserem Hausstandard abgeglichen</b><br><span class="small muted">Konzentration, Volumen und Dosiseinheit stimmen mit dem Perfusor-Standard der Abteilung überein.</span></span></label>
      <div id="e-error"></div>
      <div class="btn-row">
        <button class="ea-btn ea-btn--primary" type="submit">Speichern</button>
        <a class="ea-btn ea-btn--secondary" href="${isNew ? '#/' : `#/m/${d.id}`}">Abbrechen</a>
      </div>
    </form>
    ${isNew ? '' : `
    <div class="section">
      <button class="ea-btn ea-btn--danger" type="button" id="del">Medikament löschen</button>
      <div class="confirm-box" id="del-confirm" hidden>
        <p><b>${esc(d.name)}</b> wirklich löschen? Das lässt sich nur über „Auf Startliste zurücksetzen“ rückgängig machen.</p>
        <div class="btn-row"><button class="ea-btn ea-btn--primary" type="button" id="del-yes">Löschen</button><button class="ea-btn ea-btn--secondary" type="button" id="del-no">Behalten</button></div>
      </div>
    </div>`}`;

  const concHint = () => {
    const a = C.parseNum($('#e-amount').value), v = C.parseNum($('#e-volume').value), u = $('#e-unit').value;
    $('#e-conc').textContent = a > 0 && v > 0 ? `Konzentration: ${concText(a, u, v)}` : '';
  };
  $('#e-unit').addEventListener('change', () => {
    const fam = C.unitFamily($('#e-unit').value);
    const cur = $('#e-dose').value;
    $('#e-dose').innerHTML = unitOptions($('#e-unit').value, C.DOSE_UNITS[fam].includes(cur) ? cur : C.DOSE_UNITS[fam][0]);
    concHint();
  });
  $('#e-amount').addEventListener('input', concHint);
  $('#e-volume').addEventListener('input', concHint);
  concHint();

  let verifiedTouched = false;
  $('#e-verified').addEventListener('change', () => { verifiedTouched = true; });
  $('#edit').addEventListener('submit', (e) => {
    e.preventDefault();
    const errBox = $('#e-error');
    try {
      const name = $('#e-name').value.trim();
      const a = C.readNum($('#e-amount').value), v = C.readNum($('#e-volume').value);
      if (a.error) throw new Error('Wirkstoffmenge: ' + a.error);
      if (v.error) throw new Error('Volumen: ' + v.error);
      const loT = $('#e-lo').value.trim(), hiT = $('#e-hi').value.trim();
      let range = null;
      if (loT || hiT) {
        const lo = C.readNum(loT), hi = C.readNum(hiT);
        if (lo.error || hi.error || !Number.isFinite(lo.value) || !Number.isFinite(hi.value)) throw new Error('Bereich: beide Werte als Zahl eingeben oder beide leer lassen.');
        range = [lo.value, hi.value];
      }
      const next = {
        id: isNew ? store.newId(name || 'medikament') : d.id,
        name, cat: $('#e-cat').value,
        amount: a.value, unit: $('#e-unit').value, volume: v.value,
        dose: $('#e-dose').value, range, note: $('#e-note').value,
        verified: $('#e-verified').checked, custom: isNew || !!d.custom,
      };
      // Bestätigung fällt weg, wenn sich Kerndaten ändern und das Häkchen dabei nicht bewusst bestätigt wurde
      let msg = 'Gespeichert';
      if (!isNew && d.verified && next.verified && !verifiedTouched && (next.amount !== d.amount || next.unit !== d.unit || next.volume !== d.volume || next.dose !== d.dose)) {
        next.verified = false;
        msg = 'Gespeichert – Kerndaten geändert, bitte erneut bestätigen.';
      }
      const saved = store.saveDrug(next);
      delete session.perDrug[saved.id];
      toast(msg);
      location.hash = `#/m/${saved.id}`;
    } catch (err) {
      errBox.innerHTML = note('danger', 'Nicht gespeichert', esc(err.message));
      errBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });

  if (!isNew) {
    $('#del').addEventListener('click', () => { $('#del-confirm').hidden = false; $('#del').hidden = true; });
    $('#del-no').addEventListener('click', () => { $('#del-confirm').hidden = true; $('#del').hidden = false; });
    $('#del-yes').addEventListener('click', () => { store.deleteDrug(d.id); toast(`${d.name} gelöscht`); location.hash = '#/'; });
  }
}

// ---------- Ansicht: Einstellungen ----------
let installPrompt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; if (location.hash === '#/einstellungen') render(); });

function renderSettings() {
  setHeader({ back: true });
  document.title = 'Einstellungen · Perfusor';
  const total = store.drugs.length, verified = store.drugs.filter(d => d.verified).length;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const t = store.theme;

  view.innerHTML = `
    <a class="back" href="#/">${I.back}Alle Medikamente</a>
    <h1 class="heading">Einstellungen</h1>

    <section class="card section" aria-labelledby="s-theme">
      <h2 class="subhead" id="s-theme">Darstellung</h2>
      <div class="segmented segmented--3" role="group" aria-label="Farbschema">
        <button type="button" data-theme="light" aria-pressed="${t === 'light'}">Hell</button>
        <button type="button" data-theme="dark" aria-pressed="${t === 'dark'}">Dunkel</button>
        <button type="button" data-theme="system" aria-pressed="${t === 'system'}">System</button>
      </div>
      <p class="small muted">„Dunkel“ ist für gedimmte Räume gemacht: kein reines Weiß, gedämpfte Akzente.</p>
    </section>

    <section class="card section" aria-labelledby="s-lib">
      <h2 class="subhead" id="s-lib">Medikamente</h2>
      <div class="stat"><div class="meter" aria-hidden="true"><span style="width:${total ? (verified / total) * 100 : 0}%"></span></div><span class="small mono">${verified}/${total} bestätigt</span></div>
      <p class="small muted">Die Bibliothek liegt nur auf diesem Gerät. Mit Export und Import bringst du sie auf ein zweites Handy oder sicherst sie.</p>
      <div class="btn-row">
        <a class="ea-btn ea-btn--secondary ea-btn--sm" href="#/neu">${I.plus}Neues Medikament</a>
        <button class="ea-btn ea-btn--secondary ea-btn--sm" type="button" id="export">Exportieren</button>
        <label class="ea-btn ea-btn--secondary ea-btn--sm" for="import-file">Importieren</label>
        <input type="file" id="import-file" accept="application/json,.json" hidden>
      </div>
      <div id="import-msg"></div>
      <button class="ea-btn ea-btn--danger ea-btn--sm" type="button" id="reset" style="align-self:flex-start">Auf Startliste zurücksetzen</button>
      <div class="confirm-box" id="reset-confirm" hidden>
        <p>Alle Änderungen, eigenen Medikamente, Bestätigungen und Favoriten gehen verloren. Vorher exportieren?</p>
        <div class="btn-row"><button class="ea-btn ea-btn--primary ea-btn--sm" type="button" id="reset-yes">Zurücksetzen</button><button class="ea-btn ea-btn--secondary ea-btn--sm" type="button" id="reset-no">Abbrechen</button></div>
      </div>
    </section>

    <section class="card section" aria-labelledby="s-install">
      <h2 class="subhead" id="s-install">Als App installieren</h2>
      ${standalone ? note('ok', 'Installiert', 'Die App läuft vom Home-Bildschirm und funktioniert auch ohne Netz.')
        : installPrompt ? `<button class="ea-btn ea-btn--primary" type="button" id="install">App installieren</button>`
        : ios ? `<ol class="steps small"><li>In Safari unten auf <b>Teilen</b> tippen.</li><li><b>Zum Home-Bildschirm</b> wählen.</li><li>Mit <b>Hinzufügen</b> bestätigen.</li></ol>`
        : `<ol class="steps small"><li>Im Browser-Menü (⋮) <b>App installieren</b> bzw. <b>Zum Startbildschirm hinzufügen</b> wählen.</li><li>Bestätigen – die App startet dann im Vollbild und offline.</li></ol>`}
    </section>

    <section class="card section" aria-labelledby="s-about">
      <h2 class="subhead" id="s-about">Über</h2>
      <div class="ea-rows">
        <div class="ea-rows__row"><span class="ea-rows__key">Version</span><span class="ea-rows__val">${VERSION}</span></div>
        <div class="ea-rows__row"><span class="ea-rows__key">Formel</span><span class="ea-rows__val">ml/h = Dosis/h ÷ mg/ml</span></div>
        <div class="ea-rows__row"><span class="ea-rows__key">Speicher</span><span class="ea-rows__val">${store.persistent ? 'auf diesem Gerät' : 'nicht verfügbar'}</span></div>
      </div>
      ${store.persistent ? '' : note('warn', 'Speichern nicht möglich', 'Der Browser blockiert lokalen Speicher (z. B. privates Fenster). Änderungen gehen beim Schließen verloren.')}
      <p class="small muted">Einmal AINS · Perfusor rechnet Dosis und Laufrate für Spritzenpumpen. Das Körpergewicht wird nicht gespeichert. Die App sendet keine Daten.</p>
      <p class="small muted">Die Berechnung ersetzt nicht die klinische Beurteilung, die Fachinformation und den Hausstandard. Konzentration, Einheit und Laufrate vor Anwendung am Gerät gegenprüfen.</p>
    </section>`;

  $$('[data-theme]', view).forEach(b => b.addEventListener('click', () => { store.setTheme(b.dataset.theme); applyTheme(); renderSettings(); }));
  $('#export').addEventListener('click', () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `perfusor-bibliothek-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Bibliothek exportiert');
  });
  $('#import-file').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const n = store.importJSON(await f.text());
      session.perDrug = {};
      toast(`${n} Medikamente importiert`);
      renderSettings();
    } catch (err) {
      $('#import-msg').innerHTML = note('danger', 'Import fehlgeschlagen', esc(err.message));
    }
    e.target.value = '';
  });
  $('#reset').addEventListener('click', () => { $('#reset-confirm').hidden = false; $('#reset').hidden = true; });
  $('#reset-no').addEventListener('click', () => { $('#reset-confirm').hidden = true; $('#reset').hidden = false; });
  $('#reset-yes').addEventListener('click', () => { store.reset(); session.perDrug = {}; applyTheme(); toast('Startliste wiederhergestellt'); renderSettings(); });
  $('#install')?.addEventListener('click', async () => { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; renderSettings(); });
}

// ---------- Router ----------
function render() {
  const h = location.hash || '#/';
  let m;
  if ((m = h.match(/^#\/m\/([a-z0-9-]+)$/))) renderCalc(m[1]);
  else if ((m = h.match(/^#\/bearbeiten\/([a-z0-9-]+)$/))) renderEdit(m[1]);
  else if (h === '#/neu') renderEdit(null);
  else if (h === '#/einstellungen') renderSettings();
  else renderList();
}
addEventListener('hashchange', () => { render(); scrollTo(0, 0); });
applyTheme();
render();

// ---------- Offline / Updates ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    const offer = (w) => toast('Neue Version verfügbar.', { label: 'Neu laden', sticky: true, run: () => w.postMessage('skipWaiting') });
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); });
    });
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}
navigator.storage?.persist?.().catch(() => {});
