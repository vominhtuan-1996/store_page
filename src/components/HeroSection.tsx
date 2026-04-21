import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import HlsVideo from './HlsVideo';

const ROLES = ['Creative', 'Fullstack', 'Founder', 'Scholar'];

const HeroSection: React.FC = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [seeWorksHovered, setSeeWorksHovered] = useState(false);
  const [reachOutHovered, setReachOutHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const animatedRef = useRef(false);

  // Role cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex(i => (i + 1) % ROLES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (animatedRef.current) return;
    animatedRef.current = true;

    const tl = gsap.timeline({ ease: 'power3.out' });

    tl.fromTo(
      '.name-reveal',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
    ).fromTo(
      '.blur-in',
      { opacity: 0, filter: 'blur(10px)', y: 20 },
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.1, delay: 0.3 },
      '<0.3'
    );
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background video */}
      <HlsVideo overlay bottomFade />

      {/* Hero content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <div className="blur-in mb-8 opacity-0">
          <span
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: 'hsl(var(--muted))' }}
          >
            COLLECTION '26
          </span>
        </div>

        {/* Name */}
        <h1
          className="name-reveal text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight mb-6 opacity-0"
          style={{
            fontFamily: 'Instrument Serif, serif',
            fontStyle: 'italic',
            color: 'hsl(var(--text))',
          }}
        >
          Michael Smith
        </h1>

        {/* Role line */}
        <div
          className="blur-in text-sm md:text-base mb-6 opacity-0"
          style={{ color: 'hsl(var(--muted))' }}
        >
          A{' '}
          <span
            key={roleIndex}
            className="animate-role-fade-in inline-block"
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontStyle: 'italic',
              color: 'hsl(var(--text))',
            }}
          >
            {ROLES[roleIndex]}
          </span>{' '}
          lives in Chicago.
        </div>

        {/* Description */}
        <p
          className="blur-in text-sm md:text-base max-w-md mx-auto mb-12 opacity-0"
          style={{ color: 'hsl(var(--muted))' }}
        >
          Designing seamless digital interactions by focusing on the unique nuances which bring systems to life.
        </p>

        {/* CTA Buttons */}
        <div className="blur-in inline-flex gap-4 flex-wrap justify-center opacity-0">
          {/* See Works */}
          <div className="relative">
            {seeWorksHovered && (
              <span
                className="absolute pointer-events-none rounded-full"
                style={{
                  inset: '-2px',
                  background: 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)',
                  borderRadius: '9999px',
                  zIndex: -1,
                }}
              />
            )}
            <button
              className="relative rounded-full text-sm px-7 py-3.5 font-medium transition-all duration-300"
              style={{
                background: seeWorksHovered ? 'hsl(var(--bg))' : 'hsl(var(--text))',
                color: seeWorksHovered ? 'hsl(var(--text))' : 'hsl(var(--bg))',
                transform: seeWorksHovered ? 'scale(1.05)' : 'scale(1)',
              }}
              onMouseEnter={() => setSeeWorksHovered(true)}
              onMouseLeave={() => setSeeWorksHovered(false)}
              onClick={() => {
                document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See Works
            </button>
          </div>

          {/* Reach out */}
          <div className="relative">
            {reachOutHovered && (
              <span
                className="absolute pointer-events-none rounded-full"
                style={{
                  inset: '-2px',
                  background: 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)',
                  borderRadius: '9999px',
                  zIndex: -1,
                }}
              />
            )}
            <button
              className="relative rounded-full text-sm px-7 py-3.5 font-medium transition-all duration-300"
              style={{
                border: reachOutHovered ? 'none' : '2px solid hsl(var(--stroke))',
                background: 'hsl(var(--bg))',
                color: 'hsl(var(--text))',
                transform: reachOutHovered ? 'scale(1.05)' : 'scale(1)',
                padding: reachOutHovered ? '14px 28px' : undefined,
              }}
              onMouseEnter={() => setReachOutHovered(true)}
              onMouseLeave={() => setReachOutHovered(false)}
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Reach out...
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span
          className="text-xs uppercase tracking-[0.2em]"
          style={{ color: 'hsl(var(--muted))' }}
        >
          SCROLL
        </span>
        <div
          className="relative w-px h-10 overflow-hidden"
          style={{ background: 'hsl(var(--stroke))' }}
        >
          <div
            className="absolute top-0 left-0 w-full h-full animate-scroll-down accent-gradient"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
