import { useState, useCallback } from 'react';
import mammoth from 'mammoth';
import type { DocSearchResult } from '../types/docReader.types';

function chunkText(text: string, size = 500): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

function scoreChunk(text: string, query: string): number {
  const words = query.toLowerCase().split(' ');
  let s = 0;
  words.forEach((w) => {
    if (text.toLowerCase().includes(w)) s++;
  });
  return s;
}

function searchChunks(chunks: string[], query: string): string[] {
  return chunks
    .map((c) => ({ text: c, score: scoreChunk(c, query) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((c) => c.text);
}

export const useDocReader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [docContent, setDocContent] = useState('');
  const [searchResults, setSearchResults] = useState<DocSearchResult[]>([]);
  const [error, setError] = useState('');

  const extractText = useCallback(async (f: File): Promise<string> => {
    const arrayBuffer = await f.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }, []);

  const readDocument = useCallback(async () => {
    if (!file) return;
    setIsReading(true);
    setError('');
    try {
      const text = await extractText(file);
      setDocContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read document');
    } finally {
      setIsReading(false);
    }
  }, [file, extractText]);

  const askDocument = useCallback(async (question: string) => {
    if (!file || !question.trim()) return;
    setIsAsking(true);
    setError('');
    try {
      const text = docContent || await extractText(file);
      if (!docContent) setDocContent(text);

      const chunks = chunkText(text);
      const results = searchChunks(chunks, question);

      setSearchResults((prev) => [
        {
          question,
          answer: results.length > 0 ? results.join('\n---\n') : 'Khong tim thay noi dung phu hop.',
          fileName: file.name,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search document');
    } finally {
      setIsAsking(false);
    }
  }, [file, docContent, extractText]);

  const clearResults = useCallback(() => {
    setDocContent('');
    setSearchResults([]);
    setError('');
    setFile(null);
  }, []);

  return {
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
  };
};
