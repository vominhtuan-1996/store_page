import React from 'react';
import HeroSection from './components/liquid/HeroSection';
import AboutSection from './components/liquid/AboutSection';
import FeaturedVideoSection from './components/liquid/FeaturedVideoSection';
import PhilosophySection from './components/liquid/PhilosophySection';
import ServicesSection from './components/liquid/ServicesSection';

function App() {
  return (
    <div className="bg-black min-h-screen text-white selection:bg-white/20">
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturedVideoSection />
        <PhilosophySection />
        <ServicesSection />
      </main>

      {/* Basic Footer as per common landing page patterns, 
          though not explicitly detailed in sections but implied by the flow */}
      <footer className="bg-black py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-serif italic text-lg">
              A
            </div>
            <span className="font-semibold text-lg">Asme</span>
          </div>
          
          <div className="text-white/40 text-sm">
            © 2026 Asme. All rights reserved.
          </div>
          
          <div className="flex gap-8 text-sm text-white/60">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
