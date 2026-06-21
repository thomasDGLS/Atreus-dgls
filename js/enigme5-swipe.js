/**
 * enigme5-swipe.js
 * Détection de gestes de balayage (swipe) :
 *  - Mobile : Pointer Events (pointerdown -> pointerup) avec calcul du vecteur de déplacement
 *  - Desktop : touches fléchées du clavier (keydown) après focus sur la zone
 * Ordre attendu : Haut, Droite, Bas, Gauche
 */
(function () {
  const ENIGMA_ID = 5;
  const DIGIT = 1;
  const EXPECTED = ['up', 'right', 'down', 'left'];
  const SWIPE_THRESHOLD = 40; // pixels minimum pour considérer que c'est un swipe

  const zone = document.getElementById('swipeZone');
  const progressText = document.getElementById('swipeProgressText');

  let progress = 0;
  let startX = 0, startY = 0;

  function registerGesture(direction) {
    if (progress >= EXPECTED.length) return;
    if (direction === EXPECTED[progress]) {
      progress++;
      flash();
      progressText.textContent = `${progress} / ${EXPECTED.length} gestes`;
      if (progress === EXPECTED.length) {
        onComplete();
      }
    } else {
      // Mauvais geste : on recommence depuis le début
      progress = 0;
      progressText.textContent = `0 / ${EXPECTED.length} gestes (erreur, on recommence)`;
      flash();
    }
  }

  function flash() {
    zone.classList.add('flash');
    setTimeout(() => zone.classList.remove('flash'), 150);
  }

  function onComplete() {
    document.getElementById('result-5').classList.remove('d-none');
    document.getElementById('digit-5').textContent = DIGIT;
    document.getElementById('badge-5').classList.remove('d-none');
    document.querySelector('[data-enigma="5"]').classList.add('solved');
    EnigmaState.solve(ENIGMA_ID, DIGIT);
  }

  /* ---------- Tactile : Pointer Events ---------- */
  zone.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });

  zone.addEventListener('pointerup', (e) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return; // pas un swipe

    let direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }
    registerGesture(direction);
  });

  /* ---------- Desktop : flèches clavier ---------- */
  zone.addEventListener('keydown', (e) => {
    const map = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right'
    };
    if (map[e.key]) {
      e.preventDefault();
      registerGesture(map[e.key]);
    }
  });

  /* Restauration */
  if (EnigmaState.isSolved(ENIGMA_ID)) {
    progress = EXPECTED.length;
    progressText.textContent = `${EXPECTED.length} / ${EXPECTED.length} gestes`;
    document.getElementById('result-5').classList.remove('d-none');
    document.getElementById('digit-5').textContent = EnigmaState.getDigit(ENIGMA_ID);
    document.getElementById('badge-5').classList.remove('d-none');
    document.querySelector('[data-enigma="5"]').classList.add('solved');
  }
})();
