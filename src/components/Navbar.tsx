import React, { useEffect, useState } from 'react';

const NAV_LINKS = ['Home', 'Work', 'Resume'];

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [sayHiHovered, setSayHiHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (link: string) => {
    const id = link.toLowerCase();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <div
        className={`inline-flex items-center rounded-full backdrop-blur-md border px-2 py-2 transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
        style={{
          borderColor: 'rgba(255,255,255,0.1)',
          background: 'hsl(var(--surface))',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : undefined,
        }}
      >
        {/* Logo */}
        <button
          className="relative flex-shrink-0 transition-transform duration-200"
          style={{ transform: logoHovered ? 'scale(1.1)' : 'scale(1)' }}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center p-[2px]"
            style={{
              background: logoHovered
                ? 'linear-gradient(270deg, #89AACC 0%, #4E85BF 100%)'
                : 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)',
              transition: 'background 0.4s ease',
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{ background: 'hsl(var(--bg))' }}
            >
              <span
                className="text-[13px] leading-none"
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontStyle: 'italic',
                  color: 'hsl(var(--text))',
                }}
              >
                JA
              </span>
            </div>
          </div>
        </button>

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-5 mx-1"
          style={{ background: 'hsl(var(--stroke))' }}
        />

        {/* Nav Links */}
        {NAV_LINKS.map(link => {
          const isActive = activeSection === link.toLowerCase();
          return (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className="text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-200"
              style={{
                color: isActive ? 'hsl(var(--text))' : 'hsl(var(--muted))',
                background: isActive ? 'hsl(var(--stroke) / 0.5)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--text))';
                  (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--stroke) / 0.5)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--muted))';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              {link}
            </button>
          );
        })}

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-5 mx-1"
          style={{ background: 'hsl(var(--stroke))' }}
        />

        {/* Say hi button */}
        <div className="relative">
          {sayHiHovered && (
            <span
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: '-2px',
                background: 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)',
                zIndex: -1,
                borderRadius: '9999px',
              }}
            />
          )}
          <button
            className="relative text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-md transition-all duration-200"
            style={{
              background: 'hsl(var(--surface))',
              color: 'hsl(var(--text))',
            }}
            onMouseEnter={() => setSayHiHovered(true)}
            onMouseLeave={() => setSayHiHovered(false)}
            onClick={() => {
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Say hi ↗
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
