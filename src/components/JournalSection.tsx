import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';

const ENTRIES = [
  {
    id: 1,
    title: 'The invisible architecture of great design',
    readTime: '5 min read',
    date: 'Dec 2025',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80&auto=format',
    tag: 'Design',
  },
  {
    id: 2,
    title: 'Fullstack in 2026: What actually matters',
    readTime: '8 min read',
    date: 'Nov 2025',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&q=80&auto=format',
    tag: 'Engineering',
  },
  {
    id: 3,
    title: 'Building a creative studio from scratch',
    readTime: '12 min read',
    date: 'Oct 2025',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=80&auto=format',
    tag: 'Business',
  },
  {
    id: 4,
    title: 'Motion design principles for digital products',
    readTime: '6 min read',
    date: 'Sep 2025',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&q=80&auto=format',
    tag: 'Motion',
  },
];

const sectionVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

const JournalSection: React.FC = () => {
  const [viewAllHovered, setViewAllHovered] = useState(false);

  return (
    <section id="resume" style={{ background: 'transparent', padding: '6rem 0 8rem' }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Header */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="flex flex-col items-center text-center mb-10 md:mb-14"
        >
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px" style={{ background: 'hsl(var(--stroke))' }} />
              <span
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: 'hsl(var(--muted))' }}
              >
                Journal
              </span>
              <div className="w-8 h-px" style={{ background: 'hsl(var(--stroke))' }} />
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-3"
              style={{ color: 'hsl(var(--text))' }}
            >
              Recent{' '}
              <em
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontStyle: 'italic',
                }}
              >
                thoughts
              </em>
            </h2>
            <p className="text-sm md:text-base max-w-md mx-auto" style={{ color: 'hsl(var(--muted))' }}>
              Musings on design, technology, and the spaces in between.
            </p>
          </div>

          <div className="relative mt-6">
            {viewAllHovered && (
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
            <button
              className="relative rounded-full text-sm px-6 py-2.5 transition-all duration-300"
              style={{
                border: '1px solid hsl(var(--stroke))',
                background: viewAllHovered ? 'hsl(var(--bg))' : 'transparent',
                color: 'hsl(var(--text))',
              }}
              onMouseEnter={() => setViewAllHovered(true)}
              onMouseLeave={() => setViewAllHovered(false)}
            >
              View all →
            </button>
          </div>
        </motion.div>

        {/* Journal entries */}
        <div className="flex flex-col gap-3">
          {ENTRIES.map((entry, i) => (
            <motion.article
              key={entry.id}
              variants={sectionVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.08 }}
              className="group flex items-center gap-6 p-5 sm:p-6 rounded-[40px] sm:rounded-full cursor-pointer transition-all duration-300"
              style={{
                background: 'hsl(var(--surface) / 0.5)',
                border: '1px solid hsl(var(--stroke))',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'hsl(var(--surface))';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'hsl(var(--surface) / 0.3)';
              }}
            >
              {/* Image */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden">
                <img
                  src={entry.image}
                  alt={entry.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm md:text-base font-medium truncate"
                  style={{ color: 'hsl(var(--text))' }}
                >
                  {entry.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="text-xs rounded-full px-2.5 py-0.5"
                    style={{
                      background: 'hsl(var(--stroke))',
                      color: 'hsl(var(--muted))',
                    }}
                  >
                    {entry.tag}
                  </span>
                  <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>
                    {entry.readTime}
                  </span>
                </div>
              </div>

              {/* Date + Arrow */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="hidden sm:block text-xs" style={{ color: 'hsl(var(--muted))' }}>
                  {entry.date}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    border: '1px solid hsl(var(--stroke))',
                    color: 'hsl(var(--muted))',
                  }}
                >
                  →
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JournalSection;
