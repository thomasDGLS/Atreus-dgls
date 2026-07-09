/**
 * game4-tasses.js
 * Jeu 4 — Le Bonneteau du Chapelier
 * * 3 tasses se mélangent. Le joueur doit retrouver le sucre (chiffre 6).
 */
(function () {
    const GAME_ID = 4;
    const DIGIT   = 6;
    const SHUFFLE_COUNT = 5; // Nombre de permutations
    const SHUFFLE_SPEED = 450; // Vitesse en ms

    const cups = Array.from(document.querySelectorAll('.cup-wrapper'));
    const startBtn = document.getElementById('startTassesBtn');

    if (!cups.length || !startBtn) return;

    let positions = [0, 1, 2];
    let isShuffling = false;
    let hasWon = false;
    let winningCupIndex = 0; // La première tasse a le sucre au début

    // Initialisation : on cache le sucre dans la tasse "winner"
    cups[winningCupIndex].classList.add('winner', 'lifted');

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function doShuffle() {
        return new Promise((resolve) => {
            shuffleArray(positions);
            cups.forEach((cup, idx) => {
                // Nettoie les anciennes classes de position
                cup.classList.remove('cup-pos-0', 'cup-pos-1', 'cup-pos-2');
                // Applique la nouvelle
                cup.classList.add(`cup-pos-${positions[idx]}`);
            });
            setTimeout(resolve, SHUFFLE_SPEED);
        });
    }

    startBtn.addEventListener('click', async () => {
        if (isShuffling || hasWon) return;
        isShuffling = true;
        startBtn.disabled = true;

        // Baisse les tasses si elles étaient levées (erreur précédente)
        cups.forEach(cup => cup.classList.remove('lifted'));
        await new Promise(r => setTimeout(r, 400));

        // Mélange X fois
        for (let i = 0; i < SHUFFLE_COUNT; i++) {
            await doShuffle();
        }

        isShuffling = false;
        startBtn.textContent = "Choisissez une tasse !";
    });

    cups.forEach((cup) => {
        cup.addEventListener('click', () => {
            if (isShuffling || hasWon || !startBtn.disabled) return;

            cup.classList.add('lifted');

            if (cup.classList.contains('winner')) {
                // Gagné
                hasWon = true;
                startBtn.innerHTML = '<i class="fa-solid fa-check"></i> Trouvé !';
                document.dispatchEvent(new CustomEvent('game:complete', {
                    detail: { gameId: GAME_ID, digit: DIGIT }
                }));
            } else {
                // Perdu, on réinitialise le bouton pour retenter
                setTimeout(() => {
                    cup.classList.remove('lifted');
                    startBtn.disabled = false;
                    startBtn.textContent = "Réessayer";
                }, 1200);
            }
        });
    });
})();