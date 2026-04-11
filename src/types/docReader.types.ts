export interface DocResult {
  content: string;
  fileName: string;
  timestamp: number;
}

export interface DocSearchResult {
  question: string;
  answer: string;
  fileName: string;
  timestamp: number;
}

export interface UseDocReaderReturn {
  file: File | null;
  filePath: string;
  isReading: boolean;
  isAsking: boolean;
  docContent: string;
  searchResults: DocSearchResult[];
  error: string;
  setFile: (file: File | null) => void;
  readDocument: () => Promise<void>;
  askDocument: (question: string) => Promise<void>;
  clearResults: () => void;
}
