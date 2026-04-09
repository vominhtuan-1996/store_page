export interface UseClipboardSyncReturn {
  /** Text content from URL or user input */
  content: string;
  /** Whether there is shared content from URL */
  hasSharedContent: boolean;
  /** Set the content */
  setContent: (text: string) => void;
  /** Generate a shareable URL with content encoded in hash */
  generateShareUrl: () => string;
  /** Copy text to device clipboard */
  copyToClipboard: (text?: string) => Promise<boolean>;
  /** Read text from device clipboard */
  pasteFromClipboard: () => Promise<string>;
  /** Download content as .txt file */
  downloadAsTxt: (filename?: string) => void;
  /** Clear content and URL hash */
  clear: () => void;
}
