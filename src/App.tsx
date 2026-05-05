import { AnimatePresence, motion } from 'framer-motion';
import { TuBongLandingPage } from './components/TuBongLanding';
import ToolHub from './components/ToolHub';
import { useCurrentRoute } from './router';
import './styles/fonts.css';
import './styles/theme.css';
import './index.css';

function App() {
  const route = useCurrentRoute();

  return (
    <AnimatePresence mode="wait">
      {route.page === 'landing' && (
        <motion.div key="landing"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <TuBongLandingPage />
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
