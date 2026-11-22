import { useEffect, useRef, useState } from 'react';
import './StoryCanvas.css';

const TOTAL_FRAMES = 1440;
const HERO_END_FRAME = 278; // frame_0278.jpg ends hero; frame_0279.jpg starts story
const DOOR_PROGRESS = HERO_END_FRAME / (TOTAL_FRAMES - 1);

// 9-beat caption timeline: playful early beats, progressively slower final 3 beats
const CAPTIONS = [
  {
    id: 1,
    start: 0.04,
    end: 0.115,
    type: 'anim-up',
    pos: 'bottom-[12%] left-[6%]',
    line1: 'Every family has its own little chaos.',
    line2: "And somehow, we're still adding new episodes."
  },
  {
    id: 2,
    start: 0.13,
    end: 0.185,
    type: 'anim-punchline',
    pos: 'top-[12%] right-[6%] text-right',
    line1: 'So naturally,',
    line2: 'we kept the receipts.'
  },
  // --- GATEWAY LOCK TRIGGERS AT 0.1932 (FRAME 0278) ---
  {
    id: 3,
    start: 0.215,
    end: 0.31,
    type: 'anim-year',
    pos: 'top-[12%] left-[6%]',
    line1: '2025 —',
    line2: 'a year of memories and questionable decisions.'
  },
  {
    id: 4,
    start: 0.34,
    end: 0.45,
    type: 'anim-punchline',
    pos: 'bottom-[12%] right-[6%] text-right',
    line1: 'The cake was temporary.',
    line2: 'The embarrassing photos are forever.'
  },
  {
    id: 5,
    start: 0.48,
    end: 0.59,
    type: 'anim-up',
    pos: 'top-[12%] right-[6%] text-right',
    line1: 'Proof that we occasionally behave like normal people.'
  },
  {
    id: 6,
    start: 0.62,
    end: 0.72,
    type: 'anim-year',
    pos: 'bottom-[12%] left-[6%]',
    line1: 'Plot twist:',
    line2: 'we somehow made even more memories.'
  },
  // Last 3 lines progressively slow down for emotional weight
  {
    id: 7,
    start: 0.745,
    end: 0.84,
    type: 'anim-emotional',
    pos: 'bottom-[14%] left-1/2 -translate-x-1/2 text-center',
    line1: 'Turns out, the little things were the big things.'
  },
  {
    id: 8,
    start: 0.86,
    end: 0.935,
    type: 'anim-emotional',
    pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center',
    line1: 'And this is just a tiny piece of the story.'
  },
  {
    id: 9,
    start: 0.945,
    end: 1.0,
    type: 'anim-finale',
    pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center',
    line1: 'Happy Birthday, Lipa.'
  }
];

const TERMINAL_STEPS = [
  '> SCANNING IDENTITY...',
  '> IDENTITY MATCHED',
  '✓ Identity verified',
  '✓ Archive located',
  '✓ Access granted'
];

export default function StoryCanvas() {
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const captionRefs = useRef([]);
  const hintRef = useRef(null);

  // Gateway states
  const [gatewayActive, setGatewayActive] = useState(false);
  const [lipaState, setLipaState] = useState('idle'); // 'idle' | 'freeze' | 'error' | 'recovering'
  const [pinkFlash, setPinkFlash] = useState(false);
  const [monkeyUnlocked, setMonkeyUnlocked] = useState(false);
  const [violetFlash, setVioletFlash] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const [showChaosBanner, setShowChaosBanner] = useState(false);
  const [splitting, setSplitting] = useState(false);

  const unlockedRef = useRef(false);
  const gatewayActiveRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    const canvas = canvasRef.current;
    if (!track || !canvas) return;
    const ctx = canvas.getContext('2d');

    const ease = 0.075;
    const images = [];
    let targetFrame = 0;
    let currentFrame = 0;
    let lastDrawnIndex = -1;
    let rafId = 0;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = 'async';
      const num = String(i + 1).padStart(4, '0');
      img.src = `/frames/frame_${num}.jpg`;
      images.push(img);
    }

    const drawFrame = index => {
      const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
      const img = images[clamped];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
      lastDrawnIndex = clamped;
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      lastDrawnIndex = -1;
      drawFrame(Math.round(currentFrame));
    };

    const onScroll = () => {
      const rect = track.getBoundingClientRect();
      const maxScroll = track.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      let progress = Math.min(1, Math.max(0, -rect.top / maxScroll));

      // Lock at frame 0278 until MONKEY unlocks the gateway
      if (!unlockedRef.current && progress >= DOOR_PROGRESS) {
        progress = DOOR_PROGRESS;
        const lockScrollY = track.offsetTop + DOOR_PROGRESS * maxScroll;
        if (Math.abs(window.scrollY - lockScrollY) > 2) {
          window.scrollTo({ top: lockScrollY });
        }
        if (!gatewayActiveRef.current) {
          gatewayActiveRef.current = true;
          setGatewayActive(true);
        }
      } else if (!unlockedRef.current && progress < DOOR_PROGRESS - 0.015 && gatewayActiveRef.current) {
        gatewayActiveRef.current = false;
        setGatewayActive(false);
      }

      targetFrame = progress * (TOTAL_FRAMES - 1);
    };

    const animate = () => {
      currentFrame += (targetFrame - currentFrame) * ease;

      if (!unlockedRef.current && currentFrame > HERO_END_FRAME - 1) {
        currentFrame = HERO_END_FRAME - 1;
      }

      const rounded = Math.round(currentFrame);
      if (rounded !== lastDrawnIndex) drawFrame(rounded);

      const progress = currentFrame / (TOTAL_FRAMES - 1);

      if (hintRef.current) {
        hintRef.current.style.opacity = progress < 0.03 ? '1' : '0';
      }

      CAPTIONS.forEach((cap, i) => {
        const el = captionRefs.current[i];
        if (!el) return;
        const active = progress >= cap.start && progress <= cap.end && !gatewayActiveRef.current;
        el.classList.toggle('is-active', active);
      });

      rafId = requestAnimationFrame(animate);
    };

    images[0].addEventListener('load', () => {
      resizeCanvas();
      drawFrame(0);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    onScroll();
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Interaction A — LIPA (Fake Option)
  const handleLipaClick = () => {
    if (monkeyUnlocked || lipaState !== 'idle') return;

    // 1. Pink glitch flash + brief freeze
    setPinkFlash(true);
    setLipaState('freeze');

    setTimeout(() => {
      setPinkFlash(false);
      // 2. Error 403 appears + shake + LIPA disabled + MONKEY pulses
      setLipaState('error');
    }, 220);

    // 3. System recovers after a short delay
    setTimeout(() => {
      setLipaState('recovering');
      setTimeout(() => setLipaState('idle'), 600);
    }, 2800);
  };

  // Interaction B — MONKEY (Valid Option)
  const handleMonkeyClick = () => {
    if (monkeyUnlocked) return;
    setMonkeyUnlocked(true);
    setLipaState('idle');

    // Violet flash + scanline sweep
    setVioletFlash(true);
    setTimeout(() => setVioletFlash(false), 320);

    // Sequential terminal typing logs
    TERMINAL_STEPS.forEach((line, idx) => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, line]);
      }, 240 * (idx + 1));
    });

    // "LET THE CHAOS BEGIN."
    setTimeout(() => {
      setShowChaosBanner(true);
    }, 1550);

    // Horizontal glitch fragments split open into the story (1–1.5s)
    setTimeout(() => {
      setSplitting(true);
      unlockedRef.current = true;
    }, 2250);

    // Clear gateway overlay & advance smoothly onto frame 0279+
    setTimeout(() => {
      gatewayActiveRef.current = false;
      setGatewayActive(false);
      window.scrollBy({ top: window.innerHeight * 0.35, behavior: 'smooth' });
    }, 3300);
  };

  return (
    <div ref={trackRef} className="relative h-[1250vh] bg-[#080608]">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_40%,rgba(0,0,0,0.72)_100%)]" />

        {/* Subtle initial scroll prompt */}
        <div
          ref={hintRef}
          className="font-mono-tech pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500 text-xs uppercase tracking-[0.28em] text-amber-100/75"
        >
          Scroll slowly to begin
        </div>

        {/* 9 Choreographed Story Captions */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {CAPTIONS.map((cap, idx) => {
            const isYear = cap.type === 'anim-year';
            const isFinale = cap.type === 'anim-finale';

            return (
              <div
                key={cap.id}
                ref={el => (captionRefs.current[idx] = el)}
                className={`cap-base ${cap.type} absolute max-w-[640px] px-7 py-5 drop-shadow-[0_4px_26px_rgba(0,0,0,0.96)] ${cap.pos}`}
              >
                <h2
                  className={
                    isFinale
                      ? 'font-syne text-4xl sm:text-6xl md:text-7xl text-[#f8e8c8] leading-tight'
                      : isYear
                      ? 'font-syne text-3xl sm:text-5xl text-[#f8e8c8] leading-tight mb-1.5'
                      : 'font-grotesk font-bold text-2xl sm:text-4xl text-[#f8e8c8] leading-snug mb-1.5'
                  }
                >
                  {cap.line1}
                </h2>
                {cap.line2 && (
                  <p
                    className={`font-grotesk text-base sm:text-xl text-white/90 leading-relaxed ${
                      cap.type === 'anim-punchline' ? 'punchline-second' : ''
                    }`}
                  >
                    {cap.line2}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* 02 — THE GATEWAY (CYBER-FUNK / RETRO-FUTURISTIC ARCADE INTERFACE) */}
        {gatewayActive && (
          <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden select-none">
            {/* 6 Horizontal Glitch Door Slices */}
            <div className="pointer-events-none absolute inset-0 flex flex-col">
              {[0, 1, 2, 3, 4, 5].map(slice => {
                const isLeft = slice % 2 === 0;
                return (
                  <div
                    key={slice}
                    className={`glitch-slice ${
                      isLeft ? 'glitch-slice-left' : 'glitch-slice-right'
                    } ${splitting ? 'is-splitting' : ''} relative flex-1 gateway-bg overflow-hidden`}
                    style={{ transitionDelay: `${slice * 45}ms` }}
                  >
                    <div className="gateway-grid absolute inset-0 opacity-60" />
                    <div className="gateway-scanlines absolute inset-0 opacity-50" />
                    {/* Neon horizontal stretch accent during glitch transition */}
                    {splitting && (
                      <div
                        className={`absolute inset-y-0 ${
                          isLeft ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'
                        } from-[#a3e635] via-[#a855f7] to-transparent w-48 opacity-90`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ambient Floating System Fragments */}
            <div
              className={`font-mono-tech pointer-events-none absolute inset-0 text-[11px] tracking-widest text-purple-400/35 transition-opacity duration-300 ${
                splitting ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <span className="absolute top-[10%] left-[8%]">SYS.NODE // 0x2027_ARCHIVE</span>
              <span className="absolute top-[14%] right-[9%] text-lime-400/35">MEM_INTEGRITY: 99.4%</span>
              <span className="absolute bottom-[11%] left-[10%] text-pink-500/35">PROTOCOL: SIBLING_LOCK_V4</span>
              <span className="absolute bottom-[13%] right-[8%]">TARGET: LIPA // VERIFY</span>
            </div>

            {/* Screen Flash Overlays */}
            {pinkFlash && (
              <div className="pointer-events-none absolute inset-0 z-40 bg-[#ff2a85]/35 mix-blend-screen" />
            )}
            {violetFlash && (
              <div className="pointer-events-none absolute inset-0 z-40 bg-[#a855f7]/40 mix-blend-screen" />
            )}

            {/* Scanline Beam Sweep on MONKEY unlock */}
            {monkeyUnlocked && !splitting && <div className="scan-beam z-40" />}

            {/* Main Arcade Terminal Frame */}
            <div
              className={`relative z-20 w-[92%] max-w-3xl rounded-2xl border border-purple-500/35 bg-[#09040e]/90 backdrop-blur-xl p-6 sm:p-10 shadow-[0_0_70px_rgba(168,85,247,0.22)] transition-all duration-500 ${
                splitting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
              } ${lipaState === 'error' ? 'animate-error-shake border-[#ff2a85]/70' : ''}`}
            >
              {/* Top Alert Header */}
              <p className="font-mono-tech text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#a855f7] mb-3">
                SYSTEM ALERT // FUTURE EVENT DETECTED
              </p>

              <h2 className="font-syne chrome-text text-2xl sm:text-4xl md:text-[42px] leading-tight tracking-tight mb-3">
                WAIT... YOU&apos;RE LEAVING US IN 2027?
              </h2>

              <p className="font-grotesk text-base sm:text-xl text-[#a3e635] font-medium">
                We&apos;ve got a lot of memories to expose before you start a new life..
              </p>

              <div className="my-6 h-px w-full bg-gradient-to-r from-purple-500/40 via-purple-400/20 to-transparent" />

              {/* Identity Selection Stage */}
              {!monkeyUnlocked ? (
                <>
                  <p className="font-mono-tech text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#a855f7] mb-2">
                    IDENTITY VERIFICATION REQUIRED
                  </p>
                  <p className="font-grotesk font-bold text-lg sm:text-xl text-white tracking-wide mb-5">
                    SELECT YOUR IDENTITY
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* MONKEY BUTTON */}
                    <button
                      onClick={handleMonkeyClick}
                      className={`group relative rounded-xl border-2 border-[#a855f7] bg-[#1a0b2e]/85 hover:bg-[#271044] py-6 px-4 text-center transition-all duration-150 active:scale-95 ${
                        lipaState === 'error' || lipaState === 'recovering' ? 'monkey-pulse border-[#c084fc]' : ''
                      }`}
                    >
                      <span className="font-grotesk font-bold block text-2xl sm:text-3xl tracking-wider text-white group-hover:text-[#e9d5ff]">
                        MONKEY
                      </span>
                      <span className="font-mono-tech mt-1 block text-xs tracking-[0.25em] text-[#c084fc]">
                        ACCESS
                      </span>
                    </button>

                    {/* LIPA BUTTON (Fake Option) */}
                    <button
                      onClick={handleLipaClick}
                      disabled={lipaState === 'freeze' || lipaState === 'error'}
                      className={`relative rounded-xl border-2 py-6 px-4 text-center transition-all duration-150 active:scale-95 ${
                        lipaState === 'error'
                          ? 'border-[#ff2a85]/50 bg-[#240916]/60 opacity-45 cursor-not-allowed'
                          : 'border-[#a3e635] bg-[#17220b]/80 hover:bg-[#223310]'
                      }`}
                    >
                      <span className="font-grotesk font-bold block text-2xl sm:text-3xl tracking-wider text-white">
                        LIPA
                      </span>
                      <span className="font-mono-tech mt-1 block text-xs tracking-[0.25em] text-[#a3e635]">
                        {lipaState === 'error' ? 'LOCKED' : 'ACCESS'}
                      </span>
                    </button>
                  </div>

                  {/* Error 403 Box on LIPA Click */}
                  {(lipaState === 'error' || lipaState === 'recovering') && (
                    <div className="font-mono-tech mt-5 rounded-xl border border-[#ff2a85]/70 bg-[#1f0713]/95 p-4 text-left shadow-[0_0_25px_rgba(255,42,133,0.25)]">
                      <p className="text-sm font-bold text-[#ff2a85] tracking-wider">ERROR 403</p>
                      <p className="text-sm font-bold text-white mt-1">NICE TRY.</p>
                      <p className="text-xs sm:text-sm text-pink-200/85 mt-1">
                        Wrong identity. Please try again.
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-[#a3e635] mt-2 tracking-wide">
                        MONKEY IS THE ONLY VALID OPTION.
                      </p>
                    </div>
                  )}

                  <p className="font-mono-tech mt-5 text-center text-[11px] tracking-[0.25em] text-neutral-400">
                    SELECT ONE · THERE IS NO ESCAPE
                  </p>
                </>
              ) : (
                /* Terminal Scan Sequence on MONKEY Click */
                <div className="font-mono-tech min-h-[190px] flex flex-col justify-between rounded-xl border border-purple-500/30 bg-black/75 p-5">
                  <div className="space-y-2 text-sm sm:text-base">
                    {terminalLines.map((line, i) => (
                      <p
                        key={i}
                        className={
                          line.startsWith('✓')
                            ? 'text-[#a3e635]'
                            : line.includes('MATCHED')
                            ? 'text-[#c084fc] font-semibold'
                            : 'text-purple-200'
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  {showChaosBanner && (
                    <p className="font-syne mt-5 text-xl sm:text-3xl tracking-wider text-[#ff2a85] drop-shadow-[0_0_18px_rgba(255,42,133,0.6)]">
                      LET THE CHAOS BEGIN.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}