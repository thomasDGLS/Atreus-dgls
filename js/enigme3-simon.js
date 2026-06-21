/**
 * enigme3-simon.js
 * Jeu de mémoire "Simon" : la machine affiche une séquence de couleurs (allumage temporisé),
 * le joueur doit la reproduire en cliquant / tapant dans le même ordre.
 * Fonctionne identiquement souris et tactile (event "click" standard).
 */
(function () {
  const ENIGMA_ID = 3;
  const DIGIT = 9;
  const SEQUENCE_LENGTH = 4;

  const buttons = document.querySelectorAll('.simon-btn');
  const startBtn = document.getElementById('simonStart');

  let sequence = [];
  let playerInput = [];
  let acceptingInput = false;

  function randomSequence(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 4));
  }

  function lightUp(index, duration = 400) {
    return new Promise((resolve) => {
      const btn = buttons[index];
      btn.classList.add('lit');
      setTimeout(() => {
        btn.classList.remove('lit');
        resolve();
      }, duration);
    });
  }

  async function playSequence() {
    acceptingInput = false;
    startBtn.disabled = true;
    for (const idx of sequence) {
      await lightUp(idx, 450);
      await new Promise(r => setTimeout(r, 180)); // petite pause entre deux flashs
    }
    acceptingInput = true;
    startBtn.disabled = false;
  }

  startBtn.addEventListener('click', () => {
    sequence = randomSequence(SEQUENCE_LENGTH);
    playerInput = [];
    playSequence();
  });

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!acceptingInput) return;
      const color = parseInt(btn.dataset.color, 10);
      lightUp(color, 200);
      playerInput.push(color);

      // Vérifie en direct si l'entrée correspond toujours à la séquence attendue
      const currentIndex = playerInput.length - 1;
      if (playerInput[currentIndex] !== sequence[currentIndex]) {
        // Erreur : on relance une nouvelle séquence
        acceptingInput = false;
        playerInput = [];
        flashError();
        return;
      }

      if (playerInput.length === sequence.length) {
        acceptingInput = false;
        onSequenceComplete();
      }
    });
  });

  function flashError() {
    buttons.forEach(b => b.classList.add('lit'));
    setTimeout(() => buttons.forEach(b => b.classList.remove('lit')), 150);
  }

  function onSequenceComplete() {
    document.getElementById('result-3').classList.remove('d-none');
    document.getElementById('digit-3').textContent = DIGIT;
    document.getElementById('badge-3').classList.remove('d-none');
    document.querySelector('[data-enigma="3"]').classList.add('solved');
    startBtn.disabled = true;
    startBtn.textContent = 'Résolu !';
    EnigmaState.solve(ENIGMA_ID, DIGIT);
  }

  /* Restauration */
  if (EnigmaState.isSolved(ENIGMA_ID)) {
    document.getElementById('result-3').classList.remove('d-none');
    document.getElementById('digit-3').textContent = EnigmaState.getDigit(ENIGMA_ID);
    document.getElementById('badge-3').classList.remove('d-none');
    document.querySelector('[data-enigma="3"]').classList.add('solved');
    startBtn.disabled = true;
    startBtn.textContent = 'Résolu !';
  }
})();
