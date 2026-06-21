/**
 * confetti.js
 * Petite animation de confettis 100% JS natif via l'API Canvas.
 * Utilisée comme récompense visuelle quand le cadenas final s'ouvre.
 */
const Confetti = (() => {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function createParticles(count = 150) {
    const colors = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#ff9800', '#8e24aa'];
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    particles = particles.filter(p => p.y < canvas.height + 30);

    if (particles.length > 0) {
      animationId = requestAnimationFrame(draw);
    } else {
      canvas.style.display = 'none';
      cancelAnimationFrame(animationId);
    }
  }

  function launch() {
    canvas.style.display = 'block';
    createParticles(180);
    if (animationId) cancelAnimationFrame(animationId);
    draw();
  }

  return { launch };
})();
