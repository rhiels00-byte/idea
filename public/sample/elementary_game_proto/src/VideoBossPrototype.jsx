import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Elementary video -> playable boss prototype
 *
 * Recommended asset placement:
 * public/assets/elementary.mp4
 *
 * This component does NOT pretend the source video is a clean sprite sheet.
 * Instead, it uses carefully chosen video time ranges as animation states.
 * That makes it the fastest path to a real demo while preserving the original look.
 */

const DEFAULT_SEGMENTS = {
  idle: {
    start: 6.45,
    end: 7.95,
    loop: true,
    label: 'Idle loop',
  },
  hitLight: {
    start: 1.05,
    end: 2.25,
    loop: false,
    label: 'Light hit',
    next: 'idle',
  },
  hitBig: {
    start: 2.9,
    end: 5.15,
    loop: false,
    label: 'Big splash hit',
    next: 'recover',
  },
  recover: {
    start: 5.55,
    end: 6.35,
    loop: false,
    label: 'Recover',
    next: 'idle',
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function VideoBossPrototype({
  src = '/assets/elementary.mp4',
  width = 960,
  autoPlay = true,
}) {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const [state, setState] = useState('idle');
  const [hp, setHp] = useState(100);
  const [isReady, setIsReady] = useState(false);
  const [lastDamage, setLastDamage] = useState(null);
  const [combo, setCombo] = useState(0);

  const segments = useMemo(() => DEFAULT_SEGMENTS, []);
  const activeSegment = segments[state];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      setIsReady(true);
      video.currentTime = segments.idle.start;
      if (autoPlay) {
        video.play().catch(() => {});
      }
    };

    video.addEventListener('loadedmetadata', onLoaded);
    return () => video.removeEventListener('loadedmetadata', onLoaded);
  }, [autoPlay, segments]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady || !activeSegment) return;

    const syncToSegment = async () => {
      const current = video.currentTime;
      const outside = current < activeSegment.start || current > activeSegment.end;
      if (outside) {
        video.currentTime = activeSegment.start;
      }
      if (autoPlay && video.paused) {
        try {
          await video.play();
        } catch {
          // autoplay can be blocked by browser policy
        }
      }
    };

    syncToSegment();

    const tick = () => {
      const v = videoRef.current;
      if (!v) return;
      const seg = segments[state];
      if (!seg) return;

      if (v.currentTime >= seg.end - 0.016) {
        if (seg.loop) {
          v.currentTime = seg.start;
          if (autoPlay && v.paused) v.play().catch(() => {});
        } else {
          setState(seg.next || 'idle');
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state, isReady, autoPlay, activeSegment, segments]);

  const triggerHit = (amount = 8, type = 'light') => {
    setHp((prev) => clamp(prev - amount, 0, 100));
    setLastDamage(amount);
    setCombo((prev) => prev + 1);
    setState(type === 'big' ? 'hitBig' : 'hitLight');

    window.clearTimeout(window.__bossDamageTimer);
    window.__bossDamageTimer = window.setTimeout(() => {
      setLastDamage(null);
    }, 650);
  };

  const resetBoss = () => {
    setHp(100);
    setCombo(0);
    setLastDamage(null);
    setState('idle');
    const video = videoRef.current;
    if (video) {
      video.currentTime = segments.idle.start;
      video.play().catch(() => {});
    }
  };

  return (
    <div style={{ fontFamily: 'Pretendard, system-ui, sans-serif', color: '#fff' }}>
      <div
        style={{
          width,
          margin: '0 auto',
          background: '#111827',
          borderRadius: 24,
          padding: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.75 }}>초등 보스 프로토타입</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Blue Splash Boss</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, opacity: 0.75 }}>현재 상태</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{activeSegment?.label ?? state}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
            <span>Boss HP</span>
            <span>{hp}%</span>
          </div>
          <div style={{ height: 18, background: 'rgba(255,255,255,0.16)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${hp}%`,
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)',
                transition: 'width 260ms ease',
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            background: '#000',
            aspectRatio: '16 / 9',
          }}
        >
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {lastDamage !== null && (
            <div
              style={{
                position: 'absolute',
                top: '18%',
                right: '10%',
                fontSize: 42,
                fontWeight: 900,
                textShadow: '0 8px 20px rgba(0,0,0,0.45)',
                animation: 'floatDamage 650ms ease-out forwards',
              }}
            >
              -{lastDamage}
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              left: 16,
              bottom: 16,
              background: 'rgba(17,24,39,0.78)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 16,
              padding: '10px 12px',
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            <div>state: <strong>{state}</strong></div>
            <div>combo: <strong>{combo}</strong></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <button onClick={() => triggerHit(8, 'light')} style={buttonStyle.primary}>가벼운 공격</button>
          <button onClick={() => triggerHit(20, 'big')} style={buttonStyle.secondary}>강한 공격</button>
          <button onClick={resetBoss} style={buttonStyle.ghost}>리셋</button>
          <button onClick={() => setState('idle')} style={buttonStyle.ghost}>Idle로 복귀</button>
        </div>

        <div style={{ marginTop: 18, fontSize: 13, opacity: 0.78, lineHeight: 1.6 }}>
          이 버전은 <strong>영상 세그먼트 상태 제어형</strong>이다. 실제 제품 단계에서는 캐릭터, 이펙트, UI를 분리한 뒤
          스프라이트 시트 또는 Spine/Lottie 스타일 구조로 재정리하는 것을 권장한다.
        </div>
      </div>

      <style>{`
        @keyframes floatDamage {
          0% { transform: translateY(0) scale(0.9); opacity: 0; }
          15% { transform: translateY(-8px) scale(1); opacity: 1; }
          100% { transform: translateY(-42px) scale(1.04); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const buttonBase = {
  border: 'none',
  borderRadius: 14,
  padding: '12px 16px',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
};

const buttonStyle = {
  primary: {
    ...buttonBase,
    background: '#2563EB',
    color: '#fff',
  },
  secondary: {
    ...buttonBase,
    background: '#7C3AED',
    color: '#fff',
  },
  ghost: {
    ...buttonBase,
    background: '#E5E7EB',
    color: '#111827',
  },
};
