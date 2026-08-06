import { useEffect, useRef } from 'react';

const COLORS = ['#facc15', '#f87171', '#60a5fa', '#4ade80', '#f472b6', '#ffffff'];
const GRAVITY = 0.035;
const FADE_STEP = 0.012;
const HOLD_FRAMES = 18;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function createBurst(x, y) {
  const count = Math.floor(randomRange(30, 50));
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + randomRange(-0.2, 0.2);
    const speed = randomRange(1.2, 3.5);
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
      if (time - lastLaunch > nextLaunchDelay) {
        launchFirework();
        lastLaunch = time;
        nextLaunchDelay = randomRange(80, 120);
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
