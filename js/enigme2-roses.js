/**
 * enigme2-roses.js
 * Clic simple (click event, fonctionne nativement souris ET tactile)
 * sur chaque rose pour la "peindre" en rouge (toggle data-painted + classe CSS).
 * Quand toutes les roses sont rouges -> affichage d'un coffre.
 * Clic sur le coffre -> révèle le chiffre de l'énigme.
 */
(function () {
  const ENIGMA_ID = 2;
  const DIGIT = 3;

  const roses = document.querySelectorAll('#rosesZone .rose');
  const chest = document.getElementById('chestIcon');

  function allPainted() {
    return Array.from(roses).every(r => r.dataset.painted === '1');
  }

  roses.forEach((rose) => {
    rose.addEventListener('click', () => {
      if (rose.dataset.painted === '1') return; // déjà peinte, on ne revient pas en arrière
      rose.dataset.painted = '1';
      rose.textContent = '🌹';

      if (allPainted()) {
        chest.classList.remove('d-none');
      }
    });
  });

  chest.addEventListener('click', () => {
    document.getElementById('result-2').classList.remove('d-none');
    document.getElementById('digit-2').textContent = DIGIT;
    document.getElementById('badge-2').classList.remove('d-none');
    document.querySelector('[data-enigma="2"]').classList.add('solved');
    chest.style.pointerEvents = 'none';
    EnigmaState.solve(ENIGMA_ID, DIGIT);
  });

  /* Restauration */
  if (EnigmaState.isSolved(ENIGMA_ID)) {
    roses.forEach(r => { r.dataset.painted = '1'; r.textContent = '🌹'; });
    chest.classList.remove('d-none');
    chest.style.pointerEvents = 'none';
    document.getElementById('result-2').classList.remove('d-none');
    document.getElementById('digit-2').textContent = EnigmaState.getDigit(ENIGMA_ID);
    document.getElementById('badge-2').classList.remove('d-none');
    document.querySelector('[data-enigma="2"]').classList.add('solved');
  }
})();
