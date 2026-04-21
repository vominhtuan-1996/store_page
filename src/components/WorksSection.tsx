import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';

interface Project {
  title: string;
  category: string;
  span: number; // md:col-span-X
  aspectRatio: string;
  image: string;
}

const PROJECTS: Project[] = [
  {
    title: 'Automotive Motion',
    category: 'Film & Motion',
    span: 7,
    aspectRatio: '16/9',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=80&auto=format',
  },
  {
    title: 'Urban Architecture',
    category: 'Photography',
    span: 5,
    aspectRatio: '4/5',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80&auto=format',
  },
  {
    title: 'Human Perspective',
    category: 'Portrait',
    span: 5,
    aspectRatio: '4/5',
    image: 'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7da?w=700&q=80&auto=format',
  },
  {
    title: 'Brand Identity',
    category: 'Branding',
    span: 7,
    aspectRatio: '16/9',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&q=80&auto=format',
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

const WorksSection: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewAllHovered, setViewAllHovered] = useState(false);

  return (
    <section id="work" style={{ background: 'hsl(var(--bg))', padding: '3rem 0 4rem' }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Header */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-end justify-between mb-10 md:mb-14"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px" style={{ background: 'hsl(var(--stroke))' }} />
              <span
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: 'hsl(var(--muted))' }}
              >
                Selected Work
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-3"
              style={{ color: 'hsl(var(--text))' }}
            >
              Featured{' '}
              <em
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontStyle: 'italic',
                }}
              >
                projects
              </em>
            </h2>
            <p className="text-sm md:text-base" style={{ color: 'hsl(var(--muted))' }}>
              A selection of projects I've worked on, from concept to launch.
            </p>
          </div>

          {/* View all - desktop */}
          <div className="relative hidden md:block flex-shrink-0">
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
              View all work →
            </button>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.title}
              className="group relative rounded-3xl overflow-hidden cursor-pointer"
              style={{
                gridColumn: `span ${project.span} / span ${project.span}`,
                background: 'hsl(var(--surface))',
                border: '1px solid hsl(var(--stroke))',
                aspectRatio: project.aspectRatio,
              }}
              variants={sectionVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Background image */}
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Halftone overlay */}
              <div className="absolute inset-0 halftone-overlay" />

              {/* Hover overlay */}
              <div
                className="absolute inset-0 backdrop-blur-lg transition-opacity duration-300"
                style={{
                  background: 'hsl(var(--bg) / 0.7)',
                  opacity: hoveredIndex === i ? 1 : 0,
                }}
              />

              {/* Hover label */}
              {hoveredIndex === i && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <span
                      className="absolute pointer-events-none rounded-full"
                      style={{
                        inset: '-2px',
                        background: 'linear-gradient(270deg, #89AACC, #4E85BF, #89AACC)',
                        backgroundSize: '300% 300%',
                        animation: 'gradient-shift 3s ease infinite',
                        borderRadius: '9999px',
                      }}
                    />
                    <div
                      className="relative rounded-full px-6 py-2.5 text-sm font-medium"
                      style={{
                        background: 'white',
                        color: '#111',
                      }}
                    >
                      View —{' '}
                      <em
                        style={{
                          fontFamily: 'Instrument Serif, serif',
                          fontStyle: 'italic',
                        }}
                      >
                        {project.title}
                      </em>
                    </div>
                  </div>
                </div>
              )}

              {/* Info (bottom) */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5 transition-opacity duration-300"
                style={{ opacity: hoveredIndex === i ? 0 : 1 }}
              >
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-2 text-xs"
                  style={{
                    background: 'hsl(var(--bg) / 0.7)',
                    color: 'hsl(var(--muted))',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {project.category}
                </div>
                <div
                  className="text-base font-medium"
                  style={{ color: 'hsl(var(--text))' }}
                >
                  {project.title}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorksSection;
