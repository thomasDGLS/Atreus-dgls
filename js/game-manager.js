/**
 * game-manager.js
 * Orchestration des jeux :
 *  - Scale CSS du game-stage pour s'adapter à tout écran (taille fixe 560×320)
 *  - Transitions de glissement entre les slides
 *  - Écoute 'game:complete' pour afficher la flèche suivant
 *
 * Chaque jeu dispatch quand il est terminé :
 *   document.dispatchEvent(new CustomEvent('game:complete', {
 *     detail: { gameId: 1, digit: 7 }
 *   }));
 */
const GameManager = (() => {
    const STAGE_W = 560;
    const STAGE_H = 320;

    const stage  = document.getElementById('gameStage');
    const slides = Array.from(document.querySelectorAll('.game-slide'));

    let currentIndex  = 0;
    let transitioning = false;

    /* ---------- Scale responsive ---------- */
    function scaleStage() {
        if (!stage) return;
        const scaleX = (window.innerWidth  - 32) / STAGE_W;
        const scaleY = (window.innerHeight - 32) / STAGE_H;
        const scale  = Math.min(scaleX, scaleY, 1);
        stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    window.addEventListener('resize', scaleStage);

    /* ---------- Initialisation : première slide active ---------- */
    function init() {
        if (slides.length > 0) slides[0].classList.add('active');
    }

    /* ---------- Glissement vers la slide suivante ---------- */
    function goToNext() {
        if (transitioning || currentIndex >= slides.length - 1) return;
        transitioning = true;

        const current = slides[currentIndex];
        const next    = slides[currentIndex + 1];

        // Nettoie tout style inline résiduel avant d'animer
        next.style.transition = '';
        next.style.transform  = '';

        requestAnimationFrame(() => {
            next.classList.add('active');
            current.classList.add('exit-left');
            current.classList.remove('active');

            current.addEventListener('transitionend', () => {
                current.style.transition = '';
                current.style.transform  = '';
                transitioning = false;
                currentIndex++;
            }, { once: true });
        });
    }

    /* ---------- Glissement vers la slide précédente ---------- */
    function goToPrev() {
        if (transitioning || currentIndex <= 0) return;
        transitioning = true;

        const current = slides[currentIndex];
        const prev    = slides[currentIndex - 1];

        // On positionne la slide précédente immédiatement à gauche (sans transition)
        // puis on retire exit-left pour la faire revenir au centre avec transition
        prev.style.transition = 'none';
        prev.style.transform  = 'translateX(-100%)';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Maintenant on réactive la transition CSS et on anime les deux slides
                prev.style.transition = '';
                prev.style.transform  = '';
                prev.classList.add('active');

                current.classList.remove('active');
                current.classList.remove('exit-left'); // reset propre
                // La courante repart à droite via la classe par défaut (translateX(100%))
                // mais on doit forcer le retour sans exit-left
                current.style.transition = 'none';
                current.style.transform  = 'translateX(100%)';

                requestAnimationFrame(() => {
                    current.style.transition = '';
                    current.style.transform  = '';
                });

                prev.addEventListener('transitionend', () => {
                    // Nettoyage complet des styles inline pour repartir sur les classes CSS uniquement
                    prev.style.transition = '';
                    prev.style.transform  = '';
                    transitioning = false;
                    currentIndex--;
                }, { once: true });
            });
        });
    }

    /* ---------- Écoute la fin de chaque jeu ---------- */
    document.addEventListener('game:complete', (e) => {
        const { gameId, digit } = e.detail;

        const footer = document.getElementById(`footer-${gameId}`);
        if (footer) footer.classList.remove('d-none');

        const footerDigit = document.getElementById(`footerDigit-${gameId}`);
        if (footerDigit) {
            footerDigit.textContent = digit;
            setTimeout(() => footerDigit.classList.add('visible'), 50);
        }

        // Sauvegarde le chiffre de ce jeu
        const digits = JSON.parse(localStorage.getItem('atreus_game_digits') || '{}');
        digits[gameId] = digit;
        localStorage.setItem('atreus_game_digits', JSON.stringify(digits));

        // Si tous les jeux sont terminés, marque comme complété
        if (Object.keys(digits).length >= 4) {
            localStorage.setItem('atreus_games_completed', 'true');
        }

        document.dispatchEvent(new CustomEvent('enigme:solved', {
            detail: { enigmaId: gameId, digit }
        }));
    });

    /* ---------- Branchement boutons suivant ET précédent ---------- */
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', goToNext);
    });
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', goToPrev);
    });

    /* ---------- Affichage du stage (appelé par intro.js) ---------- */
    function show() {
        stage.classList.remove('d-none');
        scaleStage();
    }

    init();
    return { show, goToNext };
})();