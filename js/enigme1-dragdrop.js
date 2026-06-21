/**
 * enigme1-dragdrop.js
 * Démontre :
 *  - HTML5 Drag and Drop API (dragstart, dragover, drop) pour desktop
 *  - Pointer Events (pointerdown/move/up) pour un comportement identique au tactile
 *    car l'API HTML5 Drag&Drop est mal supportée sur mobile.
 */
(function () {
  const ENIGMA_ID = 1;
  const DIGIT = 7; // chiffre révélé par cette énigme

  const keys = document.querySelectorAll('.key-item');
  const locks = document.querySelectorAll('.lock-item');
  let solvedLocks = new Set();

  function checkAllSolved() {
    if (solvedLocks.size === locks.length) {
      document.getElementById('result-1').classList.remove('d-none');
      document.getElementById('digit-1').textContent = DIGIT;
      document.getElementById('badge-1').classList.remove('d-none');
      document.querySelector('[data-enigma="1"]').classList.add('solved');
      EnigmaState.solve(ENIGMA_ID, DIGIT);
    }
  }

  function tryUnlock(keyEl, lockEl) {
    const keyType = keyEl.dataset.key;
    const lockType = lockEl.dataset.lock;
    if (keyType === lockType && !solvedLocks.has(lockType)) {
      lockEl.classList.add('unlocked');
      lockEl.textContent = '🔓';
      keyEl.classList.add('placed');
      keyEl.setAttribute('draggable', 'false');
      solvedLocks.add(lockType);
      checkAllSolved();
      return true;
    }
    return false;
  }

  /* ---------- Desktop : HTML5 Drag and Drop API ---------- */
  keys.forEach((key) => {
    key.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', key.id);
      key.classList.add('dragging');
    });
    key.addEventListener('dragend', () => key.classList.remove('dragging'));
  });

  locks.forEach((lock) => {
    lock.addEventListener('dragover', (e) => {
      e.preventDefault(); // nécessaire pour autoriser le drop
      lock.classList.add('drag-over');
    });
    lock.addEventListener('dragleave', () => lock.classList.remove('drag-over'));
    lock.addEventListener('drop', (e) => {
      e.preventDefault();
      lock.classList.remove('drag-over');
      const keyId = e.dataTransfer.getData('text/plain');
      const keyEl = document.getElementById(keyId);
      if (keyEl) tryUnlock(keyEl, lock);
    });
  });

  /* ---------- Mobile / tactile : Pointer Events ----------
   * On crée un élément "fantôme" qui suit le doigt, puis au relâchement
   * on détecte si on est au-dessus d'une serrure via elementFromPoint.
   */
  let ghost = null;
  let activeKey = null;

  keys.forEach((key) => {
    key.addEventListener('pointerdown', (e) => {
      if (key.classList.contains('placed')) return;
      activeKey = key;
      key.classList.add('dragging');

      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.textContent = key.textContent;
      document.body.appendChild(ghost);
      moveGhost(e.clientX, e.clientY);

      // Capture le pointeur pour continuer à recevoir les events même hors de l'élément
      key.setPointerCapture(e.pointerId);
    });

    key.addEventListener('pointermove', (e) => {
      if (!ghost) return;
      moveGhost(e.clientX, e.clientY);
    });

    key.addEventListener('pointerup', (e) => {
      if (!activeKey) return;
      const dropTarget = document
        .elementsFromPoint(e.clientX, e.clientY)
        .find((el) => el.classList.contains('lock-item'));

      if (dropTarget) tryUnlock(activeKey, dropTarget);

      cleanupGhost();
    });

    key.addEventListener('pointercancel', cleanupGhost);
  });

  function moveGhost(x, y) {
    if (!ghost) return;
    ghost.style.left = x + 'px';
    ghost.style.top = y + 'px';
  }

  function cleanupGhost() {
    if (activeKey) activeKey.classList.remove('dragging');
    if (ghost) { ghost.remove(); ghost = null; }
    activeKey = null;
  }

  /* Restauration si déjà résolu précédemment */
  if (EnigmaState.isSolved(ENIGMA_ID)) {
    document.getElementById('result-1').classList.remove('d-none');
    document.getElementById('digit-1').textContent = EnigmaState.getDigit(ENIGMA_ID);
    document.getElementById('badge-1').classList.remove('d-none');
    document.querySelector('[data-enigma="1"]').classList.add('solved');
    keys.forEach(k => { k.classList.add('placed'); k.setAttribute('draggable', 'false'); });
    locks.forEach(l => { l.classList.add('unlocked'); l.textContent = '🔓'; });
  }
})();
