import { useState, useEffect, useCallback } from 'react';
import type { UseClipboardSyncReturn } from '../types/clipboard.types';

const HASH_PREFIX = 'clip=';

const encodeContent = (text: string): string => {
  return btoa(unescape(encodeURIComponent(text)));
};

const decodeContent = (encoded: string): string => {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return '';
  }
};

const getContentFromHash = (): string => {
  const hash = window.location.hash.slice(1);
  if (!hash.startsWith(HASH_PREFIX)) return '';
  return decodeContent(hash.slice(HASH_PREFIX.length));
};

export const useClipboardSync = (): UseClipboardSyncReturn => {
  const [content, setContent] = useState('');
  const [hasSharedContent, setHasSharedContent] = useState(false);

  useEffect(() => {
    const shared = getContentFromHash();
    if (shared) {
      setContent(shared);
      setHasSharedContent(true);
    }
  }, []);

  const generateShareUrl = useCallback((): string => {
    const encoded = encodeContent(content);
    const base = window.location.origin + window.location.pathname;
    return `${base}#${HASH_PREFIX}${encoded}`;
  }, [content]);

  const copyToClipboard = useCallback(async (text?: string): Promise<boolean> => {
    const value = text ?? content;
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    }
  }, [content]);

  const pasteFromClipboard = useCallback(async (): Promise<string> => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setContent(text);
      return text;
    } catch {
      return '';
    }
  }, []);

  const downloadAsTxt = useCallback((filename?: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `clipboard-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content]);

  const clear = useCallback(() => {
    setContent('');
    setHasSharedContent(false);
    history.replaceState(null, '', window.location.pathname);
  }, []);

  return {
    content,
    hasSharedContent,
    setContent,
    generateShareUrl,
    copyToClipboard,
    pasteFromClipboard,
    downloadAsTxt,
    clear,
  };
};
