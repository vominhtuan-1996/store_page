import { create } from 'zustand';

/* ── Route definitions ───────────────────────────────────────────── */
export type ToolId = 'workflow' | 'agent' | 'commands' | 'mcp' | 'tasks' | 'storage';

export type Route =
  | { page: 'landing' }
  | { page: 'hub' }
  | { page: 'tool'; tool: ToolId }
  | { page: 'workflow-builder'; workflowId: string; workflowName: string };

/* ── Router store ────────────────────────────────────────────────── */
interface RouterState {
  stack: Route[];
  current: Route;

  navigate: (route: Route) => void;
  back: () => void;
  replace: (route: Route) => void;
  reset: () => void;
}

const INITIAL: Route = { page: 'landing' };

export const useRouter = create<RouterState>((set, get) => ({
  stack: [],
  current: INITIAL,

  navigate(route) {
    set(s => ({ stack: [...s.stack, s.current], current: route }));
  },

  back() {
    const { stack } = get();
    if (!stack.length) return;
    const prev = stack[stack.length - 1];
    set(s => ({ stack: s.stack.slice(0, -1), current: prev }));
  },

  replace(route) {
    set({ current: route });
  },

  reset() {
    set({ stack: [], current: INITIAL });
  },
}));

/* ── Convenience selectors ───────────────────────────────────────── */
export const useCurrentRoute = () => useRouter(s => s.current);
export const useCanGoBack    = () => useRouter(s => s.stack.length > 0);
export const useNavigate     = () => useRouter(s => s.navigate);
export const useBack         = () => useRouter(s => s.back);
