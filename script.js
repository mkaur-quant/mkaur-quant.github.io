/* ===== QUANTUM PARTICLE BACKGROUND ===== */
(function () {
  const canvas = document.getElementById('quantum-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 130;
  const COLORS = ['#00e5ff', '#3b82f6', '#a855f7', '#06b6d4'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * 0.4;
      this.vy    = (Math.random() - 0.5) * 0.4;
      this.r     = Math.random() * 1.8 + 0.8;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.pulse += 0.02;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      const alpha = 0.5 + 0.3 * Math.sin(this.pulse);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
      g.addColorStop(0, this.color + '40'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.globalAlpha = alpha * 0.4; ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.lineWidth   = 0.6;
          ctx.globalAlpha = (1 - d / CONNECTION_DIST) * 0.18;
          ctx.stroke();
        }
      }
    }
  }

  let rings = [];
  setInterval(() => {
    rings.push({ x: Math.random()*W, y: Math.random()*H, r: 0,
      maxR: 80 + Math.random()*60, color: COLORS[Math.floor(Math.random()*COLORS.length)] });
  }, 2200);

  function drawRings() {
    rings = rings.filter(r => r.r < r.maxR);
    rings.forEach(ring => {
      ring.r += 0.8;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth   = 1;
      ctx.globalAlpha = (1 - ring.r / ring.maxR) * 0.15;
      ctx.stroke();
    });
  }

  resize();
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.7);
    grad.addColorStop(0, 'rgba(6,15,42,0)');
    grad.addColorStop(1, 'rgba(2,8,24,0.6)');
    ctx.fillStyle = grad; ctx.globalAlpha = 1; ctx.fillRect(0, 0, W, H);
    drawConnections(); drawRings();
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize', resize);
})();


/* ===== BLOCH SPHERE ===== */
(function () {
  const canvas = document.getElementById('bloch-sphere');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let phi = 0;

  // Isometric-style projection matching standard textbook Bloch sphere
  // Z = up, X = lower-right, Y = lower-left
  function proj(x, y, z, R, cx, cy) {
    return {
      x: cx + R * (x * 0.72 - y * 0.50),
      y: cy - R * (z  - x * 0.30 - y * 0.22),
      d: -x * 0.30 - y * 0.22 + z * 0.05   // positive = front
    };
  }

  function arrow(x1, y1, x2, y2, color, lw, hs) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hs * Math.cos(a - 0.38), y2 - hs * Math.sin(a - 0.38));
    ctx.lineTo(x2 - hs * Math.cos(a + 0.38), y2 - hs * Math.sin(a + 0.38));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }

  function setSize() {
    const p = canvas.parentElement;
    const s = Math.min(p.clientWidth, 440);
    canvas.width = s; canvas.height = s;
  }

  function draw() {
    const s  = canvas.width;
    const R  = s * 0.30;
    const cx = s * 0.50;
    const cy = s * 0.50;
    ctx.clearRect(0, 0, s, s);

    // Sphere glow
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
    bg.addColorStop(0,   'rgba(0,229,255,0.06)');
    bg.addColorStop(0.6, 'rgba(59,130,246,0.03)');
    bg.addColorStop(1,   'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = bg; ctx.fill();

    // Sphere outline
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,229,255,0.28)'; ctx.lineWidth = 1.5; ctx.stroke();

    // Latitude circles
    [-0.65, 0, 0.65].forEach(z0 => {
      const r0 = Math.sqrt(Math.max(0, 1 - z0 * z0));
      ctx.beginPath();
      let first = true;
      for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) {
        const p = proj(r0 * Math.cos(t), r0 * Math.sin(t), z0, R, cx, cy);
        first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        first = false;
      }
      ctx.closePath();
      ctx.strokeStyle = z0 === 0 ? 'rgba(0,229,255,0.22)' : 'rgba(0,229,255,0.09)';
      ctx.lineWidth = z0 === 0 ? 1.2 : 0.7; ctx.stroke();
    });

    // Meridian circles (2 great circles)
    [0, Math.PI / 2].forEach(lon => {
      // back dashed
      ctx.beginPath(); ctx.setLineDash([3, 5]); let first = true;
      for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) {
        const p = proj(Math.cos(lon)*Math.sin(t), Math.sin(lon)*Math.sin(t), Math.cos(t), R, cx, cy);
        if (p.d < 0) { first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); first = false; }
        else { first = true; }
      }
      ctx.strokeStyle = 'rgba(0,229,255,0.09)'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.setLineDash([]);
      // front solid
      ctx.beginPath(); first = true;
      for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) {
        const p = proj(Math.cos(lon)*Math.sin(t), Math.sin(lon)*Math.sin(t), Math.cos(t), R, cx, cy);
        if (p.d >= 0) { first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); first = false; }
        else { first = true; }
      }
      ctx.strokeStyle = 'rgba(0,229,255,0.18)'; ctx.lineWidth = 0.8; ctx.stroke();
    });

    // Axes
    const zA = proj(0, 0,  1.38, R, cx, cy);
    const zB = proj(0, 0, -1.38, R, cx, cy);
    arrow(zB.x, zB.y, zA.x, zA.y, 'rgba(0,229,255,0.75)', 1.5, s*0.018);

    const xA = proj( 1.38, 0, 0, R, cx, cy);
    const xB = proj(-0.75, 0, 0, R, cx, cy);
    arrow(xB.x, xB.y, xA.x, xA.y, 'rgba(168,85,247,0.65)', 1.2, s*0.016);

    const yA = proj(0,  1.38, 0, R, cx, cy);
    const yB = proj(0, -0.75, 0, R, cx, cy);
    arrow(yB.x, yB.y, yA.x, yA.y, 'rgba(59,130,246,0.65)', 1.2, s*0.016);

    // Axis labels
    ctx.textBaseline = 'middle';
    const fBase = Math.round(s * 0.055);

    ctx.font = `500 ${fBase}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = 'rgba(0,229,255,0.9)';
    ctx.textAlign = 'center'; ctx.fillText('|0⟩', zA.x, zA.y - fBase * 0.9);
    ctx.textAlign = 'center'; ctx.fillText('|1⟩', zB.x, zB.y + fBase * 0.9);

    ctx.fillStyle = 'rgba(168,85,247,0.85)';
    ctx.textAlign = 'left';   ctx.fillText('|+⟩', xA.x + 5, xA.y);

    ctx.fillStyle = 'rgba(59,130,246,0.85)';
    ctx.textAlign = 'left';   ctx.fillText('|i⟩', yA.x + 5, yA.y);

    // Precession dashed ring for |ψ⟩
    const THETA = 1.05;
    const rP = Math.sin(THETA);
    const zP = Math.cos(THETA);
    ctx.beginPath(); ctx.setLineDash([3, 6]); let first2 = true;
    for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) {
      const p = proj(rP * Math.cos(t), rP * Math.sin(t), zP, R, cx, cy);
      first2 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); first2 = false;
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,229,255,0.18)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.setLineDash([]);

    // State vector
    const sx = Math.sin(THETA) * Math.cos(phi);
    const sy = Math.sin(THETA) * Math.sin(phi);
    const sz = Math.cos(THETA);
    const tip    = proj(sx * 1.02, sy * 1.02, sz * 1.02, R, cx, cy);
    const origin = proj(0, 0, 0, R, cx, cy);
    const base   = proj(sx, sy, 0, R, cx, cy);

    // Projection lines (dashed, subtle)
    ctx.beginPath(); ctx.setLineDash([3, 5]);
    ctx.moveTo(origin.x, origin.y); ctx.lineTo(base.x, base.y);
    ctx.moveTo(base.x, base.y);     ctx.lineTo(tip.x,  tip.y);
    ctx.strokeStyle = 'rgba(0,229,255,0.15)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.setLineDash([]);

    // Main vector — glowing
    ctx.shadowBlur = 18; ctx.shadowColor = '#00e5ff';
    arrow(origin.x, origin.y, tip.x, tip.y, '#00e5ff', 2.5, s * 0.022);
    ctx.shadowBlur = 0;

    // Tip dot
    ctx.beginPath(); ctx.arc(tip.x, tip.y, s * 0.014, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.shadowBlur = 22; ctx.shadowColor = '#00e5ff'; ctx.fill(); ctx.shadowBlur = 0;

    // |ψ⟩ label
    ctx.font = `bold ${Math.round(s * 0.058)}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = '#00e5ff'; ctx.textAlign = 'left';
    ctx.shadowBlur = 10; ctx.shadowColor = '#00e5ff';
    ctx.fillText('|ψ⟩', tip.x + s * 0.03, tip.y - s * 0.02);
    ctx.shadowBlur = 0;

    // Theta arc hint
    const arcR = R * 0.26;
    const zA_dir = proj(0, 0, 1, 1, 0, 0);
    ctx.beginPath();
    ctx.arc(cx, cy - 0, arcR, -Math.PI / 2, -Math.PI / 2 + THETA, false);
    ctx.strokeStyle = 'rgba(0,229,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.font = `${Math.round(s * 0.036)}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = 'rgba(0,229,255,0.55)'; ctx.textAlign = 'left';
    ctx.fillText('θ', cx + arcR * 0.4, cy - arcR * 0.7);

    // Bottom label
    ctx.font = `${Math.round(s * 0.030)}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = 'rgba(0,229,255,0.28)'; ctx.textAlign = 'center';
    ctx.fillText('Bloch Sphere', cx, s * 0.95);

    phi += 0.007;
  }

  setSize();
  window.addEventListener('resize', () => { setSize(); });

  (function loop() { draw(); requestAnimationFrame(loop); })();
})();


/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});


/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));


/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), +(entry.target.dataset.delay || 0));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.research-card').forEach(el => revealObserver.observe(el));


/* ===== ACTIVE NAV ===== */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 120) current = sec.id; });
  navAnchors.forEach(a => { a.style.color = a.getAttribute('href') === '#' + current ? '#00e5ff' : ''; });
});
