import { useState } from 'react';

interface TelegramSenderProps {
  onBack: () => void;
}

type Tab = 'message' | 'photo';
type Status = 'idle' | 'sending' | 'success' | 'error';

const QUICK_TEMPLATES = [
  { label: '✅ Done', text: '✅ *Task hoàn thành*' },
  { label: '🔴 Lỗi', text: '🔴 *Lỗi:* ' },
  { label: '⚠️ Cảnh báo', text: '⚠️ *Cảnh báo:* ' },
  { label: '🚀 Deploy', text: '🚀 *Deploy thành công*' },
  { label: '🔄 In Progress', text: '🔄 *Đang xử lý:* ' },
];

export const TelegramSender = ({ onBack }: TelegramSenderProps) => {
  const [tab, setTab] = useState<Tab>('message');
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [parseMode, setParseMode] = useState<'Markdown' | 'HTML'>('Markdown');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);

  const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  const canSend = tab === 'message' ? message.trim().length > 0 : photoUrl.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    if (!BOT_TOKEN || !CHAT_ID) {
      setStatus('error');
      const missing = [!BOT_TOKEN && 'VITE_TELEGRAM_BOT_TOKEN', !CHAT_ID && 'VITE_TELEGRAM_CHAT_ID'].filter(Boolean);
      setErrorMsg(`Thiếu env var: ${missing.join(', ')} — restart dev server sau khi cập nhật .env`);
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    try {
      const base = `https://api.telegram.org/bot${BOT_TOKEN}`;
      let res: Response;

      if (tab === 'message') {
        res = await fetch(`${base}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: parseMode }),
        });
      } else {
        res = await fetch(`${base}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            photo: photoUrl,
            caption: caption || undefined,
            parse_mode: caption ? parseMode : undefined,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(`[${data.error_code}] ${data.description || 'Telegram API error'}`);
      }

      setLastMessageId(data.result?.message_id);
      setStatus('success');
      if (tab === 'message') setMessage('');
      else { setPhotoUrl(''); setCaption(''); }

      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const applyTemplate = (text: string) => {
    setMessage(prev => text + (prev ? ' ' + prev : ''));
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Telegram Sender</h1>
          <p className="text-xs text-slate-500">Gửi tin nhắn & ảnh đến Telegram</p>
        </div>
        {/* Bot indicator */}
        <div className="ml-auto flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${BOT_TOKEN ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className="text-xs text-slate-400">{BOT_TOKEN ? 'Bot connected' : 'No token'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-xl bg-white/5 p-1">
        <button
          onClick={() => setTab('message')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
            tab === 'message' ? 'tab-active text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          Message
        </button>
        <button
          onClick={() => setTab('photo')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
            tab === 'photo' ? 'tab-active text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Photo
        </button>
      </div>

      {/* Message tab */}
      {tab === 'message' && (
        <div className="space-y-4">
          {/* Quick templates */}
          <div>
            <p className="mb-2 text-xs text-slate-500">Quick templates</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map(t => (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t.text)}
                  className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="glass rounded-xl p-1">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn... (hỗ trợ *bold*, _italic_, `code`)"
              rows={5}
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white placeholder-slate-600 outline-none"
            />
            <div className="flex items-center justify-between border-t border-white/5 px-4 py-2">
              <span className="text-xs text-slate-600">{message.length} ký tự</span>
              <select
                value={parseMode}
                onChange={e => setParseMode(e.target.value as 'Markdown' | 'HTML')}
                className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-400 outline-none"
              >
                <option value="Markdown">Markdown</option>
                <option value="HTML">HTML</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          {message && (
            <div className="glass rounded-xl p-4">
              <p className="mb-2 text-xs text-slate-500">Preview</p>
              <p className="whitespace-pre-wrap text-sm text-slate-300">{message}</p>
            </div>
          )}
        </div>
      )}

      {/* Photo tab */}
      {tab === 'photo' && (
        <div className="space-y-4">
          <div className="glass rounded-xl p-4">
            <label className="mb-2 block text-xs text-slate-500">URL ảnh (public)</label>
            <input
              type="url"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
            />
          </div>

          {/* Preview ảnh */}
          {photoUrl && (
            <div className="glass overflow-hidden rounded-xl">
              <img
                src={photoUrl}
                alt="preview"
                className="max-h-48 w-full object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="glass rounded-xl p-4">
            <label className="mb-2 block text-xs text-slate-500">Caption (tuỳ chọn)</label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Chú thích ảnh..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Success */}
      {status === 'success' && (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          ✅ Đã gửi thành công{lastMessageId ? ` (message_id: ${lastMessageId})` : ''}
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!canSend || status === 'sending'}
        className="mt-6 w-full rounded-xl py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: canSend && status !== 'sending'
            ? 'linear-gradient(135deg, #229ED9, #1a7fb5)'
            : undefined,
          backgroundColor: canSend && status !== 'sending' ? undefined : 'rgba(255,255,255,0.05)',
          color: canSend && status !== 'sending' ? 'white' : '#64748b',
        }}
      >
        {status === 'sending' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang gửi...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Gửi {tab === 'photo' ? 'ảnh' : 'tin nhắn'}
          </span>
        )}
      </button>

      {/* Setup guide nếu chưa có token */}
      {!BOT_TOKEN && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-400">
          <p className="mb-1 font-semibold">Cần cấu hình:</p>
          <p>Thêm vào <code className="rounded bg-white/10 px-1">.env</code>:</p>
          <pre className="mt-2 rounded bg-black/20 p-2 text-amber-300">{`VITE_TELEGRAM_BOT_TOKEN=...
VITE_TELEGRAM_CHAT_ID=...`}</pre>
        </div>
      )}
    </div>
  );
};
