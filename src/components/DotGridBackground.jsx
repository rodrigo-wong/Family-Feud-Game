import { useMemo } from 'react';

function pseudoRandom(index, salt) {
  const value = Math.sin(index * 12.9898 + salt) * 43758.5453;
  return value - Math.floor(value);
}

function DotGridBackground({ columns = 32, rows = 18, className = '' }) {
  const dots = useMemo(() => {
    const total = columns * rows;
    return Array.from({ length: total }, (_, index) => {
        return ({
            delay: (8 * pseudoRandom(index, 1)).toFixed(2),
            duration: (5 + pseudoRandom(index, 2) * 7).toFixed(2),
            peak: (0.25 + pseudoRandom(index, 3) * 0.65).toFixed(2),
        });
    });
  }, [columns, rows]);

  return (
    <div
      className={`fixed inset-0 z-[-1] overflow-hidden bg-[radial-gradient(ellipse_at_center,_#0d2b6b_0%,_#081c4d_50%,_#020a24_100%)] ${className}`.trim()}
    >
      <div
        className="grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {dots.map((dot, i) => (
          <span
            key={i}
            className="block place-self-center w-[55%] aspect-square rounded-full opacity-[0.08] blur-[0.5px] bg-[radial-gradient(circle,_rgba(140,185,255,0.95)_0%,_rgba(80,130,230,0.55)_60%,_rgba(80,130,230,0)_100%)] animate-dot-dim motion-reduce:animate-none motion-reduce:opacity-35"
            style={{
              animationDuration: `${dot.duration}s`,
              animationDelay: `${dot.delay}s`,
              '--peak': dot.peak,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default DotGridBackground;
