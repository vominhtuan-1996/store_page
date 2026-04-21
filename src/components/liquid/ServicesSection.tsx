import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const SERVICES = [
  {
    tag: "Strategy",
    title: "Research & Insight",
    description: "We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change.",
    video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
  },
  {
    tag: "Craft",
    title: "Design & Execution",
    description: "From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary.",
    video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
  }
];

const ServicesSection: React.FC = () => {
  return (
    <section className="bg-black py-28 md:py-40 px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-row items-end justify-between mb-12 md:mb-20"
        >
          <h2 className="text-3xl md:text-5xl text-white tracking-tight">
            What we do
          </h2>
          <span className="text-white/40 text-sm hidden md:block uppercase tracking-widest font-medium">
            Our services
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="liquid-glass rounded-3xl overflow-hidden group flex flex-col"
            >
              {/* Card video area */}
              <div className="aspect-video relative overflow-hidden">
                <video
                  src={service.video}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Card body */}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="uppercase tracking-widest text-white/40 text-xs font-medium">
                    {service.tag}
                  </span>
                  <div className="liquid-glass rounded-full p-2.5 flex items-center justify-center text-white bg-white/5">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
                
                <h3 className="text-white text-xl md:text-2xl mb-4 tracking-tight font-medium">
                  {service.title}
                </h3>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
