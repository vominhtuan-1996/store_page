import React from 'react';

const VIDEO_URL = "https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4";

const PremiumDarkHero: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black selection:bg-white selection:text-black">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-black/40 z-1" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-1" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-1" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
        <div 
          className="text-2xl font-medium text-white tracking-[0.2em] uppercase"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Archetype<sup>™</sup>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {['Works', 'Studio', 'Vision', 'Contact'].map((item) => (
            <button 
              key={item}
              className="text-xs font-semibold text-white/50 hover:text-white tracking-widest uppercase transition-all duration-300"
            >
              {item}
            </button>
          ))}
        </div>

        <button className="group relative px-6 py-2 overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest transition-all hover:border-white/40">
          <span className="relative z-10">Get in touch</span>
          <div className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 group-hover:translate-x-0" />
          <span className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-difference">
            Get in touch
          </span>
        </button>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 text-center">
        <div className="animate-fade-rise flex flex-col items-center">
          <span 
            className="text-[10px] md:text-xs font-bold text-white/30 tracking-[0.5em] uppercase mb-8"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Est. MMXXVI • Digital Craft
          </span>
          
          <h1 
            className="text-6xl md:text-8xl lg:text-9xl text-white leading-tight mb-8"
            style={{ 
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic'
            }}
          >
            Elegance <br className="hidden md:block" /> 
            <span className="text-white/40">in</span> Motion
          </h1>

          <p 
            className="animate-fade-rise-delay text-sm md:text-base max-w-xl text-white/50 leading-relaxed tracking-wide"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            We curate cinematic digital experiences for brands that dare to lead. 
            Archetype represents the peak of technical precision and creative soul.
          </p>

          <div className="animate-fade-rise-delay-2 mt-16">
            <button className="group relative flex items-center gap-4 text-white text-sm font-bold uppercase tracking-[0.3em] transition-all hover:gap-6">
              <span>Explore Collection</span>
              <span className="w-12 h-px bg-white/30 transition-all group-hover:w-16 group-hover:bg-white" />
            </button>
          </div>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="absolute bottom-12 left-12 z-20 hidden lg:block">
        <div className="flex items-center gap-4 rotate-180 [writing-mode:vertical-lr]">
          <span className="text-[10px] text-white/20 tracking-widest uppercase">Scroll to explore</span>
          <div className="w-px h-12 bg-white/10" />
        </div>
      </div>
    </div>
  );
};

export default PremiumDarkHero;
