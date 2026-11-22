import { useEffect, useRef, useState } from 'react';

const LETTERS = [
  {
    id: 'parpata',
    sender: 'Parpata',
    tag: 'Her -Old Sis',
    accent: 'border-amber-300/30 bg-[#141016]/90',
    badgeColor: 'text-amber-300 bg-amber-400/10 border-amber-300/25',
    greeting: 'To my favorite person,',
    body: 'Growing up with you has been the best part of my 22 years. From sharing secrets late at night to you always having my back before I even ask—thank you for being my constant. No matter what 2027 brings, you are stuck with me forever.',
    signOff: '— Forever your  sis, Parpata'
  },
  {
    id: 'Hahahahah',
    sender: 'Hahahahah',
    tag: '',
    accent: 'border-purple-400/25 bg-[#120e17]/90',
    badgeColor: 'text-purple-300 bg-purple-400/10 border-purple-400/25',
    greeting: 'Hey Ghushuri,',
    body: 'Every milestone in this house feels incomplete without your energy. Keep chasing every big dream ahead of you—just remember who built your birthday website when you become famous.',
    signOff: '— HAhahahah'
  },
  {
    id: 'family',
    sender: 'Mummy & Bapa',
    tag: 'Home',
    accent: 'border-rose-300/25 bg-[#150f14]/90',
    badgeColor: 'text-rose-200 bg-rose-400/10 border-rose-300/25',
    greeting: 'Dearest Ghushuri,',
    body: 'Watching you step into every new year with grace and strength is our greatest pride. May your path always stay bright, healthy, and surrounded by people who love you just as deeply as we do.',
    signOff: '— With all our blessings'
  }
];

// Place your MP3/WAV voice recordings inside public/audio/
const VOICE_NOTES = [
  {
    id: 'voice-parpata',
    name: 'Parpata',
    role: '22-yr-old Sis • Voice Wish',
    duration: '0:24',
    src: '/audio/parpata-wish.mp3'
  },
  {
    id: 'voice-parents',
    name: 'Mummy & Bapa',
    role: 'Home • Birthday Blessing',
    duration: '0:31',
    src: '/audio/parents-wish.mp3'
  },
  {
    id: 'voice-hihihihhihh',
    name: '',
    role: ' • Chaos Note',
    duration: '0:19',
    src: '/audio/rohan-wish.mp3'
  }
];

export default function LettersAndVoices() {
  const cardRefs = useRef([]);
  const audioRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [audioError, setAudioError] = useState('');

  // Staggered one-by-one reveal as she scrolls down the rising page
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.22 }
    );

    cardRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const toggleVoice = track => {
    setAudioError('');
    const currentAudio = audioRef.current;

    // Stop if clicking the currently playing track
    if (playingId === track.id && currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setPlayingId(null);
      return;
    }

    // Stop any previous track before starting the new one
    if (currentAudio) {
      currentAudio.pause();
    }

    const nextAudio = new Audio(track.src);
    audioRef.current = nextAudio;
    setPlayingId(track.id);

    nextAudio.play().catch(() => {
      setPlayingId(null);
      setAudioError(`Add "${track.src}" inside your public/audio/ folder to play.`);
    });

    nextAudio.onended = () => {
      setPlayingId(null);
    };
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return (
    /* -mt-[100vh] + z-20 creates the Apple-style vertical curtain sliding cleanly OVER the sticky canvas finale */
  <section className="apple-sheet relative z-20 min-h-screen bg-gradient-to-b from-[#0d090e] via-[#09070a] to-[#050406] px-6 sm:px-10 pt-10 pb-28">
      {/* Subtle Apple-style top drag/sheet indicator pill */}
      <div className="mx-auto mb-12 h-1.5 w-14 rounded-full bg-amber-100/20" />

      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-mono-tech text-xs uppercase tracking-[0.3em] text-amber-300/80 mb-3">
            Chapter III • Unsealed Notes
          </p>
          <h2 className="font-syne text-3xl sm:text-5xl md:text-6xl text-[#f8e8c8] tracking-tight">
            Words Kept For You
          </h2>
          <p className="font-grotesk mt-3 text-base sm:text-lg text-neutral-400 max-w-xl mx-auto">
            Scroll down to open each letter one by one, and tap below to hear the voices waiting for you.
          </p>
        </div>

        {/* 1. SEQUENTIAL LETTERS (Animating one by one on scroll) */}
        <div className="space-y-10">
          {LETTERS.map((letter, idx) => (
            <article
              key={letter.id}
              ref={el => (cardRefs.current[idx] = el)}
              style={{ transitionDelay: `${idx * 120}ms` }}
              className={`letter-card rounded-3xl border p-7 sm:p-10 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.65)] ${letter.accent}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-syne text-2xl sm:text-3xl text-[#f8e8c8]">
                    From {letter.sender}
                  </h3>
                </div>
                <span
                  className={`font-mono-tech text-xs px-3.5 py-1.5 rounded-full border tracking-wider ${letter.badgeColor}`}
                >
                  {letter.tag}
                </span>
              </div>

              <p className="font-grotesk text-lg sm:text-xl text-amber-100/90 font-medium mb-3">
                {letter.greeting}
              </p>

              <p className="font-grotesk text-base sm:text-lg text-neutral-300 leading-relaxed">
                {letter.body}
              </p>

              <p className="font-mono-tech mt-6 text-xs sm:text-sm tracking-wide text-amber-200/80">
                {letter.signOff}
              </p>
            </article>
          ))}
        </div>

        {/* 2. MULTI-VOICE BIRTHDAY WISHES BOARD */}
        <div className="mt-24 pt-16 border-t border-amber-200/15">
          <div className="text-center mb-10">
            <p className="font-mono-tech text-xs uppercase tracking-[0.28em] text-amber-300/80 mb-2">
              Audio Archive • Voice Wishes
            </p>
            <h3 className="font-syne text-2xl sm:text-4xl text-[#f8e8c8]">
              Press Play To Hear Us
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {VOICE_NOTES.map(track => {
              const isPlaying = playingId === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => toggleVoice(track)}
                  className={`group text-left rounded-2xl border p-5 transition-all duration-300 ${
                    isPlaying
                      ? 'border-amber-300 bg-amber-400/10 shadow-[0_0_35px_rgba(251,191,36,0.2)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-amber-200/35 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full font-bold transition-transform group-hover:scale-105 ${
                        isPlaying
                          ? 'bg-amber-300 text-black'
                          : 'bg-amber-200/15 text-[#f8e8c8]'
                      }`}
                    >
                      {isPlaying ? '❚❚' : '▶'}
                    </span>

                    {/* Live Equalizer Bars when playing */}
                    <div className="flex items-end gap-1 h-5">
                      {[0, 1, 2, 3].map(bar => (
                        <span
                          key={bar}
                          style={{ animationDelay: `${bar * 0.15}s` }}
                          className={`w-1 rounded-full bg-amber-300 transition-all ${
                            isPlaying ? 'h-5 voice-bar' : 'h-1.5 opacity-35'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="font-grotesk font-bold text-lg text-white">
                    {track.name}
                  </p>
                  <p className="font-mono-tech text-xs text-neutral-400 mt-0.5">
                    {track.role}
                  </p>
                  <p className="font-mono-tech text-[11px] text-amber-300/80 mt-3">
                    {isPlaying ? 'PLAYING WISH...' : `TAP TO LISTEN • ${track.duration}`}
                  </p>
                </button>
              );
            })}
          </div>

          {audioError && (
            <p className="font-mono-tech mt-4 text-center text-xs text-amber-300/80">
              {audioError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}