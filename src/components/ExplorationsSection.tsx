import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const GALLERY_ITEMS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80&auto=format',
    rotation: -3,
    col: 0,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format',
    rotation: 2,
    col: 1,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600&q=80&auto=format',
    rotation: -2,
    col: 0,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&q=80&auto=format',
    rotation: 4,
    col: 1,
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1698048223734-a35d7a1bab56?w=600&q=80&auto=format',
    rotation: -1,
    col: 0,
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80&auto=format',
    rotation: 3,
    col: 1,
  },
];

const ExplorationsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const col0Ref = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [dribbbleHovered, setDribbbleHovered] = useState(false);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    // Pin center content
    const pin = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      pin: contentRef.current,
      pinSpacing: false,
    });

    // Parallax columns
    const col0Items = col0Ref.current?.querySelectorAll('.gallery-item') ?? [];
    const col1Items = col1Ref.current?.querySelectorAll('.gallery-item') ?? [];

    const ctx = gsap.context(() => {
      gsap.to(col0Items, {
        y: -200,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
      gsap.to(col1Items, {
        y: 200,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }, sectionRef);

    return () => {
      pin.kill();
      ctx.revert();
    };
  }, []);

  const col0 = GALLERY_ITEMS.filter(item => item.col === 0);
  const col1 = GALLERY_ITEMS.filter(item => item.col === 1);

  return (
    <>
      <section
        id="explorations"
        ref={sectionRef}
        className="relative overflow-hidden"
        style={{ minHeight: '300vh', background: '#000' }}
      >
        {/* Layer 1: Pinned center content */}
        <div
          ref={contentRef}
          className="relative h-screen flex items-center justify-center z-10 pointer-events-none"
        >
          <div className="text-center px-6 pointer-events-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px" style={{ background: 'hsl(var(--stroke))' }} />
              <span
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: 'hsl(var(--muted))' }}
              >
                Explorations
              </span>
              <div className="w-8 h-px" style={{ background: 'hsl(var(--stroke))' }} />
            </div>
            <h2
              className="text-4xl md:text-6xl lg:text-7xl leading-tight mb-4"
              style={{ color: 'hsl(var(--text))' }}
            >
              Visual{' '}
              <em
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontStyle: 'italic',
                }}
              >
                playground
              </em>
            </h2>
            <p
              className="text-sm md:text-base max-w-sm mx-auto mb-8"
              style={{ color: 'hsl(var(--muted))' }}
            >
              Personal experiments in motion, photography, and generative design.
            </p>

            {/* Dribbble button */}
            <div className="relative inline-block">
              {dribbbleHovered && (
                <span
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    inset: '-2px',
                    background: 'linear-gradient(90deg, #EA4C89, #C74B7B)',
                    zIndex: -1,
                    borderRadius: '9999px',
                  }}
                />
              )}
              <a
                href="https://dribbble.com"
                target="_blank"
                rel="noreferrer"
                className="relative inline-flex items-center gap-2 rounded-full text-sm px-6 py-2.5 transition-all duration-300"
                style={{
                  border: '1px solid hsl(var(--stroke))',
                  background: dribbbleHovered ? 'hsl(var(--bg))' : 'transparent',
                  color: 'hsl(var(--text))',
                }}
                onMouseEnter={() => setDribbbleHovered(true)}
                onMouseLeave={() => setDribbbleHovered(false)}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: '#EA4C89', flexShrink: 0 }}
                />
                View on Dribbble ↗
              </a>
            </div>
          </div>
        </div>

        {/* Layer 2: Parallax columns */}
        <div
          className="absolute inset-0 flex items-start justify-center pt-[10vh] z-20 pointer-events-none"
          style={{ top: 0 }}
        >
          <div className="w-full max-w-[1400px] px-6 md:px-16 grid grid-cols-2 gap-12 md:gap-40 pointer-events-auto">
            {/* Column 0 */}
            <div ref={col0Ref} className="flex flex-col gap-8 pt-24">
              {col0.map(item => (
                <div
                  key={item.id}
                  className="gallery-item aspect-square max-w-[320px] rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
                  style={{
                    transform: `rotate(${item.rotation}deg)`,
                    border: '1px solid hsl(var(--stroke))',
                  }}
                  onClick={() => setLightbox(item.image)}
                >
                  <img
                    src={item.image}
                    alt={`Exploration ${item.id}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Column 1 */}
            <div ref={col1Ref} className="flex flex-col gap-8 mt-48">
              {col1.map(item => (
                <div
                  key={item.id}
                  className="gallery-item aspect-square max-w-[320px] ml-auto rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
                  style={{
                    transform: `rotate(${item.rotation}deg)`,
                    border: '1px solid hsl(var(--stroke))',
                  }}
                  onClick={() => setLightbox(item.image)}
                >
                  <img
                    src={item.image}
                    alt={`Exploration ${item.id}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setLightbox(null)}
        >
          <motion.img
            src={lightbox}
            alt="Lightbox"
            className="max-w-full max-h-full object-contain rounded-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-6 right-6 text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default ExplorationsSection;
