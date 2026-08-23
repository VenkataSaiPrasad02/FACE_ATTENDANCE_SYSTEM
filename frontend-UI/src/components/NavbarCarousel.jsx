import React, { useEffect, useRef, useState } from 'react';

const SLIDES = [
  {
    title: 'FACE ATTENDANCE SYSTEM',
    subtitle: 'BIOMETRIC SCAN • ACTIVE',
  },
  {
    title: 'POWERED BY TEAM LAZY',
    subtitle: 'SMART DIGITAL SOLUTIONS',
  },
];

const SLIDE_DURATION_MS = 6500;
const LETTER_STEP_MS = 55;

export default function NavbarCarousel() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [scanPhase, setScanPhase] = useState('idle');

  const slide = SLIDES[slideIndex];
  const letterTimerRef = useRef(null);
  const slideTimerRef = useRef(null);
  const scanTimerRef = useRef(null);

  // Letter-by-letter reveal, restarts on every slide change
  useEffect(() => {
    setVisibleChars(0);
    const totalChars = slide.title.length;
    let count = 0;

    letterTimerRef.current = setInterval(() => {
      count += 1;
      setVisibleChars(count);
      if (count >= totalChars) {
        clearInterval(letterTimerRef.current);
      }
    }, LETTER_STEP_MS);

    return () => clearInterval(letterTimerRef.current);
  }, [slideIndex, slide.title]);

  // Slide rotation loop
  useEffect(() => {
    slideTimerRef.current = setTimeout(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);

    return () => clearTimeout(slideTimerRef.current);
  }, [slideIndex]);

  // Scanner operator sequence loop: idle -> raise -> throw -> scanning -> return -> idle
  useEffect(() => {
    const sequence = [
      { phase: 'idle', delay: 1400 },
      { phase: 'raise', delay: 500 },
      { phase: 'throw', delay: 260 },
      { phase: 'scanning', delay: 900 },
      { phase: 'return', delay: 500 },
    ];

    let cancelled = false;

    function runSequence(step) {
      if (cancelled) return;
      const current = sequence[step % sequence.length];
      setScanPhase(current.phase);
      scanTimerRef.current = setTimeout(() => {
        runSequence(step + 1);
      }, current.delay);
    }

    runSequence(0);

    return () => {
      cancelled = true;
      clearTimeout(scanTimerRef.current);
    };
  }, []);

  const visibleTitle = slide.title.slice(0, visibleChars);

  return (
    <div
      className="navbar-carousel"
      role="img"
      aria-label={`${slide.title} — ${slide.subtitle}`}
    >
      {/* Animated gradient blobs */}
      <div className="navbar-carousel__bg" aria-hidden="true">
        <span className="navbar-carousel__blob navbar-carousel__blob--1" />
        <span className="navbar-carousel__blob navbar-carousel__blob--2" />
        <span className="navbar-carousel__blob navbar-carousel__blob--3" />
        <span className="navbar-carousel__grid" />
      </div>

      {/* Operator + scanner + beam */}
      <div
        className={`navbar-carousel__operator-zone navbar-carousel__operator-zone--${scanPhase}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 60 52"
          className="navbar-carousel__operator-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head */}
          <circle cx="16" cy="12" r="5" className="op-head" />
          {/* Torso */}
          <path d="M16 17 L16 34" className="op-torso" strokeLinecap="round" />
          {/* Back arm (static) */}
          <path d="M16 22 L9 30" className="op-arm-back" strokeLinecap="round" />
          {/* Throwing arm */}
          <path d="M16 21 L27 16" className="op-arm-throw" strokeLinecap="round" />
          {/* Legs */}
          <path d="M16 34 L11 46" className="op-leg" strokeLinecap="round" />
          <path d="M16 34 L21 46" className="op-leg" strokeLinecap="round" />
          {/* Scanner device at hand */}
          <rect x="25" y="12" width="7" height="5" rx="1.5" className="op-scanner" />
        </svg>

        {/* Scanning beam */}
        <span className="navbar-carousel__beam" />
      </div>

      {/* Face recognition HUD */}
      <div className="navbar-carousel__hud" aria-hidden="true">
        <span className="hud-corner hud-corner--tl" />
        <span className="hud-corner hud-corner--tr" />
        <span className="hud-corner hud-corner--bl" />
        <span className="hud-corner hud-corner--br" />
        <span className="hud-crosshair" />
        <span className="hud-scanline" />
      </div>

      {/* Text content */}
      <div className="navbar-carousel__text">
        <div className="navbar-carousel__title" key={slideIndex}>
          {visibleTitle.split('').map((char, idx) => (
            <span
              key={`${slideIndex}-${idx}`}
              className="navbar-carousel__letter"
              style={{ animationDelay: `${idx * 0.015}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
          <span className="navbar-carousel__caret" aria-hidden="true" />
        </div>

        <div className="navbar-carousel__subtitle">
          {slide.subtitle}
        </div>
      </div>
    </div>
  );
}