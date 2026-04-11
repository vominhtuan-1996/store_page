import { useState, useRef } from 'react';
import { useDocReader } from '../hooks/useDocReader';

interface DocReaderProps {
  onBack: () => void;
}

export const DocReader = ({ onBack }: DocReaderProps) => {
  const {
    file,
    isReading,
    isAsking,
    docContent,
    searchResults,
    error,
    setFile,
    readDocument,
    askDocument,
    clearResults,
  } = useDocReader();

  const [question, setQuestion] = useState('');
  const [activeTab, setActiveTab] = useState<'read' | 'ask'>('read');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.name.endsWith('.docx')) {
      setFile(dropped);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    await askDocument(question);
    setQuestion('');
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(docContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
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
          <h2 className="text-lg font-bold text-white">Doc Reader</h2>
          <p className="text-xs text-slate-500">Doc & tim kiem noi dung trong file .docx</p>
        </div>
      </div>

      {/* File upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="glass group mb-4 cursor-pointer rounded-xl border border-dashed border-white/10 px-5 py-6 text-center transition-all hover:border-primary-500/40 hover:bg-white/[0.02]"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/15">
              <svg className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearResults();
              }}
              className="ml-auto rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-red-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <svg className="mx-auto mb-2 h-8 w-8 text-slate-600 transition-colors group-hover:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-slate-400">Keo tha file .docx vao day</p>
            <p className="mt-1 text-[11px] text-slate-600">hoac bam de chon file</p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Tab switcher */}
      {file && (
        <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1">
          <button
            onClick={() => setActiveTab('read')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'read'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Doc toan bo
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'ask'
                ? 'bg-accent-cyan/20 text-accent-cyan'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Tim kiem
          </button>
        </div>
      )}

      {/* Read tab */}
      {file && activeTab === 'read' && (
        <div className="space-y-3">
          <button
            onClick={readDocument}
            disabled={isReading}
            className="glass group flex w-full items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:scale-[1.005] disabled:opacity-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/15">
              {isReading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
              ) : (
                <svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">
                {isReading ? 'Dang doc...' : 'Doc noi dung'}
              </p>
              <p className="text-[11px] text-slate-500">Trich xuat toan bo van ban tu file docx</p>
            </div>
          </button>

          {docContent && (
            <div className="glass rounded-xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">
                  Noi dung ({docContent.length} ky tu)
                </p>
                <button
                  onClick={handleCopyContent}
                  className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {copied ? (
                    <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                  )}
                  {copied ? 'Da copy!' : 'Copy'}
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-lg bg-white/5 px-3 py-2.5 text-sm leading-relaxed text-slate-300 ring-1 ring-white/10">
                <pre className="whitespace-pre-wrap font-sans">{docContent}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ask tab */}
      {file && activeTab === 'ask' && (
        <div className="space-y-3">
          <div className="glass rounded-xl p-4">
            <p className="mb-2 text-xs font-medium text-slate-400">Nhap cau hoi hoac tu khoa</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Vi du: huong dan su dung, cai dat..."
                className="flex-1 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-white/10 transition-all focus:ring-accent-cyan/50"
              />
              <button
                onClick={handleAsk}
                disabled={isAsking || !question.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-cyan/20 text-accent-cyan transition-all hover:bg-accent-cyan/30 disabled:opacity-40"
              >
                {isAsking ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Search results */}
          {searchResults.map((result, idx) => (
            <div key={result.timestamp + idx} className="glass rounded-xl p-4">
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <p className="text-xs font-semibold text-accent-cyan">{result.question}</p>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg bg-white/5 px-3 py-2.5 text-sm leading-relaxed text-slate-300 ring-1 ring-white/10">
                <pre className="whitespace-pre-wrap font-sans">{result.answer}</pre>
              </div>
            </div>
          ))}

          {searchResults.length > 0 && (
            <button
              onClick={() => clearResults()}
              className="w-full rounded-lg py-2 text-center text-xs text-slate-500 transition-colors hover:text-red-400"
            >
              Xoa ket qua
            </button>
          )}
        </div>
      )}
    </div>
  );
};
