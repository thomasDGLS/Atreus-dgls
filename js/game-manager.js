/**
 * game-manager.js
 * Orchestration des jeux :
 *  - Scale CSS du game-stage pour s'adapter à tout écran (taille fixe 560×320)
 *  - Transitions de glissement entre les slides (suivant + précédent)
 *  - Écoute 'game:complete' pour afficher la flèche suivant + chiffre footer
 *  - Sauvegarde la progression dans localStorage
 */
const GameManager = (() => {
  const STAGE_W = 560;
  const STAGE_H = 320;

  const stage   = document.getElementById('gameStage');
  const slides  = Array.from(document.querySelectorAll('.game-slide'));
  const toggle  = document.getElementById('progressToggle');

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

    // 1. On prépare la slide précédente pour qu'elle soit prête à entrer par la gauche
    prev.style.transition = 'none';
    prev.style.transform  = 'translateX(-100%)';
    prev.classList.add('active'); // S'assure qu'elle est marquée comme active

    requestAnimationFrame(() => {
      // 2. On déclenche l'animation de retour
      prev.style.transition = '';
      prev.style.transform  = 'translateX(0%)';

      current.classList.remove('active');
      current.style.transform = 'translateX(100%)'; // La slide actuelle sort par la droite

      prev.addEventListener('transitionend', () => {
        transitioning = false;
        currentIndex--;
        // 3. Nettoyage final pour éviter les conflits de style
        current.style.transform = '';
        current.classList.remove('exit-left');
      }, { once: true });
    });
  }

  /* ---------- Écoute la fin de chaque jeu ---------- */
  document.addEventListener('game:complete', (e) => {
    const { gameId, digit } = e.detail;

    // Affiche le footer du jeu terminé
    const footer = document.getElementById(`footer-${gameId}`);
    if (footer) footer.classList.remove('d-none');

    // Affiche le chiffre au centre du footer avec fondu
    const footerDigit = document.getElementById(`footerDigit-${gameId}`);
    if (footerDigit) {
      footerDigit.textContent = digit;
      setTimeout(() => footerDigit.classList.add('visible'), 50);
    }

    // Sauvegarde dans localStorage
    const digits = JSON.parse(localStorage.getItem('atreus_game_digits') || '{}');
    digits[gameId] = digit;
    localStorage.setItem('atreus_game_digits', JSON.stringify(digits));

    // 4 jeux = tous terminés (cadenas non compté)
    if (Object.keys(digits).length >= 4) {
      localStorage.setItem('atreus_games_completed', 'true');
    }

    // Notifie le panneau de progression
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
    // FIX : affiche l'icône de progression (était manquant)
    if (toggle) toggle.classList.remove('d-none');
    scaleStage();
  }

  init();
  return { show, goToNext, goToPrev };
})();
