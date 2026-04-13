import { useState } from 'react';

interface TelegramMcpInstallProps {
  onBack: () => void;
}

const CONFIG_SNIPPET = `"telegram": {
  "command": "node",
  "args": ["/path/to/telegram_mcp/server.js"]
}`;

const ENV_SNIPPET = `TELEGRAM_BOT_TOKEN=123456:ABC-your-token
TELEGRAM_CHAT_ID=-1001234567890`;

export const TelegramMcpInstall = ({ onBack }: TelegramMcpInstallProps) => {
  const [os, setOs] = useState<'mac' | 'win'>('mac');
  const [copied, setCopied] = useState<'config' | 'env' | null>(null);

  const handleCopy = (type: 'config' | 'env', text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/30 to-blue-600/30">
          <svg className="h-7 w-7 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.483c-.148.658-.538.818-1.09.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 14.53l-2.95-.924c-.64-.203-.653-.64.136-.948l11.52-4.44c.533-.194 1 .13.666.93z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">telegram-mcp</h1>
          <p className="text-sm text-slate-500">MCP Server · v1.0.0 · 20 KB · Yêu cầu Node.js ≥ 18 + Telegram Bot</p>
        </div>
      </div>

      {/* Download */}
      <a
        href={`${import.meta.env.BASE_URL}downloads/telegram-mcp-v1.0.0.zip`}
        download
        className="mb-8 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-opacity hover:opacity-90 active:opacity-75"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download telegram-mcp-v1.0.0.zip
      </a>

      {/* Install guide */}
      <div className="glass rounded-2xl p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Hướng dẫn cài đặt
        </h2>

        {/* OS toggle */}
        <div className="mb-5 flex rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setOs('mac')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              os === 'mac' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Mac / Linux
          </button>
          <button
            onClick={() => setOs('win')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              os === 'win' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Windows
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-5">
          {/* Step 1 - Telegram Bot */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400">1</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Tạo Telegram Bot</p>
              <p className="text-xs text-slate-500">
                Nhắn tin cho{' '}
                <span className="text-sky-400">@BotFather</span> trên Telegram → <code className="rounded bg-white/5 px-1 text-sky-300">/newbot</code> → lấy{' '}
                <code className="rounded bg-white/5 px-1 text-sky-300">BOT_TOKEN</code>.
                Thêm bot vào group/channel và lấy <code className="rounded bg-white/5 px-1 text-sky-300">CHAT_ID</code>.
              </p>
            </div>
          </div>

          {/* Step 2 - Extract */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400">2</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Giải nén file zip</p>
              <code className="block rounded-lg bg-white/5 px-3 py-2 font-mono text-[12px] text-slate-400">
                {os === 'mac' ? '~/tools/telegram_mcp/' : 'C:\\tools\\telegram_mcp\\'}
              </code>
            </div>
          </div>

          {/* Step 3 - Install script */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400">3</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Chạy script cài đặt</p>
              <code className="block rounded-lg bg-white/5 px-3 py-2 font-mono text-[12px] text-slate-400">
                {os === 'mac'
                  ? 'bash ~/tools/telegram_mcp/install.sh'
                  : 'powershell -ExecutionPolicy Bypass -File install.ps1'}
              </code>
              <p className="mt-1.5 text-xs text-slate-600">
                Script tự động: cài dependencies, nhập Bot Token + Chat ID, patch Claude Desktop, copy slash commands.
              </p>
            </div>
          </div>

          {/* Step 4 - .env manual */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400">4</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">
                Tạo <code className="rounded bg-white/5 px-1 text-sky-300">.env</code> thủ công (nếu cần)
              </p>
              <p className="mb-2 text-xs text-slate-600">
                Đặt file <code className="text-slate-500">.env</code> trong thư mục <strong className="text-slate-400">cha</strong> của <code className="text-slate-500">telegram_mcp/</code>:
              </p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-white/5 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-slate-400">
                  {ENV_SNIPPET}
                </pre>
                <button
                  onClick={() => handleCopy('env', ENV_SNIPPET)}
                  className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {copied === 'env' ? (
                    <>
                      <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 5 - Config */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400">5</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Thêm config vào .mcp.json</p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-white/5 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-slate-400">
                  {CONFIG_SNIPPET}
                </pre>
                <button
                  onClick={() => handleCopy('config', CONFIG_SNIPPET)}
                  className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {copied === 'config' ? (
                    <>
                      <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Thay <code className="text-slate-500">/path/to/telegram_mcp/server.js</code> bằng đường dẫn thực tế.
              </p>
            </div>
          </div>

          {/* Done */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-400">✓</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-300">Restart Claude Desktop / reload Claude Code</p>
              <p className="mt-0.5 text-xs text-slate-600">
                2 tools khả dụng: <code className="text-slate-500">send_telegram_notification</code>, <code className="text-slate-500">send_telegram_photo</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <p className="mb-1 text-xs font-semibold text-sky-400">send_telegram_notification</p>
          <p className="text-xs text-slate-500">Gửi tin nhắn văn bản, hỗ trợ Markdown</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="mb-1 text-xs font-semibold text-sky-400">send_telegram_photo</p>
          <p className="text-xs text-slate-500">Gửi ảnh từ URL kèm caption</p>
        </div>
      </div>

      {/* Slash commands */}
      <div className="mt-3 glass rounded-2xl p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Slash Commands</h2>
        <div className="space-y-2">
          {[
            { cmd: '/telegram-notify', desc: 'Gửi tin nhắn đến Telegram' },
            { cmd: '/telegram-photo', desc: 'Gửi ảnh từ URL đến Telegram' },
          ].map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-center gap-3">
              <code className="shrink-0 rounded-md bg-sky-500/10 px-2 py-0.5 text-[12px] font-mono text-sky-400">{cmd}</code>
              <span className="text-xs text-slate-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
