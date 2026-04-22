import React from 'react';
import { motion, type Variants } from 'framer-motion';

const STATS = [
  { value: '20+', label: 'Years Experience', description: 'Crafting digital experiences' },
  { value: '95+', label: 'Projects Done', description: 'From concept to launch' },
  { value: '200%', label: 'Satisfied Clients', description: 'Exceeding expectations' },
];

const sectionVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

const StatsSection: React.FC = () => {
  return (
    <section
      id="stats"
      style={{ background: 'transparent', padding: '6rem 0 8rem' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Divider */}
        <div className="w-full h-px mb-16" style={{ background: 'hsl(var(--stroke))' }} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={sectionVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div
                className="text-5xl md:text-6xl lg:text-7xl mb-3 tabular-nums"
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontStyle: 'italic',
                  background: 'linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-lg font-medium mb-1"
                style={{ color: 'hsl(var(--text))' }}
              >
                {stat.label}
              </div>
              <div
                className="text-sm"
                style={{ color: 'hsl(var(--muted))' }}
              >
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px mt-16" style={{ background: 'hsl(var(--stroke))' }} />
      </div>
    </section>
  );
};

export default StatsSection;
