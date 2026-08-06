import { useEffect, useRef } from 'react';

const COLORS = ['#facc15', '#f87171', '#60a5fa', '#4ade80', '#f472b6', '#ffffff'];
const GRAVITY = 0.035;
const FADE_STEP = 0.012;
const HOLD_FRAMES = 18;
const DURATION_MS = 6000;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function createBurst(x, y) {
  const count = Math.floor(randomRange(50, 80));
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + randomRange(-0.2, 0.2);
    const speed = randomRange(2, 5.5);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      hold: HOLD_FRAMES,
      color,
      size: randomRange(3, 5.5),
    });
  }
  return particles;
}

function Fireworks({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let lastLaunch = 0;
    let nextLaunchDelay = 0;
    let startTime = null;
    let rafId;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const launchFirework = () => {
      const x = randomRange(width * 0.15, width * 0.85);
      const y = randomRange(height * 0.1, height * 0.6);
      particles.push(...createBurst(x, y));
    };

    const tick = (time) => {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;

      if (elapsed < DURATION_MS && time - lastLaunch > nextLaunchDelay) {
        launchFirework();
        lastLaunch = time;
        nextLaunchDelay = randomRange(120, 160);
      }

      ctx.clearRect(0, 0, width, height);
      particles = particles.filter((p) => p.alpha > 0.02);
      for (const p of particles) {
        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        if (p.hold > 0) {
          p.hold -= 1;
        } else {
          p.alpha -= FADE_STEP;
        }
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed >= DURATION_MS && particles.length === 0) return;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  if (!active) return null;

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[45]" />;
}

export default Fireworks;
