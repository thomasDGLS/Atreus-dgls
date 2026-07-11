/**
 * game1.js
 * Jeu 1 — Flamant & Hérisson
 *
 * Étape 1 : glisser le flamant sur la zone du hérisson -> verrouillage à sa gauche.
 * Étape 2 : (débloquée après étape 1) glisser le hérisson vers la zone cible.
 *
 * Desktop : HTML5 Drag and Drop API.
 * Mobile  : Pointer Events (ghost element).
 *
 * Quand terminé, dispatch 'game:complete' → GameManager affiche la flèche suivant.
 */
(function () {
    const GAME_ID = 1;
    const DIGIT   = 2; // Code a la fin du jeu

    const flamingo         = document.getElementById('flamingo');
    const hedgehog         = document.getElementById('hedgehog');
    const hedgehogDropZone = document.getElementById('hedgehogDropZone');
    const finalDropZone    = document.getElementById('finalDropZone');

    let step1Done   = false;
    let ghost       = null;
    let activePiece = null;

    /* ===================================================================
     * ÉTAPE 1 : flamant -> zone hérisson (Drag and Drop API)
     * =================================================================== */
    flamingo.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', 'flamingo');
        e.dataTransfer.effectAllowed = 'move';
        flamingo.classList.add('dragging');
    });
    flamingo.addEventListener('dragend', () => flamingo.classList.remove('dragging'));

    hedgehogDropZone.addEventListener('dragover', (e) => {
        if (step1Done) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        hedgehogDropZone.classList.add('drag-over');
    });
    hedgehogDropZone.addEventListener('dragleave', () => {
        hedgehogDropZone.classList.remove('drag-over');
    });
    hedgehogDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        hedgehogDropZone.classList.remove('drag-over');
        if (step1Done) return;
        if (e.dataTransfer.getData('text/plain') === 'flamingo') lockFlamingo();
    });

    function lockFlamingo() {
        step1Done = true;
        flamingo.classList.add('locked');
        flamingo.setAttribute('draggable', 'false');
        // Insère le flamant dans le conteneur du hérisson, à sa gauche
        hedgehogDropZone.insertBefore(flamingo, hedgehog);
        // Débloque le hérisson
        hedgehog.setAttribute('draggable', 'true');
    }

    /* ===================================================================
     * ÉTAPE 2 : hérisson -> zone cible (Drag and Drop API)
     * =================================================================== */
    hedgehog.addEventListener('dragstart', (e) => {
        if (!step1Done) { e.preventDefault(); return; }
        e.dataTransfer.setData('text/plain', 'hedgehog');
        e.dataTransfer.effectAllowed = 'move';
        hedgehog.classList.add('dragging');
    });
    hedgehog.addEventListener('dragend', () => hedgehog.classList.remove('dragging'));

    finalDropZone.addEventListener('dragover', (e) => {
        if (!step1Done) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        finalDropZone.classList.add('drag-over');
    });
    finalDropZone.addEventListener('dragleave', () => {
        finalDropZone.classList.remove('drag-over');
    });
    finalDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        finalDropZone.classList.remove('drag-over');
        if (!step1Done) return;
        if (e.dataTransfer.getData('text/plain') === 'hedgehog') onGameComplete();
    });

    function onGameComplete() {
        hedgehog.setAttribute('draggable', 'false');
        hedgehog.classList.add('locked');
        finalDropZone.appendChild(hedgehog); // seul le hérisson va dans le goal
        document.dispatchEvent(new CustomEvent('game:complete', {
            detail: { gameId: GAME_ID, digit: DIGIT }
        }));
    }

    /* ===================================================================
     * TACTILE : Pointer Events (ghost element)
     * =================================================================== */
    function startDrag(piece, e) {
        activePiece = piece;
        piece.classList.add('dragging');
        ghost = document.createElement('img');
        ghost.src = piece.src;
        ghost.className = 'drag-ghost';
        document.body.appendChild(ghost);
        moveGhost(e.clientX, e.clientY);
        piece.setPointerCapture(e.pointerId);
    }
    function moveGhost(x, y) {
        if (ghost) { ghost.style.left = x + 'px'; ghost.style.top = y + 'px'; }
    }
    function cleanupGhost() {
        if (activePiece) activePiece.classList.remove('dragging');
        if (ghost) { ghost.remove(); ghost = null; }
        activePiece = null;
    }

    // Flamant (tactile)
    flamingo.addEventListener('pointerdown', (e) => {
        if (step1Done) return;
        startDrag(flamingo, e);
    });
    flamingo.addEventListener('pointermove', (e) => moveGhost(e.clientX, e.clientY));
    flamingo.addEventListener('pointerup', (e) => {
        if (activePiece !== flamingo) return;
        const over = document.elementsFromPoint(e.clientX, e.clientY);
        if (over.some(el => el === hedgehogDropZone || el === hedgehog) && !step1Done) {
            lockFlamingo();
        }
        cleanupGhost();
    });
    flamingo.addEventListener('pointercancel', cleanupGhost);

    // Hérisson (tactile, actif seulement après step1)
    hedgehog.addEventListener('pointerdown', (e) => {
        if (!step1Done) return;
        startDrag(hedgehog, e);
    });
    hedgehog.addEventListener('pointermove', (e) => moveGhost(e.clientX, e.clientY));
    hedgehog.addEventListener('pointerup', (e) => {
        if (activePiece !== hedgehog) return;
        const over = document.elementsFromPoint(e.clientX, e.clientY);
        if (over.some(el => el === finalDropZone || el.closest?.('#finalDropZone')) && step1Done) {
            onGameComplete();
        }
        cleanupGhost();
    });
    hedgehog.addEventListener('pointercancel', cleanupGhost);
})();