import { AnimatePresence, motion } from 'framer-motion';
import PremiumDarkHero from './components/PremiumDarkHero';
import FeaturesSection from './components/FeaturesSection';
import StatsSection from './components/StatsSection';
import WorksSection from './components/WorksSection';
import ExplorationsSection from './components/ExplorationsSection';
import JournalSection from './components/JournalSection';
import FooterSection from './components/FooterSection';
import ToolHub from './components/ToolHub';
import { useCurrentRoute, useNavigate, type ToolId } from './router';
import './styles/fonts.css';
import './styles/theme.css';
import './index.css';

const Sep = () => <div className="section-sep" />;

const LandingPage = () => {
  const navigate = useNavigate();
  const openTool = (id: ToolId) => navigate({ page: 'tool', tool: id });

  return (
    <div className="min-h-screen" style={{ background: '#000' }}>
      <main>
        <PremiumDarkHero />
        <FeaturesSection onOpenTool={openTool} />
        <Sep />
        <div style={{ background: '#000' }}><StatsSection /></div>
        <Sep />
        <div style={{ background: 'hsl(var(--bg-alt))' }}><WorksSection /></div>
        <Sep />
        <ExplorationsSection />
        <Sep />
        <div style={{ background: '#000' }}><JournalSection /></div>
        <FooterSection />
      </main>
    </div>
  );
};

function App() {
  const route = useCurrentRoute();

  return (
    <AnimatePresence mode="wait">
      {route.page === 'landing' && (
        <motion.div key="landing"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <LandingPage />
        </motion.div>
      )}

      {(route.page === 'hub' || route.page === 'tool' || route.page === 'workflow-builder') && (
        <motion.div key="hub"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}>
          <ToolHub />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
