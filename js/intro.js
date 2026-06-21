/**
 * intro.js
 * Déroulé :
 *   1. Écran noir "Toucher pour commencer" : nécessaire car les navigateurs
 *      bloquent toute lecture audio avec son sans interaction utilisateur.
 *      Ce tap lance EN MÊME TEMPS la vidéo (muette) et la musique (avec son).
 *   2. La vidéo joue en fond, sans aucun contrôle visible.
 *   3. À la fin de la vidéo (ended), un bouton "replay" apparaît en fondu
 *      en bas à gauche. Il permet de rejouer uniquement la vidéo
 *      (la musique continue sa lecture sans être affectée).
 *   4. La fonction triggerZoomTransition() est exposée globalement (window)
 *      pour être appelée plus tard ailleurs (ex: clic sur un texte) afin de
 *      déclencher l'effet de zoom plein écran suivi d'un changement de page.
 */
(function () {
  const tapScreen = document.getElementById('tapScreen');
  const introScreen = document.getElementById('introScreen');

  const video = document.getElementById('introVideo');
  const music = document.getElementById('bgMusic');

  const replayWrapper = document.getElementById('replayWrapper');
  const replayBtn = document.getElementById('introReplayBtn');

  const bgGamesImage = document.getElementById('bgGamesImage');

  const lapinDesign = document.getElementById('lapinDesign');
  const lapinWrapper = document.getElementById('lapinWrapper');

  const zoomCircle = document.getElementById('zoomCircle');

  let experienceStarted = false; // true après le premier tap (musique/vidéo lancées au moins une fois)

  function showTapScreen() {
    tapScreen.classList.remove('d-none');
  }
  function hideTapScreen() {
    tapScreen.classList.add('d-none');
  }
  function showIntro() {
    introScreen.classList.remove('d-none');
  }
  function hideIntro() {
    introScreen.classList.add('d-none');
  }

  function pauseAll() {
    video.pause();
    music.pause();
  }

  function resumeAll() {
    video.play().catch(() => {});
    music.play().catch(() => {});
  }

  /* ---------- Fin de la vidéo : fondu du bouton replay + texte associé + texte lapin ---------- */
  video.addEventListener('ended', () => {
    replayWrapper.classList.add('visible');
    lapinWrapper.classList.add('visible'); // ligne ajoutée
  });

  /* ---------- Premier tap : démarre vidéo + musique ensemble ---------- */
  tapScreen.addEventListener('click', () => {
    experienceStarted = true;
    hideTapScreen();
    showIntro();
    video.currentTime = 0;
    video.play().catch(() => {});
    music.play().catch(() => {});
  }, { once: true });

  /* ---------- Fin de la vidéo : fondu du bouton replay + texte associé ---------- */
  video.addEventListener('ended', () => {
    replayWrapper.classList.add('visible');

  });

  /* ---------- Clic sur replay : relance uniquement la vidéo ---------- */
  replayBtn.addEventListener('click', () => {
    replayWrapper.classList.remove('visible');
    video.currentTime = 0;
    video.play().catch(() => {});
  });

  /* ---------- Effet de zoom : remplace la vidéo par l'image bgGames.jpg ----------
 * Au clic sur #lapinDesign : zoom du cercle, puis pendant que l'écran est
 * recouvert, on coupe la vidéo et on affiche l'image à la place.
 * La musique de fond continue de jouer sans interruption.
 * Le bouton replay (et son texte) sont masqués, car ils n'ont plus de sens
 * une fois qu'il n'y a plus de vidéo à rejouer.
 */
  lapinDesign.addEventListener('click', () => {
    lapinWrapper.classList.remove('visible');
    zoomCircle.classList.add('zooming');
    zoomCircle.addEventListener('transitionend', () => {
      video.pause();
      video.classList.add('d-none');
      replayWrapper.classList.remove('visible');
      bgGamesImage.classList.remove('d-none');

      // Une fois l'image en place, on fait disparaître le cercle noir pour la révéler
      zoomCircle.classList.add('fade-out');
      zoomCircle.addEventListener('transitionend', () => {
        zoomCircle.classList.remove('zooming', 'fade-out');
      }, { once: true });
    }, { once: true });
  });

  /* ---------- Détection d'orientation ---------- */
  OrientationGuard.init({
    onBlocked: () => {
      if (experienceStarted) {
        hideIntro();
        pauseAll();
      } else {
        hideTapScreen();
      }
    },
    onAllowed: () => {
      if (experienceStarted) {
        showIntro();
        if (video.paused && !video.ended) resumeAll();
        else if (music.paused) music.play().catch(() => {});
      } else {
        showTapScreen();
      }
    }
  });
})();
