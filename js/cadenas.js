/**
 * cadenas.js
 * Gère la saisie du code final (4 chiffres) via :
 *  - Inputs texte avec auto-saut au champ suivant (clavier physique, desktop ET mobile)
 *  - Pavé numérique tactile personnalisé (numpad) pour une expérience mobile optimale
 * Vérifie le code par rapport à EnigmaState.getCode() et déclenche confettis si correct.
 */
(function () {
  const inputs = Array.from(document.querySelectorAll('.code-input'));
  const tryBtn = document.getElementById('tryLockBtn');
  const lockVisual = document.getElementById('lockVisual');
  const openedMsg = document.getElementById('lockOpenedMsg');
  const errorMsg = document.getElementById('lockErrorMsg');
  const numpadBtns = document.querySelectorAll('.numpad-btn');

  let activeIndex = 0;

  function focusInput(idx) {
    if (idx < 0 || idx >= inputs.length) return;
    activeIndex = idx;
    inputs[idx].focus();
    inputs[idx].select();
  }

  /* ---------- Saisie clavier physique ---------- */
  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (input.value) focusInput(idx + 1);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value) {
        focusInput(idx - 1);
      } else if (e.key === 'ArrowLeft') {
        focusInput(idx - 1);
      } else if (e.key === 'ArrowRight') {
        focusInput(idx + 1);
      } else if (e.key === 'Enter') {
        tryBtn.click();
      }
    });

    input.addEventListener('focus', () => { activeIndex = idx; });
  });

  /* ---------- Pavé numérique tactile ---------- */
  numpadBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.num;
      if (val === 'clear') {
        inputs.forEach(i => i.value = '');
        focusInput(0);
      } else if (val === 'back') {
        if (inputs[activeIndex].value) {
          inputs[activeIndex].value = '';
        } else {
          focusInput(activeIndex - 1);
          inputs[activeIndex].value = '';
        }
      } else {
        inputs[activeIndex].value = val;
        focusInput(activeIndex + 1);
      }
    });
  });

  /* ---------- Vérification du code ---------- */
  tryBtn.addEventListener('click', () => {
    const entered = inputs.map(i => i.value || '?').join('');
    const expected = EnigmaState.getCode();

    if (entered === expected && !entered.includes('?')) {
      lockVisual.classList.remove('shake');
      lockVisual.classList.add('opened');
      document.getElementById('lockIcon').classList.remove('fa-lock');
      document.getElementById('lockIcon').classList.add('fa-lock-open');
      openedMsg.classList.remove('d-none');
      errorMsg.classList.add('d-none');
      tryBtn.disabled = true;
      Confetti.launch();
    } else {
      lockVisual.classList.remove('opened');
      lockVisual.classList.add('shake');
      errorMsg.classList.remove('d-none');
      setTimeout(() => lockVisual.classList.remove('shake'), 400);
    }
  });
})();
