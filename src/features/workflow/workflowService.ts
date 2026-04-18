import { supabase } from '../../services/supabase';
import type { FlowNode, FlowEdge } from './types';

export interface WorkflowRecord {
  id: string;
  name: string;
  description: string | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  created_at: string;
  updated_at: string;
}

export const workflowService = {
  list: async (): Promise<WorkflowRecord[]> => {
    const { data, error } = await supabase
      .from('workflows')
      .select('id,name,description,created_at,updated_at')
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as WorkflowRecord[];
  },

  get: async (id: string): Promise<WorkflowRecord> => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as WorkflowRecord;
  },

  create: async (name: string, description?: string): Promise<WorkflowRecord> => {
    const { data, error } = await supabase
      .from('workflows')
      .insert({ name, description: description ?? null, nodes: [], edges: [] })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as WorkflowRecord;
  },

  save: async (id: string, name: string, nodes: FlowNode[], edges: FlowEdge[]): Promise<void> => {
    const { error } = await supabase
      .from('workflows')
      .update({ name, nodes, edges, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('workflows').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
