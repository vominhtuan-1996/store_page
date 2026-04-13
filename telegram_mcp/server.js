#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import axios from 'axios';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root
config({ path: resolve(__dirname, '..', '.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const server = new McpServer({
  name: 'telegram',
  version: '1.0.0',
});

// Tool: send_telegram_notification
server.registerTool(
  'send_telegram_notification',
  {
    description: 'Send a notification message to Telegram. Use this to notify when a task is done, report errors, or send any update.',
    inputSchema: z.object({
      message: z.string().describe('Message to send. Supports Markdown: *bold*, _italic_, `code`, ```block```'),
      chat_id: z.string().optional().describe('Override TELEGRAM_CHAT_ID env. Leave empty to use default.'),
      parse_mode: z.enum(['Markdown', 'HTML', 'MarkdownV2']).optional().describe('Message format. Default: Markdown'),
    }),
  },
  async ({ message, chat_id, parse_mode = 'Markdown' }) => {
    const token = BOT_TOKEN;
    const target = chat_id || CHAT_ID;

    if (!token) {
      return {
        content: [{ type: 'text', text: 'Error: TELEGRAM_BOT_TOKEN is not set' }],
        isError: true,
      };
    }
    if (!target) {
      return {
        content: [{ type: 'text', text: 'Error: TELEGRAM_CHAT_ID is not set' }],
        isError: true,
      };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const res = await axios.post(url, {
        chat_id: target,
        text: message,
        parse_mode,
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message_id: res.data?.result?.message_id,
            chat_id: target,
            text: message,
          }, null, 2),
        }],
      };
    } catch (err) {
      const detail = err.response?.data?.description || err.message;
      return {
        content: [{ type: 'text', text: `Error: ${detail}` }],
        isError: true,
      };
    }
  }
);

// Tool: send_telegram_photo
server.registerTool(
  'send_telegram_photo',
  {
    description: 'Send a photo to Telegram via URL.',
    inputSchema: z.object({
      photo_url: z.string().describe('Public URL of the image to send'),
      caption: z.string().optional().describe('Optional caption for the photo. Supports Markdown.'),
      chat_id: z.string().optional().describe('Override TELEGRAM_CHAT_ID env.'),
    }),
  },
  async ({ photo_url, caption, chat_id }) => {
    const token = BOT_TOKEN;
    const target = chat_id || CHAT_ID;

    if (!token || !target) {
      return {
        content: [{ type: 'text', text: 'Error: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set' }],
        isError: true,
      };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendPhoto`;
      const res = await axios.post(url, {
        chat_id: target,
        photo: photo_url,
        caption: caption || '',
        parse_mode: 'Markdown',
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message_id: res.data?.result?.message_id,
            photo_url,
          }, null, 2),
        }],
      };
    } catch (err) {
      const detail = err.response?.data?.description || err.message;
      return {
        content: [{ type: 'text', text: `Error: ${detail}` }],
        isError: true,
      };
    }
  }
);

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Telegram MCP Server running - 2 tools registered');
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
