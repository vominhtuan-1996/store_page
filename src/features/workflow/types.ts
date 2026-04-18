import type { Node, Edge } from '@xyflow/react';

export interface TriggerData extends Record<string, unknown> {
  label: string;
}

export interface ApiData extends Record<string, unknown> {
  label: string;
  toolName: string;
  environment: 'staging' | 'production';
  queryParams: Record<string, string>;
  body: Record<string, string>;
  status: 'idle' | 'running' | 'success' | 'error';
  output?: unknown;
  errorMsg?: string;
}

export interface LogData extends Record<string, unknown> {
  label: string;
  status: 'idle' | 'running' | 'success' | 'error';
  output?: unknown;
}

export type TriggerNode = Node<TriggerData, 'trigger'>;
export type ApiNode = Node<ApiData, 'api'>;
export type LogNode = Node<LogData, 'log'>;
export type FlowNode = TriggerNode | ApiNode | LogNode;
export type FlowEdge = Edge;

export interface WorkflowExecution {
  nodeId: string;
  status: 'running' | 'success' | 'error';
  output?: unknown;
  errorMsg?: string;
  durationMs?: number;
}
