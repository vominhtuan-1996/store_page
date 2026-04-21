import React, { useEffect, useRef, useState } from 'react';

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

const AetheraHero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const [videoOpacity, setVideoOpacity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateVideoFade = () => {
      const { currentTime, duration } = video;
      
      if (duration > 0) {
        const remainingTime = duration - currentTime;
        
        // Fade in: first 0.5s
        if (currentTime < 0.5) {
          setVideoOpacity(currentTime / 0.5);
        } 
        // Fade out: last 0.5s
        else if (remainingTime < 0.5) {
          setVideoOpacity(remainingTime / 0.5);
        } 
        // Solid in between
        else {
          setVideoOpacity(1);
        }
      }

      rafRef.current = requestAnimationFrame(updateVideoFade);
    };

    const handleEnded = () => {
      setVideoOpacity(0);
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch(() => {});
        }
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    rafRef.current = requestAnimationFrame(updateVideoFade);

    return () => {
      if (video) {
        video.removeEventListener('ended', handleEnded);
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white selection:bg-black selection:text-white">
      {/* Background video layer (z-0) */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          muted
          autoPlay
          playsInline
          className="absolute w-full h-full object-cover"
          style={{ 
            top: '300px', 
            inset: 'auto 0 0 0',
            opacity: videoOpacity,
            transition: 'opacity 0.1s linear' // Subtler transition for the raf updates
          }}
        />
        {/* Gradient overlay on video */}
        <div className="absolute inset-x-0 bottom-0 z-0" style={{ top: '300px' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white opacity-100" />
        </div>
      </div>

      {/* Navigation bar (z-10) */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto bg-transparent">
        <div 
          className="text-3xl tracking-tight text-black"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Aethera<sup>®</sup>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button className="text-sm font-medium text-black transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Home</button>
          <button className="text-sm font-medium text-[#6F6F6F] hover:text-black transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Studio</button>
          <button className="text-sm font-medium text-[#6F6F6F] hover:text-black transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>About</button>
          <button className="text-sm font-medium text-[#6F6F6F] hover:text-black transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Journal</button>
          <button className="text-sm font-medium text-[#6F6F6F] hover:text-black transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Reach Us</button>
        </div>

        <button 
          className="rounded-full px-6 py-2.5 text-sm font-medium bg-black text-white transition-transform hover:scale-[1.03]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Begin Journey
        </button>
      </nav>

      {/* Hero section (z-10) */}
      <section 
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
        style={{ 
          paddingTop: 'calc(8rem - 75px)',
          paddingBottom: '10rem'
        }}
      >
        <h1 
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl max-w-7xl font-normal text-black"
          style={{ 
            fontFamily: "'Instrument Serif', serif",
            lineHeight: 0.95,
            letterSpacing: '-2.46px'
          }}
        >
          Beyond <em className="italic text-[#6F6F6F]">silence,</em> we build <em className="italic text-[#6F6F6F]">the eternal.</em>
        </h1>

        <p 
          className="animate-fade-rise-delay text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-[#6F6F6F]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Building platforms for brilliant minds, fearless makers, and thoughtful souls. 
          Through the noise, we craft digital havens for deep work and pure flows.
        </p>

        <button 
          className="animate-fade-rise-delay-2 rounded-full px-14 py-5 text-base font-medium mt-12 bg-black text-white transition-transform hover:scale-[1.03]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Begin Journey
        </button>
      </section>
    </div>
  );
};

export default AetheraHero;
