/**
 * enigme4-puzzle.js
 * Pièces numérotées mélangées à glisser-déposer dans des cases (slots) dans l'ordre croissant.
 * Desktop : HTML5 Drag and Drop API.
 * Mobile  : Pointer Events (même technique que l'énigme 1, réutilisable).
 */
(function () {
  const ENIGMA_ID = 4;
  const DIGIT = 5;
  const ORDER = [1, 2, 3, 4];

  const slots = document.querySelectorAll('#puzzleGrid .puzzle-slot');
  const piecesContainer = document.getElementById('puzzlePieces');

  // Génère les pièces dans un ordre mélangé
  const shuffled = [...ORDER].sort(() => Math.random() - 0.5);
  shuffled.forEach((num) => {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    piece.textContent = num;
    piece.dataset.value = num;
    piece.setAttribute('draggable', 'true');
    piece.id = 'piece-' + num;
    piecesContainer.appendChild(piece);
  });

  function checkCompletion() {
    const filled = Array.from(slots).every(s => s.children.length > 0);
    if (!filled) return;
    const order = Array.from(slots).map(s => s.children[0].dataset.value);
    const correct = order.every((v, i) => parseInt(v, 10) === ORDER[i]);
    if (correct) {
      document.getElementById('result-4').classList.remove('d-none');
      document.getElementById('digit-4').textContent = DIGIT;
      document.getElementById('badge-4').classList.remove('d-none');
      document.querySelector('[data-enigma="4"]').classList.add('solved');
      EnigmaState.solve(ENIGMA_ID, DIGIT);
    } else {
      // Mauvais ordre : on remet tout dans le pool après une petite animation d'erreur
      slots.forEach(s => s.classList.add('drag-over'));
      setTimeout(() => {
        slots.forEach(s => {
          s.classList.remove('drag-over');
          const piece = s.children[0];
          if (piece) piecesContainer.appendChild(piece);
        });
      }, 400);
    }
  }

  function placeInSlot(piece, slot) {
    if (slot.children.length > 0) return; // case déjà occupée
    slot.appendChild(piece);
    piece.classList.add('in-slot');
    checkCompletion();
  }

  /* ---------- Desktop : Drag and Drop API ---------- */
  function attachDragEvents(piece) {
    piece.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', piece.id);
      piece.classList.add('dragging');
    });
    piece.addEventListener('dragend', () => piece.classList.remove('dragging'));
  }
  piecesContainer.querySelectorAll('.puzzle-piece').forEach(attachDragEvents);

  slots.forEach((slot) => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      const pieceId = e.dataTransfer.getData('text/plain');
      const piece = document.getElementById(pieceId);
      if (piece) placeInSlot(piece, slot);
    });
  });

  /* ---------- Mobile : Pointer Events ---------- */
  let ghost = null;
  let activePiece = null;

  function attachPointerEvents(piece) {
    piece.addEventListener('pointerdown', (e) => {
      activePiece = piece;
      piece.classList.add('dragging');
      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.textContent = piece.textContent;
      document.body.appendChild(ghost);
      moveGhost(e.clientX, e.clientY);
      piece.setPointerCapture(e.pointerId);
    });
    piece.addEventListener('pointermove', (e) => {
      if (ghost) moveGhost(e.clientX, e.clientY);
    });
    piece.addEventListener('pointerup', (e) => {
      if (!activePiece) return;
      const target = document
        .elementsFromPoint(e.clientX, e.clientY)
        .find(el => el.classList.contains('puzzle-slot'));
      if (target) placeInSlot(activePiece, target);
      cleanupGhost();
    });
    piece.addEventListener('pointercancel', cleanupGhost);
  }
  piecesContainer.querySelectorAll('.puzzle-piece').forEach(attachPointerEvents);

  function moveGhost(x, y) {
    if (ghost) { ghost.style.left = x + 'px'; ghost.style.top = y + 'px'; }
  }
  function cleanupGhost() {
    if (activePiece) activePiece.classList.remove('dragging');
    if (ghost) { ghost.remove(); ghost = null; }
    activePiece = null;
  }

  /* Restauration */
  if (EnigmaState.isSolved(ENIGMA_ID)) {
    slots.forEach((slot, i) => {
      const piece = document.getElementById('piece-' + ORDER[i]);
      if (piece) { slot.appendChild(piece); piece.classList.add('in-slot'); }
    });
    document.getElementById('result-4').classList.remove('d-none');
    document.getElementById('digit-4').textContent = EnigmaState.getDigit(ENIGMA_ID);
    document.getElementById('badge-4').classList.remove('d-none');
    document.querySelector('[data-enigma="4"]').classList.add('solved');
  }
})();
