import confetti from 'canvas-confetti';

export const triggerCelebration = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#10b981', '#06b6d4', '#3b82f6'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#34d399', '#60a5fa', '#a78bfa'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#10b981', '#14b8a6', '#f59e0b'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#6ee7b7', '#93c5fd'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#10b981', '#f43f5e'],
  });
};

export const triggerQuickSuccess = (x: number = 0.5, y: number = 0.5) => {
  confetti({
    particleCount: 35,
    spread: 45,
    origin: { x, y },
    colors: ['#10b981', '#14b8a6', '#06b6d4', '#6366f1'],
    ticks: 150,
    gravity: 1.2,
    scalar: 0.7,
    zIndex: 9999,
  });
};
