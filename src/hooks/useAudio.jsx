import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioCtx } from './audioContext.js';
import { audio as audioConfig } from '../content/site.config.js';
import { clamp } from '../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   Audio system.

   One <audio> element for the whole experience, owned here and
   exposed through context. Browsers refuse to start sound without a
   gesture, so playback is armed at the Entrance gate — the visitor's
   click on "Enter Your Little World" is the gesture. If that still
   fails, we listen once for the next real interaction rather than
   nagging with a banner.
   ══════════════════════════════════════════════════════════════════ */

const UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'keydown'];

export function AudioProvider({ children }) {
  const ref = useRef(null);
  const fadeRef = useRef(null);

  const [isPlaying, setPlaying] = useState(false);
  const [isMuted, setMuted] = useState(false);
  const [volume, setVolumeState] = useState(audioConfig.defaultVolume);
  const [progress, setProgress] = useState(0);   // 0..1
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [blocked, setBlocked] = useState(false); // autoplay refused

  /* — Element events ————————————————————————————— */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.volume = volume;

    const onTime = () => {
      setCurrent(el.currentTime);
      if (el.duration) setProgress(el.currentTime / el.duration);
    };
    const onMeta = () => setDuration(el.duration || 0);
    const onPlay = () => { setPlaying(true); setBlocked(false); };
    const onPause = () => setPlaying(false);

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('durationchange', onMeta);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);

    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('durationchange', onMeta);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
    };
    // volume intentionally excluded — handled by its own effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Clear any in-flight fade when we unmount. */
  useEffect(() => () => cancelAnimationFrame(fadeRef.current), []);

  const play = useCallback(async () => {
    const el = ref.current;
    if (!el) return false;
    try {
      await el.play();
      setBlocked(false);
      return true;
    } catch {
      setBlocked(true);
      /* Arm a one-shot unlock on the next genuine interaction. */
      const unlock = () => {
        UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, unlock));
        el.play().then(() => setBlocked(false)).catch(() => {});
      };
      UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, unlock, { once: true, passive: true }));
      return false;
    }
  }, []);

  const pause = useCallback(() => { ref.current?.pause(); }, []);

  const toggle = useCallback(() => {
    if (ref.current?.paused) play(); else pause();
  }, [play, pause]);

  const setVolume = useCallback((v) => {
    const next = clamp(v, 0, 1);
    setVolumeState(next);
    if (ref.current) ref.current.volume = next;
    if (next > 0 && ref.current?.muted) { ref.current.muted = false; setMuted(false); }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (ref.current) ref.current.muted = next;
      return next;
    });
  }, []);

  const seek = useCallback((ratio) => {
    const el = ref.current;
    if (!el || !el.duration) return;
    el.currentTime = clamp(ratio, 0, 1) * el.duration;
    setProgress(clamp(ratio, 0, 1));
  }, []);

  /* Smooth volume ramp, rAF-driven and cancellable — used when a
     chapter wants the room to get quieter or swell. */
  const fadeTo = useCallback((target, ms = 1200) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(fadeRef.current);
    const from = el.volume;
    const to = clamp(target, 0, 1);
    const t0 = performance.now();
    const step = (now) => {
      const t = clamp((now - t0) / ms, 0, 1);
      const eased = t * t * (3 - 2 * t);
      el.volume = from + (to - from) * eased;
      setVolumeState(el.volume);
      if (t < 1) fadeRef.current = requestAnimationFrame(step);
    };
    fadeRef.current = requestAnimationFrame(step);
  }, []);

  const restart = useCallback(() => {
    if (ref.current) ref.current.currentTime = 0;
  }, []);

  const value = useMemo(() => ({
    isPlaying, isMuted, volume, progress, duration, current, blocked,
    play, pause, toggle, setVolume, toggleMute, seek, fadeTo, restart,
  }), [isPlaying, isMuted, volume, progress, duration, current, blocked,
       play, pause, toggle, setVolume, toggleMute, seek, fadeTo, restart]);

  return (
    <AudioCtx.Provider value={value}>
      <audio
        ref={ref}
        src={audioConfig.src}
        loop
        preload="auto"
        playsInline
      />
      {children}
    </AudioCtx.Provider>
  );
}
