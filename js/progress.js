/**
 * progress.js
 * Panneau latéral de suivi de progression.
 * Chaque épreuve est déclarée dans ENIGMAS (nom + id).
 * Écoute l'événement custom 'enigme:solved' dispatché par les jeux
 * pour mettre à jour l'affichage en temps réel sans recharger.
 */
const ProgressPanel = (() => {
    // Déclare ici toutes tes épreuves dans l'ordre
    const ENIGMAS = [
        { id: 1, name: 'Le flamant et le hérisson'},
        { id: 2, name: 'Les cartes dansante'},
        { id: 3, name: 'Les roses rouges'},
        { id: 4, name: 'Balayages'},
    ];

    const toggle = document.getElementById('progressToggle');
    const panel = document.getElementById('progressPanel');
    const closeBtn = document.getElementById('progressClose');
    const overlay = document.getElementById('progressOverlay');
    const list = document.getElementById('progressList');

    // État local : chiffres obtenus par id d'épreuve
    const solved = {};

    /* ---------- Construction de la liste ---------- */
    function buildList() {
        list.innerHTML = '';
        ENIGMAS.forEach(enigma => {
            const isSolved = Object.prototype.hasOwnProperty.call(solved, enigma.id);
            const digit = isSolved ? solved[enigma.id] : '?';

            const li = document.createElement('li');
            li.className = 'progress-item';
            li.dataset.enigmaId = enigma.id;
            li.innerHTML = `
        <div class="progress-status ${isSolved ? 'solved' : ''}">
          <i class="fa-solid ${isSolved ? 'fa-check' : 'fa-clock'}"></i>
        </div>
        <div class="progress-info">
          <div class="progress-name">${enigma.name}</div>
        </div>
        <div class="progress-digit ${isSolved ? 'solved' : ''}">${digit}</div>
      `;
            list.appendChild(li);
        });
    }

    /* ---------- Mise à jour d'une épreuve résolue ---------- */
    function markSolved(enigmaId, digit) {
        solved[enigmaId] = digit;
        const item = list.querySelector(`[data-enigma-id="${enigmaId}"]`);
        if (!item) return;
        item.querySelector('.progress-status').classList.add('solved');
        item.querySelector('.progress-status i').className = 'fa-solid fa-check';
        item.querySelector('.progress-digit').classList.add('solved');
        item.querySelector('.progress-digit').textContent = digit;
    }

    /* ---------- Ouverture / fermeture ---------- */
    function open() {
        panel.classList.add('open');
        overlay.classList.remove('d-none');
    }
    function close() {
        panel.classList.remove('open');
        overlay.classList.add('d-none');
    }

    toggle.addEventListener('click', () => {
        panel.classList.contains('open') ? close() : open();
    });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    /* ---------- Écoute les résolutions des jeux ----------
     * Chaque jeu dispatch cet événement quand il est terminé :
     *   document.dispatchEvent(new CustomEvent('enigme:solved', {
     *     detail: { enigmaId: 1, digit: 7 }
     *   }));
     */
    document.addEventListener('enigme:solved', (e) => {
        const { enigmaId, digit } = e.detail;
        markSolved(enigmaId, digit);
    });

    // Construction initiale
    buildList();

    return { open, close, markSolved };
})();