export const animationPlan = {
  sourceVideo: 'elementary.mp4',
  fps: 24,
  durationSec: 8,
  recommendation: 'Use video-segment prototype first, then separate character/effects/UI for production assets.',
  states: {
    idle: {
      startSec: 6.45,
      endSec: 7.95,
      loop: true,
      notes: 'Most stable window. Character readable, minimal overlay text.',
    },
    hitLight: {
      startSec: 1.05,
      endSec: 2.25,
      loop: false,
      next: 'idle',
      notes: 'Usable as light hit reaction, but includes critical-hit text and impact VFX.',
    },
    hitBig: {
      startSec: 2.9,
      endSec: 5.15,
      loop: false,
      next: 'recover',
      notes: 'Good for special attack / finisher feel. Heavy overlay text included.',
    },
    recover: {
      startSec: 5.55,
      endSec: 6.35,
      loop: false,
      next: 'idle',
      notes: 'Transition back into calm idle pose.',
    },
  },
  productionWarnings: [
    'UI is baked into the video (boss HP, pause buttons, emoji).',
    'Damage numbers and text effects are baked into the source.',
    'Full-scene video is fine for prototype, but not ideal as reusable sprite asset.',
  ],
  productionPath: [
    'Rebuild clean background as a separate layer.',
    'Redraw or isolate boss character on transparent frames.',
    'Move hit VFX to separate overlay system.',
    'Keep gameplay HUD outside the animation asset.',
  ],
};
