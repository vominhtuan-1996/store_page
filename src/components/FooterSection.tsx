import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import HlsVideo from './HlsVideo';

const SOCIAL_LINKS = [
  { name: 'Twitter', href: 'https://twitter.com' },
  { name: 'LinkedIn', href: 'https://linkedin.com' },
  { name: 'Dribbble', href: 'https://dribbble.com' },
  { name: 'GitHub', href: 'https://github.com' },
];

const MARQUEE_TEXT = 'BUILDING THE FUTURE • ';
const MARQUEE_REPEAT = 10;

const FooterSection: React.FC = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [emailHovered, setEmailHovered] = useState(false);
  const marqueeAnimRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!marqueeRef.current) return;

    marqueeAnimRef.current = gsap.to(marqueeRef.current, {
      xPercent: -50,
      duration: 40,
      ease: 'none',
      repeat: -1,
    });

    return () => {
      marqueeAnimRef.current?.kill();
    };
  }, []);

  return (
    <footer
      id="contact"
      className="relative overflow-hidden"
      style={{
        background: 'hsl(var(--bg))',
        paddingTop: '5rem',
        paddingBottom: '2rem',
      }}
    >
      {/* Background video — flipped vertically */}
      <div className="absolute inset-0" style={{ transform: 'scaleY(-1)' }}>
        <HlsVideo />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10">
        {/* Marquee */}
        <div className="overflow-hidden mb-16 md:mb-24">
          <div ref={marqueeRef} className="flex whitespace-nowrap">
            {Array.from({ length: MARQUEE_REPEAT * 2 }).map((_, i) => (
              <span
                key={i}
                className="text-4xl md:text-6xl lg:text-8xl font-light mr-4 flex-shrink-0"
                style={{
                  color: i % 6 === 2
                    ? 'transparent'
                    : 'hsl(var(--text) / 0.15)',
                  fontFamily: 'Instrument Serif, serif',
                  fontStyle: 'italic',
                  WebkitTextStroke: i % 6 === 2 ? '1px hsl(var(--stroke))' : undefined,
                }}
              >
                {MARQUEE_TEXT}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-px" style={{ background: 'hsl(var(--stroke))' }} />
                <span
                  className="text-xs uppercase tracking-[0.3em]"
                  style={{ color: 'hsl(var(--muted))' }}
                >
                  Contact
                </span>
                <div className="w-8 h-px" style={{ background: 'hsl(var(--stroke))' }} />
              </div>

              <h2
                className="text-4xl md:text-6xl lg:text-7xl mb-4 leading-tight"
                style={{ color: 'hsl(var(--text))' }}
              >
                Let's{' '}
                <em
                  style={{
                    fontFamily: 'Instrument Serif, serif',
                    fontStyle: 'italic',
                  }}
                >
                  create
                </em>{' '}
                together.
              </h2>
              <p
                className="text-sm md:text-base mb-10 max-w-md mx-auto"
                style={{ color: 'hsl(var(--muted))' }}
              >
                Ready to bring your vision to life? Let's start a conversation.
              </p>

              {/* Email button */}
              <div className="relative inline-block">
                {emailHovered && (
                  <span
                    className="absolute pointer-events-none rounded-full"
                    style={{
                      inset: '-2px',
                      background: 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)',
                      zIndex: -1,
                      borderRadius: '9999px',
                    }}
                  />
                )}
                <a
                  href="mailto:hello@michaelsmith.com"
                  className="relative inline-flex items-center gap-2 rounded-full text-sm px-8 py-4 font-medium transition-all duration-300"
                  style={{
                    background: emailHovered ? 'hsl(var(--bg))' : 'hsl(var(--text))',
                    color: emailHovered ? 'hsl(var(--text))' : 'hsl(var(--bg))',
                    transform: emailHovered ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onMouseEnter={() => setEmailHovered(true)}
                  onMouseLeave={() => setEmailHovered(false)}
                >
                  hello@michaelsmith.com ↗
                </a>
              </div>
            </motion.div>
          </div>

          {/* Footer bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: '1px solid hsl(var(--stroke))' }}
          >
            {/* Social links */}
            <nav className="flex items-center gap-4">
              {SOCIAL_LINKS.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'hsl(var(--muted))' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(var(--text))';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(var(--muted))';
                  }}
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Available indicator */}
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-pulse-green"
                style={{ background: '#22c55e' }}
              />
              <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>
                Available for projects
              </span>
            </div>

            {/* Copyright */}
            <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>
              © 2026 Michael Smith
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
