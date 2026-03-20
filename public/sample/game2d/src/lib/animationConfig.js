export const ANIMATIONS = {
  idle: {
    key: 'idle',
    src: '/sprites/idle.png',
    frameWidth: 280,
    frameHeight: 215,
    frames: 9,
    fps: 8,
    loop: true,
    next: null,
  },
  hit: {
    key: 'hit',
    src: '/sprites/hit.png',
    frameWidth: 280,
    frameHeight: 215,
    frames: 11,
    fps: 14,
    loop: false,
    next: 'recover',
  },
  recover: {
    key: 'recover',
    src: '/sprites/recover.png',
    frameWidth: 280,
    frameHeight: 215,
    frames: 4,
    fps: 8,
    loop: false,
    next: 'idle',
  },
}

export const GAME_SIZE = {
  width: 960,
  height: 540,
}

export const CHARACTER_LAYOUT = {
  x: 480,
  y: 305,
  width: 420,
  height: 323,
  shadowWidth: 240,
  shadowHeight: 40,
}
