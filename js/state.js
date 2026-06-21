/**
 * state.js
 * Gestion centralisée de la progression des énigmes.
 * Stockage local (localStorage) avec API simple : EnigmaState.solve(id, digit)
 */

const EnigmaState = (() => {
  const STORAGE_KEY = 'enigmes_progress_v1';
  const TOTAL = 5;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { digits: {} };
    } catch (e) {
      return { digits: {} };
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  let data = load();

  function solve(enigmaId, digit) {
    data.digits[enigmaId] = String(digit);
    save(data);
    document.dispatchEvent(new CustomEvent('enigme:solved', {
      detail: { enigmaId, digit, count: Object.keys(data.digits).length, total: TOTAL }
    }));
  }

  function isSolved(enigmaId) {
    return Object.prototype.hasOwnProperty.call(data.digits, enigmaId);
  }

  function getDigit(enigmaId) {
    return data.digits[enigmaId] ?? null;
  }

  function getCode() {
    // Concatène les chiffres dans l'ordre des énigmes 1 -> 5... ici on n'utilise que 4 chiffres (1 à 4)
    // pour le cadenas final à 4 chiffres. Le 5e sert d'énigme "bonus" indépendante.
    return [1, 2, 3, 4].map(id => data.digits[id] ?? '?').join('');
  }

  function reset() {
    data = { digits: {} };
    save(data);
  }

  function progressCount() {
    return Object.keys(data.digits).length;
  }

  return { solve, isSolved, getDigit, getCode, reset, progressCount, TOTAL };
})();
