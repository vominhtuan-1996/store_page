import { useState } from 'react';
import { useClipboardSync } from '../hooks/useClipboardSync';

interface ClipboardSyncProps {
  onBack: () => void;
}

export const ClipboardSync = ({ onBack }: ClipboardSyncProps) => {
  const {
    content,
    hasSharedContent,
    setContent,
    generateShareUrl,
    copyToClipboard,
    pasteFromClipboard,
    downloadAsTxt,
    clear,
  } = useClipboardSync();

  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const url = generateShareUrl();
    const ok = await copyToClipboard(url);
    if (ok) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handlePaste = async () => {
    await pasteFromClipboard();
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-white/10"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Clipboard Sync</h2>
          <p className="text-xs text-slate-500">Chia se noi dung giua cac thiet bi qua link</p>
        </div>
      </div>

      {/* Shared content banner */}
      {hasSharedContent && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-300">
            Nhan duoc noi dung tu thiet bi khac! Bam <strong>Copy</strong> de su dung.
          </p>
        </div>
      )}

      {/* Text area */}
      <div className="glass mb-4 rounded-xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">Noi dung</p>
          <button
            onClick={handlePaste}
            className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            Paste
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full resize-none rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-white/10 transition-all focus:ring-primary-500/50"
          placeholder="Nhap hoac paste noi dung can chia se..."
        />
        <p className="mt-1 text-right text-[10px] text-slate-600">
          {content.length} ky tu
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        {/* Copy content */}
        <button
          onClick={handleCopy}
          disabled={!content}
          className="glass group flex w-full items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:scale-[1.005] disabled:opacity-40"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/15">
            {copied ? (
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-white">
              {copied ? 'Da copy!' : 'Copy noi dung'}
            </p>
            <p className="text-[11px] text-slate-500">Copy vao clipboard cua thiet bi</p>
          </div>
        </button>

        {/* Share link */}
        <button
          onClick={handleCopyLink}
          disabled={!content}
          className="glass group flex w-full items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:scale-[1.005] disabled:opacity-40"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-cyan/15">
            {linkCopied ? (
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.504a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.25" />
              </svg>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-white">
              {linkCopied ? 'Da copy link!' : 'Tao link chia se'}
            </p>
            <p className="text-[11px] text-slate-500">Copy link, mo tren thiet bi khac de nhan noi dung</p>
          </div>
        </button>

        {/* Download txt */}
        <button
          onClick={() => downloadAsTxt()}
          disabled={!content}
          className="glass group flex w-full items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:scale-[1.005] disabled:opacity-40"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-white">Tai file .txt</p>
            <p className="text-[11px] text-slate-500">Luu noi dung thanh file txt</p>
          </div>
        </button>

        {/* Clear */}
        {content && (
          <button
            onClick={clear}
            className="mt-2 w-full rounded-lg py-2 text-center text-xs text-slate-500 transition-colors hover:text-red-400"
          >
            Xoa noi dung
          </button>
        )}
      </div>
    </div>
  );
};
