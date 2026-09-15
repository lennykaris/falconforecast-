import React, { useMemo } from 'react';

const COLORS = ['#0EA5E9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const PIECE_COUNT = 60;

/** A one-shot confetti burst — no new dependency, just CSS keyframes + randomized pieces.
 * Mount it when a payment actually completes (it's a betting/tipster site — a successful
 * payment should feel like a winning moment, not just a form closing) and let it unmount
 * itself; it doesn't loop or need to be told to stop. */
export const Confetti: React.FC = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 2.2 + Math.random() * 1.3,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 120,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translate(0, -10vh) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 110vh) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: 1,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            ['--drift' as any]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
};
