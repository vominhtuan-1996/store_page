import { workflowService } from './workflowService';
import type { FlowNode, FlowEdge, ApiData, LogData } from './types';
import type { ApiDefinition } from '../../types/api';
import { parsePostmanCollection } from '../../utils/postmanParser';
import { buildQueryParams, buildBody } from './interpolate';

const BASE_URL = import.meta.env.BASE_URL;
const PMS_BASES = { staging: 'https://apis-stag.fpt.vn', production: 'https://apis.fpt.vn' };

function resolveUrl(raw: string, env = 'staging') {
  const base = PMS_BASES[env as keyof typeof PMS_BASES] ?? PMS_BASES.staging;
  return raw.replace(/\{\{baseUrl\}\}/g, base).replace(/https:\/\/apis-stag\.fpt\.vn/g, base);
}

function topoSort(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const inDegree = new Map<string, number>(nodes.map(n => [n.id, 0]));
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  });
  const queue = nodes.filter(n => inDegree.get(n.id) === 0);
  const result: FlowNode[] = [];
  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    for (const next of adj.get(node.id) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, deg);
      if (deg === 0) { const n = nodes.find(x => x.id === next); if (n) queue.push(n); }
    }
  }
  return result;
}

let _cachedApis: ApiDefinition[] | null = null;
async function loadApis(): Promise<ApiDefinition[]> {
  if (_cachedApis) return _cachedApis;
  const res = await fetch(`${BASE_URL}PMS.postman.json`);
  const data = await res.json();
  _cachedApis = parsePostmanCollection(data);
  return _cachedApis;
}

export interface StepResult {
  nodeId: string;
  nodeLabel: string;
  type: string;
  status: 'success' | 'error' | 'skip';
  output?: unknown;
  error?: string;
  durationMs?: number;
}

export interface WorkflowRunResult {
  workflowName: string;
  steps: StepResult[];
  finalOutput: unknown;
  tokenSaved: boolean;
}

export async function executeWorkflow(workflowId: string): Promise<WorkflowRunResult> {
  const wf = await workflowService.get(workflowId);
  const apis = await loadApis();
  const nodes = wf.nodes as FlowNode[];
  const edges = wf.edges as FlowEdge[];

  let authToken = localStorage.getItem('pms_auth_token') ?? '';
  const context: Record<string, unknown> = {};
  const steps: StepResult[] = [];
  let finalOutput: unknown = undefined;
  let tokenSaved = false;

  for (const node of topoSort(nodes, edges)) {
    if (node.type === 'trigger') {
      steps.push({ nodeId: node.id, nodeLabel: 'Manual Trigger', type: 'trigger', status: 'success', output: 'started' });
      continue;
    }

    if (node.type === 'api') {
      const d = node.data as unknown as ApiData;
      if (!d.toolName) {
        steps.push({ nodeId: node.id, nodeLabel: d.label, type: 'api', status: 'skip', error: 'Endpoint chưa cấu hình' });
        continue;
      }
      const api = apis.find(a => a.toolName === d.toolName);
      if (!api) {
        steps.push({ nodeId: node.id, nodeLabel: d.label, type: 'api', status: 'error', error: `Không tìm thấy: ${d.toolName}` });
        continue;
      }

      const t0 = Date.now();
      try {
        let url = resolveUrl(api.url, d.environment);

        // Build query params — arrays become repeated keys (?id=1&id=2)
        const qp = buildQueryParams(d.queryParams ?? {}, context);
        if (qp.toString()) url += (url.includes('?') ? '&' : '?') + qp.toString();

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const opts: RequestInit = { method: api.method, headers };
        if (d.body && ['POST', 'PUT', 'PATCH'].includes(api.method)) {
          // buildBody preserves arrays/objects — JSON.stringify keeps them as native types
          opts.body = JSON.stringify(buildBody(d.body, context));
        }

        const res = await fetch(url, opts);
        const ct = res.headers.get('content-type') ?? '';
        const data = ct.includes('application/json') ? await res.json() : await res.text();
        const ms = Date.now() - t0;

        // Auto-save token from login responses
        const extracted = (data as Record<string, unknown>)?.['data']?.['token' as never]
          ?? (data as Record<string, unknown>)?.['token']
          ?? (data as Record<string, unknown>)?.['accessToken'];
        if (extracted && typeof extracted === 'string') {
          authToken = extracted;
          localStorage.setItem('pms_auth_token', extracted);
          tokenSaved = true;
        }

        context[node.id] = data;
        finalOutput = data;
        steps.push({ nodeId: node.id, nodeLabel: d.label, type: 'api', status: 'success', output: data, durationMs: ms });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        steps.push({ nodeId: node.id, nodeLabel: d.label, type: 'api', status: 'error', error: msg });
      }
      continue;
    }

    if (node.type === 'log') {
      const incomingEdge = edges.find(e => e.target === node.id);
      const output = incomingEdge ? context[incomingEdge.source] : undefined;
      context[node.id] = output;
      finalOutput = output;
      steps.push({ nodeId: node.id, nodeLabel: (node.data as unknown as LogData).label, type: 'log', status: 'success', output });
    }
  }

  return { workflowName: wf.name, steps, finalOutput, tokenSaved };
}
