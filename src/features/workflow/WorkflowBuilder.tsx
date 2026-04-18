import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type ReactFlowInstance,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from './nodes/TriggerNode';
import { ApiNode } from './nodes/ApiNode';
import { LogNode } from './nodes/LogNode';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import type { ApiData, FlowNode, FlowEdge, LogData } from './types';
import type { ApiDefinition } from '../../types/api';
import { parsePostmanCollection } from '../../utils/postmanParser';
import { workflowService } from './workflowService';
import { buildQueryParams, buildBody } from './interpolate';

const nodeTypes = { trigger: TriggerNode, api: ApiNode, log: LogNode };

const BASE_URL = import.meta.env.BASE_URL;
const PMS_BASE = 'https://apis-stag.fpt.vn';

function resolveUrl(raw: string, env = 'staging') {
  const base = env === 'production' ? 'https://apis.fpt.vn' : PMS_BASE;
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
      if (deg === 0) {
        const n = nodes.find(x => x.id === next);
        if (n) queue.push(n);
      }
    }
  }
  return result;
}

const INITIAL_NODES: FlowNode[] = [
  { id: 'trigger-1', type: 'trigger', position: { x: 60, y: 160 }, data: { label: 'Manual Trigger' } },
];

interface WorkflowBuilderProps {
  onBack: () => void;
  workflowId: string;
  workflowName: string;
}

let idCounter = 10;
const uid = () => `node-${++idCounter}`;

function FlowCanvas({ onBack, workflowId, workflowName }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [apis, setApis] = useState<ApiDefinition[]>([]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<{ nodeId: string; label: string; status: string; msg: string }[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [wfName, setWfName] = useState(workflowName);
  const [editingName, setEditingName] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loadError, setLoadError] = useState('');
  const rfInstance = useRef<ReactFlowInstance<FlowNode, FlowEdge> | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load PMS APIs
  useEffect(() => {
    fetch(`${BASE_URL}PMS.postman.json`)
      .then(r => r.json())
      .then(d => setApis(parsePostmanCollection(d)))
      .catch(() => {});
  }, []);

  // Load workflow from Supabase
  useEffect(() => {
    workflowService.get(workflowId).then(wf => {
      if (wf.nodes?.length) setNodes(wf.nodes);
      if (wf.edges?.length) setEdges(wf.edges);
    }).catch(e => setLoadError(e.message));
  }, [workflowId]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await workflowService.save(workflowId, wfName, nodes as FlowNode[], edges as FlowEdge[]);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: FlowNode) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const addNode = (type: 'api' | 'log') => {
    const pos = rfInstance.current?.screenToFlowPosition({ x: 300, y: 200 + nodes.length * 60 }) ?? { x: 300, y: 200 };
    const newNode: FlowNode = type === 'api'
      ? { id: uid(), type: 'api', position: pos, data: { label: 'API Call', toolName: '', environment: 'staging', queryParams: {}, body: {}, status: 'idle' } as ApiData }
      : { id: uid(), type: 'log', position: pos, data: { label: 'Log Output', status: 'idle' } as LogData };
    setNodes(ns => [...ns, newNode]);
    setSelectedNode(newNode);
  };

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('node-type') as 'api' | 'log';
    if (!type || !rfInstance.current) return;
    const pos = rfInstance.current.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const newNode: FlowNode = type === 'api'
      ? { id: uid(), type: 'api', position: pos, data: { label: 'API Call', toolName: '', environment: 'staging', queryParams: {}, body: {}, status: 'idle' } as ApiData }
      : { id: uid(), type: 'log', position: pos, data: { label: 'Log Output', status: 'idle' } as LogData };
    setNodes(ns => [...ns, newNode]);
    setSelectedNode(newNode);
  }, [setNodes]);

  const handleNodeChange = useCallback((nodeId: string, data: Partial<ApiData>) => {
    setNodes(ns => ns.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n));
    setSelectedNode(prev => prev && prev.id === nodeId ? { ...prev, data: { ...prev.data, ...data } } as FlowNode : prev);
  }, [setNodes]);

  const runWorkflow = async () => {
    if (running) return;
    setRunning(true);
    setShowLog(true);
    setLogs([]);

    let authToken = localStorage.getItem('pms_auth_token') ?? '';
    const context: Record<string, unknown> = {};

    // Reset node status
    setNodes(ns => ns.map(n => n.type === 'api'
      ? { ...n, data: { ...n.data, status: 'idle', output: undefined, errorMsg: undefined } }
      : n.type === 'log'
      ? { ...n, data: { ...n.data, status: 'idle', output: undefined } }
      : n
    ));

    const sorted = topoSort(nodes as FlowNode[], edges);
    const addLog = (nodeId: string, label: string, status: string, msg: string) =>
      setLogs(prev => [...prev, { nodeId, label, status, msg }]);

    for (const node of sorted) {
      if (node.type === 'trigger') {
        addLog(node.id, 'Manual Trigger', 'success', 'Workflow started');
        continue;
      }

      if (node.type === 'api') {
        const d = node.data as unknown as ApiData;
        if (!d.toolName) { addLog(node.id, d.label, 'skip', 'Bỏ qua: chưa cấu hình endpoint'); continue; }

        const api = apis.find(a => a.toolName === d.toolName);
        if (!api) { addLog(node.id, d.label, 'error', `Không tìm thấy endpoint: ${d.toolName}`); continue; }

        setNodes(ns => ns.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n));
        addLog(node.id, d.label, 'running', `Gọi ${api.method} ${api.toolName}`);

        const t0 = Date.now();
        try {
          let url = resolveUrl(api.url, d.environment);
          const qp = buildQueryParams(d.queryParams ?? {}, context);
          if (qp.toString()) url += (url.includes('?') ? '&' : '?') + qp.toString();

          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

          const opts: RequestInit = { method: api.method, headers };
          if (d.body && ['POST', 'PUT', 'PATCH'].includes(api.method)) {
            opts.body = JSON.stringify(buildBody(d.body, context));
          }

          const res = await fetch(url, opts);
          const ct = res.headers.get('content-type') ?? '';
          const data = ct.includes('application/json') ? await res.json() : await res.text();
          const ms = Date.now() - t0;

          context[node.id] = data;

          // Auto-extract and persist auth token from login responses
          const extractedToken = (data as Record<string, unknown>)?.['data']?.['token' as never]
            ?? (data as Record<string, unknown>)?.['token']
            ?? (data as Record<string, unknown>)?.['accessToken'];
          if (extractedToken && typeof extractedToken === 'string') {
            authToken = extractedToken;
            localStorage.setItem('pms_auth_token', extractedToken);
            addLog(node.id, d.label, 'success', `✓ ${res.status} · ${ms}ms · Token đã lưu`);
          } else {
            addLog(node.id, d.label, 'success', `✓ ${res.status} · ${ms}ms`);
          }

          setNodes(ns => ns.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'success', output: data } } : n));
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setNodes(ns => ns.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'error', errorMsg: msg } } : n));
          addLog(node.id, d.label, 'error', `✗ ${msg}`);
        }
        continue;
      }

      if (node.type === 'log') {
        // Find the incoming node output
        const incomingEdge = edges.find(e => e.target === node.id);
        const sourceOutput = incomingEdge ? context[incomingEdge.source] : undefined;
        context[node.id] = sourceOutput;
        setNodes(ns => ns.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'success', output: sourceOutput } } : n));
        addLog(node.id, (node.data as unknown as LogData).label, 'success', `Output: ${JSON.stringify(sourceOutput).slice(0, 80)}`);
      }
    }

    setRunning(false);
  };

  const NODE_TEMPLATES = [
    { type: 'api' as const, label: 'API Call', desc: 'Gọi PMS endpoint', color: 'from-primary-500/20 to-primary-600/10', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25', textColor: 'text-primary-400' },
    { type: 'log' as const, label: 'Log Output', desc: 'Hiển thị kết quả', color: 'from-amber-500/20 to-orange-500/10', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', textColor: 'text-amber-400' },
  ];

  return (
    <div className="flex h-screen w-screen flex-col bg-[#080a0f]" style={{ position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
      {/* Top bar */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 bg-[#0c0e14] px-5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
          <div className="h-4 w-px bg-white/10" />
          {editingName ? (
            <input
              autoFocus
              value={wfName}
              onChange={e => setWfName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => { if (e.key === 'Enter') setEditingName(false); }}
              className="rounded-lg border border-primary-500/50 bg-white/5 px-2 py-1 text-sm font-bold text-white outline-none w-56"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 group"
            >
              <span className="text-sm font-bold text-white">{wfName}</span>
              <svg className="h-3 w-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
          )}
          {loadError && <span className="text-[10px] text-red-400">⚠ {loadError}</span>}
        </div>
        <div className="flex items-center gap-3">
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              saveStatus === 'saved' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' :
              saveStatus === 'error' ? 'border-red-500/40 bg-red-500/10 text-red-400' :
              'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {saveStatus === 'saving' ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : saveStatus === 'saved' ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            {saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'saved' ? 'Đã lưu' : saveStatus === 'error' ? 'Lỗi lưu' : 'Lưu'}
          </button>
          <button
            onClick={() => setShowLog(v => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-white/20 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
            Logs
          </button>
          <button
            onClick={runWorkflow}
            disabled={running}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:opacity-50"
          >
            {running ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            )}
            {running ? 'Đang chạy...' : 'Run'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex w-52 flex-shrink-0 flex-col border-r border-white/5 bg-[#0c0e14] p-3">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Nodes</p>
          <div className="space-y-2">
            {NODE_TEMPLATES.map(t => (
              <div
                key={t.type}
                draggable
                onDragStart={e => e.dataTransfer.setData('node-type', t.type)}
                onClick={() => addNode(t.type)}
                className={`cursor-grab rounded-xl border border-white/5 bg-gradient-to-br p-3 transition-all active:cursor-grabbing hover:border-white/15 ${t.color}`}
              >
                <div className="flex items-center gap-2">
                  <svg className={`h-4 w-4 ${t.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                  </svg>
                  <div>
                    <p className={`text-xs font-semibold ${t.textColor}`}>{t.label}</p>
                    <p className="text-[10px] text-slate-500">{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Info</p>
            <div className="space-y-1.5 text-[10px] text-slate-600">
              <p>• Drag node vào canvas</p>
              <p>• Kéo từ handle để nối</p>
              <p>• Click node để cấu hình</p>
              <p>• Dùng <code className="text-slate-400">{'{{nodeId.field}}'}</code> để ref data</p>
            </div>
          </div>

          <div className="mt-auto border-t border-white/5 pt-3">
            <p className="text-[10px] text-slate-600">
              {nodes.length} nodes · {edges.length} edges
            </p>
            {!localStorage.getItem('pms_auth_token') && (
              <p className="mt-1 text-[10px] text-amber-500/80">⚠ Chưa login PMS</p>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div ref={reactFlowWrapper} className="flex-1" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            onInit={instance => { rfInstance.current = instance; }}
            fitView
            className="bg-[#080a0f]"
            deleteKeyCode="Delete"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e2030" />
            <Controls className="[&>button]:border-white/10 [&>button]:bg-[#0c0e14] [&>button]:text-slate-400" />
            <MiniMap
              nodeColor={n => n.type === 'trigger' ? '#10b981' : n.type === 'api' ? '#6366f1' : '#78716c'}
              className="!border-white/5 !bg-[#0c0e14]"
            />
          </ReactFlow>
        </div>

        {/* Config Panel */}
        {selectedNode?.type === 'api' && (
          <NodeConfigPanel
            node={selectedNode}
            apis={apis}
            allNodes={nodes as FlowNode[]}
            edges={edges as FlowEdge[]}
            onClose={() => setSelectedNode(null)}
            onChange={handleNodeChange}
          />
        )}
      </div>

      {/* Execution Log Panel */}
      {showLog && (
        <div className="flex h-44 flex-shrink-0 flex-col border-t border-white/5 bg-[#0c0e14]">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Execution Log</span>
            <button onClick={() => setShowLog(false)} className="text-slate-600 hover:text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-[11px] space-y-1">
            {logs.length === 0 && <p className="text-slate-600">Chưa có log. Nhấn Run để chạy workflow.</p>}
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`flex-shrink-0 ${
                  log.status === 'success' ? 'text-emerald-400' :
                  log.status === 'error' ? 'text-red-400' :
                  log.status === 'running' ? 'text-primary-400' :
                  'text-slate-500'
                }`}>
                  {log.status === 'success' ? '✓' : log.status === 'error' ? '✗' : log.status === 'running' ? '▶' : '○'}
                </span>
                <span className="text-slate-400">[{log.label}]</span>
                <span className={log.status === 'error' ? 'text-red-400' : 'text-slate-300'}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const WorkflowBuilder = ({ onBack, workflowId, workflowName }: WorkflowBuilderProps) => (
  <ReactFlowProvider>
    <FlowCanvas onBack={onBack} workflowId={workflowId} workflowName={workflowName} />
  </ReactFlowProvider>
);
