import React, { useRef, useEffect } from 'react';
import { Globe, Instagram, Twitter, ArrowRight } from 'lucide-react';

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4';

const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeRafRef = useRef<number>(0);

  /* ── smooth opacity helpers ── */
  const fadeOpacity = (
    el: HTMLVideoElement,
    from: number,
    to: number,
    durationMs: number,
    onDone?: () => void
  ) => {
    cancelAnimationFrame(fadeRafRef.current);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      el.style.opacity = String(from + (to - from) * t);
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(tick);
      } else {
        onDone?.();
      }
    };
    fadeRafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.style.opacity = '0';

    const onCanPlay = () => {
      video.play().catch(() => {});
      fadeOpacity(video, 0, 1, 500);
    };

    const onTimeUpdate = () => {
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && parseFloat(video.style.opacity) > 0) {
        fadeOpacity(video, parseFloat(video.style.opacity), 0, 500);
      }
    };

    const onEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        fadeOpacity(video, 0, 1, 500);
      }, 100);
    };

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);

    return () => {
      cancelAnimationFrame(fadeRafRef.current);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col bg-black">
      {/* Background video */}
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        muted
        autoPlay
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-bottom"
        style={{ opacity: 0 }}
      />

      {/* Navbar */}
      <nav className="relative z-20 px-6 py-6">
        <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center">
            <Globe size={24} className="text-white" />
            <span className="ml-2 text-white font-semibold text-lg">Asme</span>
            <div className="hidden md:flex items-center gap-8 ml-8">
              {['Features', 'Pricing', 'About'].map(link => (
                <a
                  key={link}
                  href="#"
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button className="text-white text-sm font-medium hover:text-white/80 transition-colors">
              Sign Up
            </button>
            <button className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center"
        style={{ transform: 'translateY(-20%)' }}
      >
        {/* Heading */}
        <h1
          className="text-7xl md:text-8xl lg:text-9xl text-white tracking-tight whitespace-nowrap mb-8"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Know it then{' '}
          <em className="italic">all</em>.
        </h1>

        {/* Email pill */}
        <div className="max-w-xl w-full mb-6">
          <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none min-w-0"
            />
            <button className="bg-white rounded-full p-3 text-black hover:bg-white/90 transition-colors flex-shrink-0">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-white text-sm leading-relaxed px-4 max-w-md mb-8 text-white/70">
          Stay updated with the latest news and insights. Subscribe to our newsletter today and never
          miss out on exciting updates.
        </p>

        {/* Manifesto button */}
        <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors">
          Read our Manifesto
        </button>
      </div>

      {/* Social footer */}
      <div className="relative z-10 flex justify-center gap-4 pb-12">
        {[Instagram, Twitter, Globe].map((Icon, i) => (
          <button
            key={i}
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <Icon size={20} />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
