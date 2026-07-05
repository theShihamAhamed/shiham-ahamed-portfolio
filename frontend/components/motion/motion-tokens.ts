export const motionTokens = {
  duration: {
    fast: 0.24,
    base: 0.42,
    slow: 0.62,
  },
  ease: [0.22, 1, 0.36, 1],
  stagger: {
    small: 0.045,
    medium: 0.075,
  },
  distance: {
    tiny: 3,
    small: 6,
    medium: 10,
  },
  viewport: {
    once: true,
    amount: 0.18,
  },
} as const;
