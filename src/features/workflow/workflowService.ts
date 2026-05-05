export interface WorkflowRecord {
  id: string;
  name: string;
  description?: string;
  steps: unknown[];
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'workflows';

function load(): WorkflowRecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}

function save(data: WorkflowRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const workflowService = {
  list: async (): Promise<WorkflowRecord[]> => load(),

  create: async (name: string, description?: string): Promise<WorkflowRecord> => {
    const wf: WorkflowRecord = {
      id: crypto.randomUUID(),
      name,
      description,
      steps: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    save([...load(), wf]);
    return wf;
  },

  update: async (id: string, patch: Partial<WorkflowRecord>): Promise<WorkflowRecord> => {
    const all = load();
    const idx = all.findIndex(w => w.id === id);
    if (idx === -1) throw new Error('Workflow not found');
    all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
    save(all);
    return all[idx];
  },

  delete: async (id: string): Promise<void> => {
    save(load().filter(w => w.id !== id));
  },
};
