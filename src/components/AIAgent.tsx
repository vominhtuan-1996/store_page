import { useState, useRef, useEffect } from 'react';
import { runAgent, type ChatMessage, type AgentStep, type WorkflowSummary } from '../services/agentService';
import { workflowService } from '../features/workflow/workflowService';

interface AIAgentProps {
  onBack: () => void;
}

interface DisplayMessage {
  id: number;
  role: 'user' | 'assistant' | 'step';
  content?: string;
  step?: AgentStep;
}

const SUGGESTIONS = [
  'Xem danh sách workflow đã lưu',
  'Chạy flow login PMS của tôi',
  'Lấy danh sách loại triển khai',
  'Xem danh sách phiếu tháng 2025/04',
];

const ToolCallBadge = ({ step }: { step: AgentStep }) => {
  if (step.type === 'tool_call') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary-500/20 bg-primary-500/10 px-3 py-1.5">
        <svg className="h-3 w-3 animate-spin text-primary-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="font-mono text-[11px] font-bold text-primary-400">{step.toolName}</span>
        <span className="text-[10px] text-slate-600">
          {Object.entries(step.toolInput || {})
            .slice(0, 2)
            .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
            .join(', ')}
        </span>
      </div>
    );
  }

  if (step.type === 'tool_result') {
    return (
      <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
        step.isError
          ? 'border border-red-500/20 bg-red-500/10'
          : 'border border-emerald-500/20 bg-emerald-500/10'
      }`}>
        <span className="text-[11px]">{step.isError ? '❌' : '✅'}</span>
        <span className="font-mono text-[11px] font-medium text-slate-400">{step.toolName}</span>
        <span className={`text-[10px] ${step.isError ? 'text-red-400' : 'text-emerald-600'}`}>
          {step.isError
            ? String(step.toolResult)
            : Array.isArray(step.toolResult)
              ? `${(step.toolResult as unknown[]).length} items`
              : 'OK'}
        </span>
      </div>
    );
  }

  if (step.type === 'thinking' && step.text) {
    return (
      <div className="rounded-lg border border-white/5 bg-white/3 px-3 py-2">
        <p className="text-[11px] italic text-slate-500">{step.text}</p>
      </div>
    );
  }

  return null;
};

export const AIAgent = ({ onBack }: AIAgentProps) => {
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [liveSteps, setLiveSteps] = useState<AgentStep[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    workflowService.list().then(setWorkflows).catch(() => {});
  }, []);

  const nextId = () => ++idRef.current;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, liveSteps, isRunning]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isRunning) return;

    setInput('');
    setIsRunning(true);
    setLiveSteps([]);

    const userMsg: DisplayMessage = { id: nextId(), role: 'user', content: msg };
    setDisplayMessages(prev => [...prev, userMsg]);

    try {
      const { steps, finalAnswer } = await runAgent(msg, history, (step) => {
        setLiveSteps(prev => [...prev, step]);
      }, workflows);

      // Commit steps + answer to display
      const stepMessages: DisplayMessage[] = steps
        .filter(s => s.type !== 'answer')
        .map(s => ({ id: nextId(), role: 'step' as const, step: s }));

      const answerMsg: DisplayMessage = { id: nextId(), role: 'assistant', content: finalAnswer };

      setDisplayMessages(prev => [...prev, ...stepMessages, answerMsg]);
      setHistory(prev => [
        ...prev,
        { role: 'user', content: msg },
        { role: 'assistant', content: finalAnswer },
      ]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setDisplayMessages(prev => [
        ...prev,
        { id: nextId(), role: 'assistant', content: `❌ Lỗi: ${errMsg}` },
      ]);
    } finally {
      setIsRunning(false);
      setLiveSteps([]);
    }
  };

  return (
    <div className="flex h-[82vh] w-full flex-col">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Claude Agent</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 mb-4">
        {displayMessages.length === 0 && !isRunning && (
          <div className="flex h-full flex-col items-center justify-center space-y-5 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-violet shadow-lg shadow-primary-500/20">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tôi có thể giúp gì?</h2>
              <p className="mt-1 text-xs text-slate-500">Powered by Claude · Tasks · Storage · Telegram</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="glass rounded-xl p-3 text-left text-xs text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {displayMessages.map(msg => {
          if (msg.role === 'step' && msg.step) {
            return (
              <div key={msg.id} className="flex justify-start pl-2">
                <ToolCallBadge step={msg.step} />
              </div>
            );
          }
          return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'rounded-tr-none bg-primary-500 text-white shadow-lg shadow-primary-500/10'
                  : 'glass rounded-tl-none text-slate-200'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Live steps while running */}
        {isRunning && (
          <div className="space-y-2">
            {liveSteps.map((step, i) => (
              <div key={i} className="flex justify-start pl-2">
                <ToolCallBadge step={step} />
              </div>
            ))}
            {liveSteps.length === 0 && (
              <div className="flex justify-start">
                <div className="glass flex items-center gap-3 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] italic text-slate-500">Claude đang suy nghĩ...</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={e => { e.preventDefault(); handleSend(); }}
        className="group relative mt-auto"
      >
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-violet blur opacity-20 transition duration-500 group-focus-within:opacity-40" />
        <div className="relative glass flex items-center gap-3 rounded-2xl px-5 py-4">
          <input
            type="text"
            placeholder="Giao việc cho Claude Agent..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isRunning}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isRunning}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 transition-all hover:bg-primary-500 hover:text-white disabled:opacity-30"
          >
            {isRunning ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
