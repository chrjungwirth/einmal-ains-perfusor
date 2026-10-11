import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../js/calc.js';

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

test('Noradrenalin 5 mg/50 ml, 0,1 µg/kg/min, 80 kg → 4,8 ml/h', () => {
  const r = C.rateFromDose({ dose: 0.1, doseUnit: 'µg/kg/min', weightKg: 80, amount: 5, amountUnit: 'mg', volumeMl: 50 });
  close(r, 4.8);
  assert.equal(C.formatRate(r), '4,8');
});

test('Umkehrung: 4,8 ml/h → 0,1 µg/kg/min', () => {
  const d = C.doseFromRate({ rate: 4.8, doseUnit: 'µg/kg/min', weightKg: 80, amount: 5, amountUnit: 'mg', volumeMl: 50 });
  close(d, 0.1);
});

test('Propofol 2 % 1000 mg/50 ml, 2 mg/kg/h, 70 kg → 7 ml/h', () => {
  close(C.rateFromDose({ dose: 2, doseUnit: 'mg/kg/h', weightKg: 70, amount: 1000, amountUnit: 'mg', volumeMl: 50 }), 7);
});

test('Sufentanil 250 µg/50 ml, 0,5 µg/kg/h, 80 kg → 8 ml/h', () => {
  close(C.rateFromDose({ dose: 0.5, doseUnit: 'µg/kg/h', weightKg: 80, amount: 250, amountUnit: 'µg', volumeMl: 50 }), 8);
});

test('Heparin 25.000 IE/50 ml, 1000 IE/h → 2 ml/h', () => {
  close(C.rateFromDose({ dose: 1000, doseUnit: 'IE/h', amount: 25000, amountUnit: 'IE', volumeMl: 50 }), 2);
});

test('Vasopressin 40 IE/40 ml, 0,03 IE/min → 1,8 ml/h', () => {
  close(C.rateFromDose({ dose: 0.03, doseUnit: 'IE/min', amount: 40, amountUnit: 'IE', volumeMl: 40 }), 1.8);
});

test('Amiodaron 900 mg/50 ml, 900 mg/24 h → 2,08 ml/h', () => {
  close(C.rateFromDose({ dose: 900, doseUnit: 'mg/d', amount: 900, amountUnit: 'mg', volumeMl: 50 }), 50 / 24);
});

test('KCl 50 mmol/50 ml, 10 mmol/h → 10 ml/h', () => {
  close(C.rateFromDose({ dose: 10, doseUnit: 'mmol/h', amount: 50, amountUnit: 'mmol', volumeMl: 50 }), 10);
});

test('Gewichtsbezogen ohne Gewicht → NaN', () => {
  assert.ok(Number.isNaN(C.rateFromDose({ dose: 0.1, doseUnit: 'µg/kg/min', amount: 5, amountUnit: 'mg', volumeMl: 50 })));
});

test('Falsche Einheitenfamilie wirft', () => {
  assert.throws(() => C.rateFromDose({ dose: 1, doseUnit: 'IE/h', amount: 5, amountUnit: 'mg', volumeMl: 50 }));
});

test('Einheitenumrechnung µg/kg/min ↔ mg/h', () => {
  close(C.convertDose(0.1, 'µg/kg/min', 'mg/h', 80), 0.48);
  close(C.convertDose(0.48, 'mg/h', 'µg/kg/min', 80), 0.1);
  close(C.convertDose(1, 'µg/min', 'µg/h'), 60);
});

test('Zahlen lesen', () => {
  assert.equal(C.parseNum('0,1'), 0.1);
  assert.equal(C.parseNum('0.1'), 0.1);
  assert.equal(C.parseNum(' 80 '), 80);
  assert.equal(C.parseNum('25000'), 25000);
  assert.equal(C.parseNum('25.000,5'), 25000.5);
  assert.equal(C.parseNum('0.125'), 0.125);
  assert.ok(Number.isNaN(C.parseNum('')));
  assert.ok(Number.isNaN(C.parseNum('abc')));
  assert.ok(Number.isNaN(C.parseNum('1,2,3')));
  assert.ok(Number.isNaN(C.parseNum('-5')));
});

test('Mehrdeutiger Tausenderpunkt wird abgelehnt', () => {
  const r = C.readNum('25.000');
  assert.ok(Number.isNaN(r.value));
  assert.match(r.error, /mehrdeutig/);
  assert.ok(C.readNum('1.250').error);
});

test('Formatierung', () => {
  assert.equal(C.formatRate(4.8), '4,8');
  assert.equal(C.formatRate(0.456), '0,46');
  assert.equal(C.formatRate(12.04), '12,0');
  assert.equal(C.formatDose(0.1), '0,1');
  assert.equal(C.formatDose(0.12345), '0,123');
  assert.equal(C.formatDose(1234.5), '1.230');
  assert.equal(C.formatInput(25000), '25000');
  assert.equal(C.formatInput(0.05), '0,05');
  assert.equal(C.formatHours(10.4166), '10 h 25 min');
  assert.equal(C.formatHours(0.104), '6 min');
  assert.equal(C.displayUnit('mg/d'), 'mg/24 h');
});

test('Dosistabelle: schöne Stufen', () => {
  assert.deepEqual(C.niceSteps(0.05, 0.5, 8), [0.05, 0.1, 0.2, 0.3, 0.4, 0.5]);
  const s = C.niceSteps(0.01, 1, 8);
  assert.ok(s.length >= 5 && s.length <= 10, JSON.stringify(s));
  assert.equal(s[0], 0.01);
  assert.ok(s.at(-1) <= 1 + 1e-9);
});

test('Plausibilität', () => {
  const lv = (o) => C.checks(o).map(x => x.level);
  assert.deepEqual(lv({ rate: 150, dose: 1, range: [0, 10] }), ['danger']);
  assert.deepEqual(lv({ rate: 5, dose: 0.5, range: [0.01, 1], volumeMl: 50 }), []);
  assert.deepEqual(lv({ rate: 5, dose: 2, range: [0.01, 1], volumeMl: 50 }), ['warn']);
  assert.deepEqual(lv({ rate: 5, dose: 5, range: [0.01, 1], volumeMl: 50 }), ['danger']);
  assert.deepEqual(lv({ rate: 5, dose: 1, weightKg: 800, weightNeeded: true, range: [0, 2], volumeMl: 50 }), ['danger']);
});
