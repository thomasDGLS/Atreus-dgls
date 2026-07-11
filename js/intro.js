/**
 * intro.js
 * Déroulé :
 *  1. Tap → si intro déjà vue : affiche lapinWrapper directement + poster de lapinVideo
 *           sinon : lance introVideo + musique
 *  2. Fin introVideo → sauvegarde intro vue, affiche bouton replay + lapinWrapper
 *  3. Clic "lapin" → lance lapinVideo
 *  4. Fin lapinVideo → zoom → bgGames + GameManager (ou récompense si jeux déjà finis)
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

  let experienceStarted = false;

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

  /* ---------- Sécurité boucle musique ---------- */
  music.addEventListener('ended', () => music.play().catch(() => {}));

  /* ---------- 1. Premier tap ---------- */
  tapScreen.addEventListener('click', () => {
    experienceStarted = true;
    hide(tapScreen);
    show(introScreen);
    music.play().catch(() => {});

    if (localStorage.getItem(STORAGE_KEY_INTRO) === 'true') {
      // Intro déjà vue → affiche le poster de lapinVideo + lapinWrapper directement
      hide(video);
      show(lapinVideo);
      lapinWrapper.classList.add('visible');
      lapinWrapper.style.backgroundColor = 'black';
      replayWrapper.classList.add('visible');
    } else {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, { once: true });

  /* ---------- 2. Fin introVideo ---------- */
  video.addEventListener('ended', () => {
    localStorage.setItem(STORAGE_KEY_INTRO, 'true');
    replayWrapper.classList.add('visible');
    lapinWrapper.classList.add('visible');
  });

  /* ---------- Replay introVideo ---------- */
  replayBtn.addEventListener('click', () => {
    replayWrapper.classList.remove('visible');
    lapinWrapper.classList.remove('visible');
    show(video);
    hide(lapinVideo);
    video.currentTime = 0;
    video.play().catch(() => {});
  });

  /* ---------- 3. Clic lapin → lapinVideo ---------- */
  lapinDesign.addEventListener('click', () => {
    lapinWrapper.classList.remove('visible');
    replayWrapper.classList.remove('visible');
    hide(video);
    show(lapinVideo);
    lapinVideo.currentTime = 0;
    lapinVideo.play().catch(() => {});
  });

  /* ---------- 4. Fin lapinVideo → zoom → image + jeux ---------- */
  lapinVideo.addEventListener('ended', () => {
    lapinVideo.pause();
    zoomCircle.classList.add('zooming');

    zoomCircle.addEventListener('transitionend', () => {
      show(bgGamesImage);

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

  /* ---------- Restauration si jeux déjà complétés ---------- */
  function restoreCompletedGames() {
    const digits = JSON.parse(localStorage.getItem(STORAGE_KEY_DIGITS) || '{}');

    // Restaure les footerDigits pour que getExpectedCode() fonctionne dans cadenas
    [1, 2, 3, 4].forEach(id => {
      if (digits[id] !== undefined) {
        const el = document.getElementById(`footerDigit-${id}`);
        if (el) {
          el.textContent = digits[id];
          el.classList.add('visible');
        }
        document.dispatchEvent(new CustomEvent('enigme:solved', {
          detail: { enigmaId: id, digit: digits[id] }
        }));
      }
    });

    // Affiche directement la récompense
    if (typeof window.showReward === 'function') {
      setTimeout(() => window.showReward(), 400);
    }

    // Affiche le bouton rejouer
    const replayGamesBtn = document.getElementById('replayGamesBtn');
    if (replayGamesBtn) replayGamesBtn.classList.remove('d-none');
  }

  /* ---------- Bouton rejouer les jeux ---------- */
  document.getElementById('replayGamesBtn')?.addEventListener('click', () => {
    localStorage.removeItem('atreus_games_completed');
    localStorage.removeItem('atreus_game_digits');
    location.reload();
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
})();
