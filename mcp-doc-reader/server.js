#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readDocx } from './docReader.js';
import { chunkText } from './utils/chunk.js';
import { searchChunks } from './utils/search.js';

const server = new McpServer({
  name: 'doc-reader',
  version: '1.0.0',
});

// Tool: Read full content of a docx file
server.tool(
  'read_doc',
  'Read full content of a .docx file and return as plain text',
  {
    file_path: z.string().describe('Absolute path to the .docx file'),
  },
  async ({ file_path }) => {
    try {
      const text = await readDocx(file_path);
      return {
        content: [{ type: 'text', text }],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error reading file: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// Tool: Ask a question about a docx file (chunk + search)
server.tool(
  'ask_doc',
  'Ask a question about a .docx file. Chunks the document and returns the most relevant sections.',
  {
    file_path: z.string().describe('Absolute path to the .docx file'),
    question: z.string().describe('Question or keywords to search for in the document'),
  },
  async ({ file_path, question }) => {
    try {
      const text = await readDocx(file_path);
      const chunks = chunkText(text);
      const results = searchChunks(chunks, question);
      return {
        content: [{ type: 'text', text: results.join('\n---\n') }],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Doc Reader MCP Server running - 2 tools registered');
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
