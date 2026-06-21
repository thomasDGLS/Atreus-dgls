/**
 * main.js
 * Orchestration générale : mise à jour de la barre de progression globale
 * et bouton reset. Tout fonctionne en 100% local (localStorage), sans backend.
 */
(function () {
  const progressBadge = document.getElementById('progressBadge');
  const globalProgress = document.getElementById('globalProgress');
  const resetBtn = document.getElementById('resetBtn');

  function updateProgressUI() {
    const count = EnigmaState.progressCount();
    const total = EnigmaState.TOTAL;
    progressBadge.textContent = `${count} / ${total} énigmes`;
    globalProgress.style.width = `${(count / total) * 100}%`;
    if (count === total) {
      progressBadge.classList.remove('text-bg-secondary');
      progressBadge.classList.add('text-bg-success');
    }
  }

  document.addEventListener('enigme:solved', updateProgressUI);
  updateProgressUI(); // état initial (au cas où une progression était déjà sauvegardée)

  resetBtn.addEventListener('click', () => {
    if (confirm('Réinitialiser toute la progression ?')) {
      EnigmaState.reset();
      location.reload();
    }
  });
})();
