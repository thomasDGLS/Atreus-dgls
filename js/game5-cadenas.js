/**
 * game5-cadenas.js (Anciennement game4)
 * Cadenas à 4 chiffres (Code: 2026)
 */
(function () {
  // Sélectionne les inputs de la nouvelle slide 5
  const inputs     = Array.from(document.querySelectorAll('#slide-5 .code-input'));
  const lockVisual = document.getElementById('lockVisual');
  const lockIcon   = document.getElementById('lockIcon');
  const errorMsg   = document.getElementById('lockErrorMsg');
  const toggle = document.getElementById('progressToggle');
  const slide  = document.getElementById('slide-5');

  if (!inputs.length || !lockVisual) return;

  let activeIndex = 0;

  /* ---------- Récupère le code attendu depuis les 4 footerDigits ---------- */
  function getExpectedCode() {
    // Vérifie les jeux 1, 2, 3 et 4
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

  /* ---------- Saisie clavier ---------- */
  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (input.value) {
        if (idx < inputs.length - 1) {
          focusInput(idx + 1);
        } else {
          // 4ème chiffre saisi → vérification automatique
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

  /* ---------- Vérification du code ---------- */
  function checkCode() {
    const entered  = inputs.map(i => i.value || '?').join('');
    const expected = getExpectedCode(); // Devrait retourner "2026" si tout est gagné

    // Sécurité supplémentaire : on force la validation si entered === "2026"
    if ((entered === expected && !entered.includes('?')) || entered === "2026") {
      // ✅ Succès
      lockVisual.classList.remove('shake');
      toggle?.classList.remove('bounce-hint');
      lockVisual.classList.add('opened');
      lockIcon.classList.replace('fa-lock', 'fa-lock-open');
      errorMsg.classList.add('d-none');
      if (typeof Confetti !== 'undefined') Confetti.launch();
      setTimeout(() => {
        if (typeof window.showReward === 'function') window.showReward();
      }, 1200);
    } else {
      // ❌ Erreur
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

  /* -------- Vérification si on est sur la slide 5 alors on bonceHint l'aide pour retrouver le code ----- */
  slide.addEventListener('transitionend', (e) => {
    // transitionend se déclenche aussi sur exit-left (sortie)
    // on vérifie que la slide est bien active (visible) avant de lancer
    if (e.propertyName === 'transform' && slide.classList.contains('active')) {
      setTimeout(() => toggle?.classList.add('bounce-hint'), 300);
    }
    // Quand la slide quitte l'écran, on retire l'animation
    if (!slide.classList.contains('active')) {
      toggle?.classList.remove('bounce-hint');
    }
  });

  window.showReward = function (url) {
    const REWARD_URL = 'https://listesdecadeaux.com/l-sroqtzJ/liste-de-naissance/';
    const overlay  = document.getElementById('rewardOverlay');
    const rewardEl = document.getElementById('rewardUrl');
    if (!overlay || !rewardEl) return;
    rewardEl.href        = url || REWARD_URL;
    rewardEl.textContent = url || REWARD_URL;
    overlay.classList.remove('d-none');
  };
})();