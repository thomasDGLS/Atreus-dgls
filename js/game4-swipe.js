/**
 * game4-swipe.js
 * Jeu 4 — Balayages dans l'ordre imposé : ↑ ↑ ← → ↑ ↓
 *
 * Mobile  : Pointer Events (calcul du vecteur pointerdown → pointerup)
 * Desktop : Touches fléchées du clavier après focus sur la zone
 *
 * Des indicateurs (points) montrent la progression en temps réel.
 * Une erreur remet tout à zéro avec un flash rouge.
 */
(function () {
  const GAME_ID   = 4;
  const DIGIT     = 2;
  const EXPECTED  = ['up', 'up', 'left', 'right', 'up', 'down'];
  const THRESHOLD = 35; // pixels minimum pour valider un swipe

  const zone          = document.getElementById('swipeZone');
  const progressText  = document.getElementById('swipeProgressText');
  const indicatorsCtn = document.getElementById('swipeIndicators');

  if (!zone) return;

  let progress = 0;
  let startX = 0, startY = 0;

  /* ---------- Création des indicateurs (un point par geste) ---------- */
  function buildIndicators() {
    indicatorsCtn.innerHTML = '';
    EXPECTED.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'swipe-dot';
      dot.id = `dot-${i}`;
      indicatorsCtn.appendChild(dot);
    });
  }
  buildIndicators();

  function updateIndicator(index, success) {
    const dot = document.getElementById(`dot-${index}`);
    if (dot) dot.classList.add(success ? 'done' : 'error');
  }

  function resetIndicators() {
    document.querySelectorAll('.swipe-dot').forEach(d => {
      d.classList.remove('done', 'error');
    });
  }

  /* ---------- Logique de geste ---------- */
  function registerGesture(direction) {
    if (progress >= EXPECTED.length) return;

    if (direction === EXPECTED[progress]) {
      updateIndicator(progress, true);
      progress++;
      flash('success');
      progressText.textContent = `${progress} / ${EXPECTED.length}`;

      if (progress === EXPECTED.length) {
        setTimeout(onGameComplete, 300);
      }
    } else {
      // Erreur : flash rouge, on remet à zéro
      updateIndicator(progress, false);
      flash('error');
      setTimeout(() => {
        progress = 0;
        progressText.textContent = `0 / ${EXPECTED.length}`;
        resetIndicators();
      }, 400);
    }
  }

  function flash(type) {
    zone.classList.add(type === 'error' ? 'error' : 'flash');
    setTimeout(() => zone.classList.remove('flash', 'error'), 200);
  }

  function onGameComplete() {
    zone.style.pointerEvents = 'none';
    document.dispatchEvent(new CustomEvent('game:complete', {
      detail: { gameId: GAME_ID, digit: DIGIT }
    }));
  }

  /* ---------- Mobile : Pointer Events ---------- */
  zone.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });

  zone.addEventListener('pointerup', (e) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;

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
      ArrowUp: 'up', ArrowDown: 'down',
      ArrowLeft: 'left', ArrowRight: 'right'
    };
    if (map[e.key]) {
      e.preventDefault();
      registerGesture(map[e.key]);
    }
  });
})();
