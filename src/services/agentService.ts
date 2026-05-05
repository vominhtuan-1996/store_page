export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AgentStep =
  | { type: 'tool_call';   toolName: string; toolInput: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; toolResult: unknown; isError: boolean }
  | { type: 'thinking';    text: string }
  | { type: 'answer';      text: string };

export interface WorkflowSummary {
  id: string;
  name: string;
}

export async function runAgent(
  _message: string,
  _history: ChatMessage[],
  _onStep: (step: AgentStep) => void,
  _workflows?: WorkflowSummary[],
): Promise<{ steps: AgentStep[]; finalAnswer: string }> {
  await new Promise(r => setTimeout(r, 800));
  return {
    steps: [],
    finalAnswer: 'Agent service not yet configured. Please connect an AI backend.',
  };
}
