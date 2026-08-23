import React, { useEffect, useRef } from 'react';

const RING_TICKS = '0.6 4.4';
const RING_SEGMENTS = '26 20 10 30 16 24 40 18';
const ARC_A = '70 130';
const ARC_B = '46 74 90 150';

function ScannerRings() {
  return (
    <div className="bio-scanner-stack">
      <svg className="bio-ring bio-ring--ticks" viewBox="0 0 200 200" aria-hidden="true">
        <circle className="bio-ring__spin-cw-40" cx="100" cy="100" r="96" fill="none" stroke="url(#bioStrokeFaint)" strokeWidth="1.1" />
        <g className="bio-ring__spin-cw-40">
          <circle cx="100" cy="100" r="88" fill="none" stroke="#67e8f9" strokeWidth="2.6" strokeDasharray={RING_TICKS} opacity="0.16" />
        </g>
      </svg>

      <svg className="bio-ring bio-ring--segments" viewBox="0 0 200 200" aria-hidden="true">
        <g className="bio-ring__spin-ccw-32">
          <circle cx="100" cy="100" r="76" fill="none" stroke="url(#bioStrokeCyan)" strokeWidth="1.5" strokeDasharray={RING_SEGMENTS} strokeLinecap="round" opacity="0.34" />
        </g>
        <circle cx="100" cy="100" r="69" fill="none" stroke="#3b82f6" strokeWidth="0.7" strokeDasharray="2 9" opacity="0.22" />
      </svg>

      <svg className="bio-ring bio-ring--arcs" viewBox="0 0 200 200" aria-hidden="true">
        <g className="bio-ring__spin-cw-24">
          <circle cx="100" cy="100" r="57" fill="none" stroke="url(#bioStrokeBright)" strokeWidth="2" strokeDasharray={ARC_A} strokeLinecap="round" opacity="0.5" />
          <circle className="bio-orbiter-dot" cx="157" cy="100" r="1.8" fill="#67e8f9" />
        </g>
      </svg>

      <div className="bio-disc bio-disc--a">
        <svg className="bio-ring" viewBox="0 0 200 200" aria-hidden="true">
          <g className="bio-ring__spin-ccw-48">
            <ellipse cx="100" cy="100" rx="84" ry="84" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 14" opacity="0.28" />
            <circle cx="184" cy="100" r="1.5" fill="#93c5fd" opacity="0.75" />
          </g>
        </svg>
      </div>

      <div className="bio-disc bio-disc--b">
        <svg className="bio-ring" viewBox="0 0 200 200" aria-hidden="true">
          <g className="bio-ring__spin-cw-36">
            <ellipse cx="100" cy="100" rx="92" ry="92" fill="none" stroke="url(#bioStrokeViolet)" strokeWidth="0.9" strokeDasharray={ARC_B} strokeLinecap="round" opacity="0.3" />
          </g>
        </svg>
      </div>

      <div className="bio-core-glow" />

      <FaceLandmarks />

      <div className="bio-scan-band">
        <div className="bio-scan-track">
          <span className="bio-scanline" />
        </div>
      </div>
    </div>
  );
}

function FaceLandmarks() {
  return (
    <svg className="bio-face" viewBox="0 0 200 200" aria-hidden="true">
      <g className="bio-face__breathe">
        <path d="M78 66 Q100 58 122 66" fill="none" stroke="#67e8f9" strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
        <path d="M80 128 Q100 140 120 128" fill="none" stroke="#67e8f9" strokeWidth="0.7" strokeLinecap="round" opacity="0.3" />
        <ellipse cx="100" cy="102" rx="27" ry="33" fill="none" stroke="url(#bioStrokeCyan)" strokeWidth="0.8" strokeDasharray="52 12 30 10 44 14" opacity="0.3" />

        <path d="M86 94 Q91 89 97 94" fill="none" stroke="#67e8f9" strokeWidth="0.9" strokeLinecap="round" opacity="0.55" />
        <path d="M103 94 Q109 89 114 94" fill="none" stroke="#67e8f9" strokeWidth="0.9" strokeLinecap="round" opacity="0.55" />
        <path d="M100 98 L99.2 113 L104 116" fill="none" stroke="#67e8f9" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
        <path d="M91 124 Q100 129 109 124" fill="none" stroke="#67e8f9" strokeWidth="0.8" strokeLinecap="round" opacity="0.42" />

        <polyline
          points="89,95 82,103 84,124 100,133 116,124 118,103 111,95 103,94 97,94"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="0.45"
          strokeDasharray="3 4"
          opacity="0.3"
        />
        <polyline points="89,95 111,95 118,103" fill="none" stroke="#38bdf8" strokeWidth="0.45" strokeDasharray="3 4" opacity="0.22" />

        {[
          [89, 95], [111, 95], [97, 94], [103, 94], [82, 103], [118, 103],
          [84, 124], [116, 124], [100, 133], [99.2, 113], [104, 116], [100, 126],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.05" fill="#a5f3fc" opacity="0.6" />
        ))}

        <g className="bio-face__brackets" stroke="#22d3ee" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.4">
          <path d="M64 76 L64 66 L74 66" />
          <path d="M126 66 L136 66 L136 76" />
          <path d="M136 128 L136 138 L126 138" />
          <path d="M74 138 L64 138 L64 128" />
        </g>

        <g stroke="#67e8f9" strokeWidth="0.7" opacity="0.35">
          <line x1="49" y1="102" x2="59" y2="102" />
          <line x1="141" y1="102" x2="151" y2="102" />
          <line x1="100" y1="51" x2="100" y2="61" />
          <line x1="100" y1="143" x2="100" y2="153" />
        </g>
      </g>
    </svg>
  );
}

function ParticleNetwork() {
  const nodes = [
    { x: 120, y: 180, d: 19 }, { x: 320, y: 110, d: 26 }, { x: 520, y: 210, d: 15 },
    { x: 1310, y: 160, d: 23 }, { x: 1150, y: 300, d: 17 }, { x: 1340, y: 700, d: 29 },
    { x: 1120, y: 800, d: 21 }, { x: 220, y: 720, d: 25 }, { x: 420, y: 810, d: 16 },
    { x: 90, y: 480, d: 31 },
  ];
  const links = [
    [0, 1], [1, 2], [3, 4], [4, 5], [5, 6], [7, 8], [7, 9], [0, 9],
  ];

  return (
    <svg
      className="bio-network"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bioLinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {links.map(([a, b], i) => (
        <line
          key={`l-${i}`}
          className={`bio-link bio-link--${(i % 4) + 1}`}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="url(#bioLinkGrad)"
          strokeWidth="0.8"
        />
      ))}

      {nodes.map((n, i) => (
        <g
          key={`n-${i}`}
          className={`bio-node bio-node--${(i % 5) + 1}`}
          style={{ animationDuration: `${n.d}s` }}
        >
          <circle cx={n.x} cy={n.y} r="1.6" fill="#7dd3fc" opacity="0.55" />
          <circle cx={n.x} cy={n.y} r="4.5" fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity="0.2" />
        </g>
      ))}
    </svg>
  );
}

export default function BiometricLoginBackground() {
  const rootRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onMove = (e) => {
      if (reducedMotion.matches || frameRef.current) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        const mx = (e.clientX / window.innerWidth) * 2 - 1;
        const my = (e.clientY / window.innerHeight) * 2 - 1;
        root.style.setProperty('--bio-mx', mx.toFixed(3));
        root.style.setProperty('--bio-my', my.toFixed(3));
      });
    };

    const onFocusIn = (e) => {
      if (e.target.closest && e.target.closest('.login-card')) {
        root.classList.add('is-focused');
      }
    };

    const onFocusOut = (e) => {
      if (e.target.closest && e.target.closest('.login-card')) {
        root.classList.remove('is-focused');
      }
    };

    let pulseTimer = 0;
    const onSubmitCapture = () => {
      root.classList.add('is-pulsing');
      window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(() => root.classList.remove('is-pulsing'), 1400);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    window.addEventListener('submit', onSubmitCapture, true);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('submit', onSubmitCapture, true);
      window.clearTimeout(pulseTimer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div ref={rootRef} className="bio-scene" aria-hidden="true">

      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <linearGradient id="bioStrokeFaint" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="bioStrokeCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="bioStrokeBright" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="bioStrokeViolet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.32" />
          </linearGradient>
        </defs>
      </svg>

      <div className="bio-parallax bio-parallax--ambient">
        <div className="bio-orb bio-orb--blue" />
        <div className="bio-orb bio-orb--violet" />
        <div className="bio-orb bio-orb--cyan" />
        <div className="bio-orb bio-orb--indigo" />
      </div>

      <div className="bio-parallax bio-parallax--network">
        <ParticleNetwork />
      </div>

      <div className="bio-parallax bio-parallax--scanner">
        <div className="bio-scanner-pos">
          <ScannerRings />
        </div>
      </div>

      <div className="bio-vignette" />
    </div>
  );
}
