import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuraLogo } from './AuraLogo';

export interface IntroSplashProps {
  onComplete: () => void;
  durationMs?: number;
  reducedMotion?: boolean;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({
  onComplete,
  durationMs = 1400,
  reducedMotion = false,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const completedRef = useRef(false);

  const finishSplash = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    finishSplash();
  }, [finishSplash]);

  useEffect(() => {
    const effectiveDuration = reducedMotion ? Math.min(durationMs, 350) : durationMs;
    const fadeOutLead = reducedMotion ? 0 : Math.min(220, Math.floor(effectiveDuration * 0.18));

    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, Math.max(0, effectiveDuration - fadeOutLead));

    const doneTimer = window.setTimeout(() => {
      finishSplash();
    }, effectiveDuration);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [durationMs, reducedMotion, finishSplash]);

  return (
    <div
      className={`aura-intro-splash ${isExiting ? 'is-exiting' : ''}`.trim()}
      role="dialog"
      aria-label="Bienvenida a Telegram AURA"
      data-testid="intro-splash"
    >
      <button
        type="button"
        onClick={handleSkip}
        className="aura-splash-skip-btn"
        aria-label="Saltar introducción"
        data-testid="splash-skip-button"
      >
        Saltar
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          animation: reducedMotion ? 'none' : 'auraSplashFadeIn 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}
      >
        <AuraLogo size={104} animated={!reducedMotion} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          <span
            style={{
              fontSize: '0.74rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent-amethyst)',
              fontWeight: 600,
            }}
          >
            Telegram AURA
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Tus ideas, conectadas.
          </h1>
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              maxWidth: '280px',
            }}
          >
            Observatorio visual de notas, enlaces y mensajes en constelaciones vivas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntroSplash;
