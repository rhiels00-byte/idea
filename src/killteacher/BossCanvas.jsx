import { useEffect, useRef, useState } from 'react';

const VIDEO_SEGMENTS = {
  초등: {
    src: '/videos/elementary.mp4',
    idle: { start: 6.45, end: 7.95, loop: true },
    hitLight: { start: 1.05, end: 2.25, loop: false, next: 'idle' },
    hitBig: { start: 2.9, end: 5.15, loop: false, next: 'recover' },
    recover: { start: 5.55, end: 6.35, loop: false, next: 'idle' },
  },
  중등: {
    src: '/videos/middle.mp4',
    idle: { start: 7.2, end: 7.9, loop: true },
    hitLight: { start: 1.05, end: 2.25, loop: false, next: 'idle' },
    hitBig: { start: 2.9, end: 5.15, loop: false, next: 'recover' },
    recover: { start: 5.55, end: 6.35, loop: false, next: 'idle' },
  },
  고등: {
    src: '/videos/high.mp4',
    idle: { start: 6.45, end: 7.95, loop: true },
    hitLight: { start: 1.05, end: 2.25, loop: false, next: 'idle' },
    hitBig: { start: 2.9, end: 5.15, loop: false, next: 'recover' },
    recover: { start: 5.55, end: 6.35, loop: false, next: 'idle' },
  },
};

const BossVideo = ({ level, bossHp, lastAttack, lastMiss, bossName }) => {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const prevAttackCounterRef = useRef(-1);
  const prevMissCounterRef = useRef(-1);
  const [animState, setAnimState] = useState('idle');
  const [lastDamage, setLastDamage] = useState(null);
  const [missText, setMissText] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const config = VIDEO_SEGMENTS[level] || null;
  const segment = config ? config[animState] : null;

  // Video loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !config) return;

    const onLoaded = () => {
      setIsReady(true);
      video.currentTime = config.idle.start;
      video.play().catch(() => {});
    };

    if (video.readyState >= 1) {
      onLoaded();
    } else {
      video.addEventListener('loadedmetadata', onLoaded);
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }
  }, [config]);

  // Segment sync + RAF tick
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady || !segment) return;

    // Jump to segment start
    const current = video.currentTime;
    if (current < segment.start || current > segment.end) {
      video.currentTime = segment.start;
    }
    if (video.paused) video.play().catch(() => {});

    const tick = () => {
      const v = videoRef.current;
      if (!v) return;

      if (v.currentTime >= segment.end - 0.02) {
        if (segment.loop) {
          v.currentTime = segment.start;
          if (v.paused) v.play().catch(() => {});
        } else {
          setAnimState(segment.next || 'idle');
          return; // new state will trigger new effect
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animState, isReady, segment]);

  // Trigger hit
  useEffect(() => {
    if (!lastAttack || lastAttack.counter == null) return;
    if (lastAttack.counter === prevAttackCounterRef.current) return;
    prevAttackCounterRef.current = lastAttack.counter;

    const hitType = lastAttack.damage >= 15 ? 'hitBig' : 'hitLight';
    setAnimState(hitType);
    setLastDamage(lastAttack.damage);

    const timer = setTimeout(() => setLastDamage(null), 800);
    return () => clearTimeout(timer);
  }, [lastAttack]);

  // Trigger miss
  useEffect(() => {
    if (!lastMiss || lastMiss.counter == null) return;
    if (lastMiss.counter === prevMissCounterRef.current) return;
    prevMissCounterRef.current = lastMiss.counter;

    setMissText(true);
    const timer = setTimeout(() => setMissText(false), 1200);
    return () => clearTimeout(timer);
  }, [lastMiss]);

  if (!config) return null;

  const hpPercent = Math.max(0, Math.min(100, bossHp ?? 100));

  return (
    <div>
      {/* Teacher name + HP bar outside the video */}
      <div className="mb-3 space-y-2">
        {bossName && (
          <p className="text-sm font-bold text-white">{bossName}</p>
        )}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">HP</span>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#ffb100,#ff6336)] transition-all duration-500"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-orange-300">{hpPercent}%</span>
        </div>
      </div>

      {/* Video container — fills parent, 16:9 */}
      <div className="relative overflow-hidden rounded-[20px] bg-black" style={{ aspectRatio: '16 / 9' }}>
        <video
          ref={videoRef}
          src={config.src}
          muted
          playsInline
          preload="auto"
          className="block h-full w-full object-cover"
        />

        {/* Floating damage number */}
        {lastDamage !== null && (
          <div
            key={`dmg-${prevAttackCounterRef.current}`}
            className="pointer-events-none absolute right-[10%] top-[15%] text-5xl font-black text-yellow-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            style={{ animation: 'floatDmg 800ms ease-out forwards' }}
          >
            -{lastDamage}
          </div>
        )}

        {/* Miss text */}
        {missText && (
          <div
            key={`miss-${prevMissCounterRef.current}`}
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40"
            style={{ animation: 'missFlash 1800ms ease-out forwards' }}
          >
            <span
              className="text-6xl font-black text-red-500 sm:text-7xl"
              style={{
                textShadow: '0 0 30px rgba(239,68,68,0.8), 0 0 60px rgba(239,68,68,0.4), 0 6px 20px rgba(0,0,0,0.7)',
                animation: 'missShake 200ms ease-in-out 3',
              }}
            >
              공격 실패!
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatDmg {
          0% { transform: translateY(0) scale(0.85); opacity: 0; }
          12% { transform: translateY(-6px) scale(1.05); opacity: 1; }
          100% { transform: translateY(-40px) scale(1); opacity: 0; }
        }
        @keyframes missFlash {
          0% { opacity: 0; }
          8% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes missShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};

export default BossVideo;
