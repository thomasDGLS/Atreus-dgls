/**
 * game2-simon.js
 * Jeu 2 — Mémorise la séquence (Simon)
 *
 * La machine affiche une séquence de 4 couleurs, le joueur la reproduit
 * en cliquant / tapant dans le même ordre.
 * Fonctionne souris et tactile (event 'click' natif, aucun code tactile
 * supplémentaire nécessaire pour ce type de jeu).
 *
 * Quand terminé, dispatch 'game:complete' pour que GameManager affiche la flèche.
 */
(function () {
    const GAME_ID         = 2;
    const DIGIT           = 0;
    const SEQUENCE_LENGTH = 4;

    const buttons  = document.querySelectorAll('#slide-2 .simon-btn');
    const startBtn = document.getElementById('simonStart');

    let sequence      = [];
    let playerInput   = [];
    let acceptingInput = false;
    let completed      = false;

    function randomSequence(length) {
        return Array.from({ length }, () => Math.floor(Math.random() * 4));
    }

    function lightUp(index, duration = 420) {
        return new Promise((resolve) => {
            const btn = buttons[index];
            btn.classList.add('lit');
            setTimeout(() => { btn.classList.remove('lit'); resolve(); }, duration);
        });
    }

    async function playSequence() {
        acceptingInput = false;
        startBtn.disabled = true;
        for (const idx of sequence) {
            await lightUp(idx, 420);
            await new Promise(r => setTimeout(r, 160));
        }
        acceptingInput = true;
        startBtn.disabled = false;
    }

    startBtn.addEventListener('click', () => {
        if (completed) return;
        sequence    = randomSequence(SEQUENCE_LENGTH);
        playerInput = [];
        playSequence();
    });

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!acceptingInput || completed) return;
            const color = parseInt(btn.dataset.color, 10);
            lightUp(color, 200);
            playerInput.push(color);

            const idx = playerInput.length - 1;
            if (playerInput[idx] !== sequence[idx]) {
                // Erreur : flash rouge et on recommence
                acceptingInput = false;
                playerInput = [];
                flashError().then(() => playSequence());
                return;
            }

            if (playerInput.length === sequence.length) {
                acceptingInput = false;
                onGameComplete();
            }
        });
    });

    async function flashError() {
        buttons.forEach(b => b.classList.add('lit'));
        await new Promise(r => setTimeout(r, 200));
        buttons.forEach(b => b.classList.remove('lit'));
        await new Promise(r => setTimeout(r, 100));
    }

    function onGameComplete() {
        completed = true;
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fa-solid fa-check"></i> Réussi !';
        document.dispatchEvent(new CustomEvent('game:complete', {
            detail: { gameId: GAME_ID, digit: DIGIT }
        }));
    }
})();