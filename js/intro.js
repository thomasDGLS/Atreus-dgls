/**
 * intro.js
 * Déroulé :
 *  1. Tap → vidéo intro + musique se lancent simultanément.
 *  2. Fin vidéo intro → bouton replay + texte "lapin" apparaissent en fondu.
 *  3. Clic "lapin" → vidéo lapin se lance, replay et texte disparaissent.
 *  4. Fin vidéo lapin → zoom noir → bgGames.png révélée + GameManager.show().
 */
(function () {
  const STORAGE_KEY_INTRO  = 'atreus_intro_seen';
  const STORAGE_KEY_GAMES  = 'atreus_games_completed';
  const STORAGE_KEY_DIGITS = 'atreus_game_digits';
  const tapScreen    = document.getElementById('tapScreen');
  const introScreen  = document.getElementById('introScreen');
  const video        = document.getElementById('introVideo');
  const lapinVideo   = document.getElementById('lapinVideo');
  const music        = document.getElementById('bgMusic');
  const replayWrapper = document.getElementById('replayWrapper');
  const replayBtn    = document.getElementById('introReplayBtn');
  const lapinWrapper = document.getElementById('lapinWrapper');
  const lapinDesign  = document.getElementById('lapinDesign');
  const bgGamesImage = document.getElementById('bgGamesImage');
  const zoomCircle   = document.getElementById('zoomCircle');
  const gameProgress              = document.getElementById('progressToggle');

  let experienceStarted = false;

  /* ---------- Utilitaires ---------- */
  const show = el => el.classList.remove('d-none');
  const hide = el => el.classList.add('d-none');

  function pauseAll() {
    video.pause();
    music.pause();
    lapinVideo.pause();
  }

  function resumeMain() {
    if (!video.ended) video.play().catch(() => {});
    music.play().catch(() => {});
  }

  /* ---------- 1. Premier tap ---------- */
  tapScreen.addEventListener('click', () => {
    experienceStarted = true;
    hide(tapScreen);
    show(introScreen);

    // A-t-on déjà vu l'intro ?
    if (localStorage.getItem(STORAGE_KEY_INTRO) === 'true') {
      // Passe directement à l'état post-intro
      hide(video);
      lapinWrapper.classList.add('visible');
      replayWrapper.classList.add('visible');
    } else {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    music.play().catch(() => {});
  }, { once: true });

  /* ---------- 2. Fin vidéo intro : bouton replay + texte lapin ---------- */
  video.addEventListener('ended', () => {
    localStorage.setItem(STORAGE_KEY_INTRO, 'true');
    replayWrapper.classList.add('visible');
    lapinWrapper.classList.add('visible');
  });

  /* ---------- Replay : relance uniquement la vidéo ---------- */
  replayBtn.addEventListener('click', () => {
    replayWrapper.classList.remove('visible');
    lapinWrapper.classList.remove('visible');

    // S'assure que la vidéo est visible avant de la lancer
    show(video);
    hide(lapinVideo);

    video.currentTime = 0;
    video.play().catch(() => {});
  });

  /* ---------- 3. Clic lapin → vidéo lapin ---------- */
  lapinDesign.addEventListener('click', () => {
    lapinWrapper.classList.remove('visible');
    replayWrapper.classList.remove('visible');
    hide(video);
    show(lapinVideo);
    lapinVideo.currentTime = 0;
    lapinVideo.play().catch(() => {});
  });

  /* ---------- 4. Fin vidéo lapin → zoom → image + jeux ---------- */
  lapinVideo.addEventListener('ended', () => {
    lapinVideo.pause();
    zoomCircle.classList.add('zooming');

    zoomCircle.addEventListener('transitionend', () => {
      show(bgGamesImage);

      // Vérifie si les jeux étaient déjà complétés
      if (localStorage.getItem(STORAGE_KEY_GAMES) === 'true') {
        restoreCompletedGames();
      } else {
        GameManager.show();
      }

      zoomCircle.classList.add('fade-out');
      zoomCircle.addEventListener('transitionend', () => {
        zoomCircle.classList.remove('zooming', 'fade-out');
      }, { once: true });
    }, { once: true });
  });

  /* ---------- Détection d'orientation ---------- */
  OrientationGuard.init({
    onBlocked: () => {
      if (experienceStarted) { hide(introScreen); pauseAll(); }
      else hide(tapScreen);
    },
    onAllowed: () => {
      if (experienceStarted) {
        show(introScreen);
        if (video.paused && !video.ended && lapinVideo.paused) resumeMain();
        else if (music.paused) music.play().catch(() => {});
      } else {
        show(tapScreen);
      }
    }
  });

  function restoreCompletedGames() {
    const digits = JSON.parse(localStorage.getItem(STORAGE_KEY_DIGITS) || '{}');

    // Restaure le panneau de progression
    [1, 2, 3, 4].forEach(id => {
      if (digits[id] !== undefined) {
        document.dispatchEvent(new CustomEvent('enigme:solved', {
          detail: { enigmaId: id, digit: digits[id] }
        }));
      }
    });

    // Affiche directement la récompense finale
    // (le GameManager n'a pas besoin d'être affiché)
    if (typeof showReward === 'function') {
      setTimeout(() => showReward(), 400);
    }

    // Affiche le bouton rejouer
    document.getElementById('replayGamesBtn').classList.remove('d-none');
  }

  document.getElementById('replayGamesBtn')?.addEventListener('click', () => {
    // Efface uniquement la progression des jeux, pas l'intro
    localStorage.removeItem('atreus_games_completed');
    localStorage.removeItem('atreus_game_digits');
    location.reload();
  });
})();