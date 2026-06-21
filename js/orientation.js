/**
 * orientation.js
 * Détecte si l'appareil est un smartphone (écran tactile + petite diagonale)
 * et, si oui, impose le mode paysage avant de laisser passer le contenu.
 *
 * Sur desktop/laptop (pas d'écran tactile "coarse" ou grand écran), la
 * contrainte ne s'applique pas : on ne bloque jamais un utilisateur PC.
 *
 * Expose OrientationGuard avec deux callbacks :
 *   - onBlocked()  : appelé quand l'écran doit être bloqué (portrait sur mobile)
 *   - onAllowed()  : appelé quand l'affichage est autorisé (paysage, ou desktop)
 */
const OrientationGuard = (() => {
  const rotateScreen = document.getElementById('rotateScreen');

  // Un "vrai" smartphone : pointeur grossier (doigt) ET petit écran.
  // Cela évite de bloquer les tablettes en mode bureau ou les laptops tactiles larges.
  function isMobilePhone() {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const smallScreen = Math.min(window.innerWidth, window.innerHeight) <= 600;
    return coarsePointer && smallScreen;
  }

  function isPortrait() {
    return window.matchMedia('(orientation: portrait)').matches;
  }

  let onBlocked = () => {};
  let onAllowed = () => {};

  function evaluate() {
    const mustBlock = isMobilePhone() && isPortrait();
    if (mustBlock) {
      rotateScreen.classList.remove('d-none');
      onBlocked();
    } else {
      rotateScreen.classList.add('d-none');
      onAllowed();
    }
  }

  function init(callbacks = {}) {
    onBlocked = callbacks.onBlocked || onBlocked;
    onAllowed = callbacks.onAllowed || onAllowed;

    // Réévalue à chaque changement d'orientation et de taille de fenêtre
    window.matchMedia('(orientation: portrait)').addEventListener('change', evaluate);
    window.addEventListener('resize', evaluate);

    evaluate();
  }

  return { init, isMobilePhone, isPortrait };
})();
