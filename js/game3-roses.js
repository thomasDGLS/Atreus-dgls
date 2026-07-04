/**
 * game3-roses.js
 * Jeu 3 — Peins toutes les roses en rouge
 *
 * Clic/tap sur chaque rose pour la peindre (data-painted + filtre CSS).
 * Quand toutes sont peintes → coffre apparaît.
 * Clic sur le coffre → dispatch 'game:complete'.
 */
(function () {
  const GAME_ID = 3;
  const DIGIT   = 4;

  const roses   = document.querySelectorAll('#rosesZone .rose');
  const chest   = document.getElementById('chestIcon');

  if (!roses.length || !chest) return;

  function allPainted() {
    return Array.from(roses).every(r => r.dataset.painted === '1');
  }

  roses.forEach(rose => {
    rose.addEventListener('click', () => {
      if (rose.dataset.painted === '1') return;
      rose.dataset.painted = '1';
      rose.textContent = '🌹';
      if (allPainted()) chest.classList.remove('d-none');
    });
  });

  chest.addEventListener('click', () => {
    chest.style.pointerEvents = 'none';
    document.dispatchEvent(new CustomEvent('game:complete', {
      detail: { gameId: GAME_ID, digit: DIGIT }
    }));
  });
})();
