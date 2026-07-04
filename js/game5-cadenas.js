/**
 * game5-cadenas.js
 * Jeu 5 — Cadenas final
 *
 * Saisie d'un code à 4 chiffres via :
 *  - Pavé numérique tactile (numpad) — optimal mobile
 *  - Clavier physique avec auto-saut et retour arrière — desktop
 *
 * Le code attendu est la concaténation des chiffres des jeux 1 à 4,
 * récupérés depuis les footerDigit du GameManager.
 *
 * Si correct → confettis.
 * Si incorrect → shake + message d'erreur.
 */
(function () {

  const inputs     = Array.from(document.querySelectorAll('#slide-5 .code-input'));
  const lockVisual = document.getElementById('lockVisual');
  const lockIcon   = document.getElementById('lockIcon');
  const errorMsg   = document.getElementById('lockErrorMsg');
  const numpadBtns = document.querySelectorAll('#slide-5 .numpad-btn');

  let activeIndex = 0;

  /* ---------- Récupère le code attendu depuis les digits des jeux ----------
   * On lit les footerDigit-1 à footerDigit-4 peuplés par GameManager.
   */
  function getExpectedCode() {
    return [1, 2, 3, 4]
      .map(id => {
        const el = document.getElementById(`footerDigit-${id}`);
        return el ? el.textContent.trim() : '?';
      })
      .join('');
  }

  /* ---------- Focus / navigation entre inputs ---------- */
  function focusInput(idx) {
    if (idx < 0 || idx >= inputs.length) return;
    activeIndex = idx;
    inputs[idx].focus();
    inputs[idx].select();
  }

  /* ---------- Clavier physique ---------- */
  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (input.value) focusInput(idx + 1);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value) focusInput(idx - 1);
      else if (e.key === 'ArrowLeft')  focusInput(idx - 1);
      else if (e.key === 'ArrowRight') focusInput(idx + 1);
    });
    input.addEventListener('focus', () => { activeIndex = idx; });
  });

  /* ---------- Pavé numérique tactile ---------- */
  numpadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.num;
      if (val === 'clear') {
        inputs.forEach(i => i.value = '');
        focusInput(0);
      } else if (val === 'back') {
        if (inputs[activeIndex]?.value) {
          inputs[activeIndex].value = '';
        } else {
          focusInput(activeIndex - 1);
          if (inputs[activeIndex]) inputs[activeIndex].value = '';
        }
      } else {
        if (inputs[activeIndex]) {
          inputs[activeIndex].value = val;
          focusInput(activeIndex + 1);
        }
      }
    });
  });

  /* ---------- Vérification du code ---------- */
  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (input.value) {
        if (idx < inputs.length - 1) {
          focusInput(idx + 1);
        } else {
          // Dernier chiffre saisi → vérification automatique
          checkCode();
        }
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value) focusInput(idx - 1);
      else if (e.key === 'ArrowLeft')  focusInput(idx - 1);
      else if (e.key === 'ArrowRight') focusInput(idx + 1);
    });
    input.addEventListener('focus', () => { activeIndex = idx; });
  });

  function checkCode() {
    const entered  = inputs.map(i => i.value || '?').join('');
    const expected = getExpectedCode();

    if (entered === expected && !entered.includes('?')) {
      lockVisual.classList.remove('shake');
      lockVisual.classList.add('opened');
      lockIcon.classList.replace('fa-lock', 'fa-lock-open');
      errorMsg.classList.add('d-none');
      if (typeof Confetti !== 'undefined') Confetti.launch();

      // Affiche la récompense après un court délai (laisse les confettis démarrer)
      setTimeout(() => window.showReward(), 1200);

    } else {
      lockVisual.classList.remove('opened');
      void lockVisual.offsetWidth;
      lockVisual.classList.add('shake');
      errorMsg.classList.remove('d-none');
      setTimeout(() => {
        inputs.forEach(i => i.value = '');
        errorMsg.classList.add('d-none');
        lockVisual.classList.remove('shake');
        focusInput(0);
      }, 1200);
    }
  }

  window.showReward = function (url) {
    const REWARD_URL = 'https://listesdecadeaux.com/l-sroqtzJ/liste-de-naissance/';
    const overlay    = document.getElementById('rewardOverlay');
    const rewardEl   = document.getElementById('rewardUrl');
    rewardEl.href        = url || REWARD_URL;
    rewardEl.textContent = url || REWARD_URL;
    overlay.classList.remove('d-none');
  };
})();
