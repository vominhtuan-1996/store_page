#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { parseCollection } from './postmanParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
config({ path: path.resolve(__dirname, '..', '.env') });

const MCP_JSON_PATH = path.resolve(__dirname, '..', '.mcp.json');

const BASE_URL = process.env.PMS_BASE_URL || 'https://apis-stag.fpt.vn';
let AUTH_TOKEN = process.env.PMS_AUTH_TOKEN || '';

function updateAuthToken(newToken) {
  AUTH_TOKEN = newToken;
  try {
    const mcpConfig = JSON.parse(fs.readFileSync(MCP_JSON_PATH, 'utf-8'));
    if (mcpConfig.mcpServers?.['pms-api']?.env) {
      mcpConfig.mcpServers['pms-api'].env.PMS_AUTH_TOKEN = newToken;
      fs.writeFileSync(MCP_JSON_PATH, JSON.stringify(mcpConfig, null, 2) + '\n');
    }
  } catch (err) {
    console.error('Failed to update .mcp.json:', err.message);
  }
}

const server = new McpServer({
  name: 'pms-api',
  version: '1.0.0',
});

function resolveUrl(rawUrl) {
  return rawUrl
    .replace(/\{\{baseUrl\}\}/g, BASE_URL)
    .replace(/^(pms\/)/, `${BASE_URL}/$1`);
}

function buildQueryString(params, values) {
  const qs = new URLSearchParams();
  for (const p of params) {
    const val = values[p.key];
    if (val !== undefined && val !== null && val !== '') {
      qs.append(p.key, String(val));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

async function callApi(apiDef, params = {}) {
  let url = resolveUrl(apiDef.url);

  if (apiDef.queryParams.length > 0) {
    url += buildQueryString(apiDef.queryParams, params);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = params._token || AUTH_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = { method: apiDef.method, headers };

  if (['POST', 'PUT', 'PATCH'].includes(apiDef.method) && apiDef.bodySchema) {
    const body = {};
    for (const key of Object.keys(apiDef.bodySchema)) {
      if (params[key] !== undefined) {
        body[key] = params[key];
      }
    }
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);
  const contentType = res.headers.get('content-type') || '';

  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return {
    status: res.status,
    url,
    data,
  };
}

// --- Register tools ---

const apis = parseCollection();

// Tool: list all available APIs
server.registerTool(
  'list_apis',
  {
    description: 'List all available PMS APIs from the Postman collection',
    inputSchema: z.object({}),
  },
  async () => {
    const list = apis.map((a, i) => `${i + 1}. [${a.method}] ${a.displayName}\n   Tool: ${a.toolName}`);
    return {
      content: [{ type: 'text', text: list.join('\n\n') }],
    };
  }
);

// Register each API as a tool
for (const api of apis) {
  const shape = {
    _token: z.string().optional().describe('Bearer token (overrides PMS_AUTH_TOKEN env)'),
  };

  // Add query params
  for (const qp of api.queryParams) {
    shape[qp.key] = z.string().optional().describe(qp.description || `Query param: ${qp.key}`);
  }

  // Add body params
  if (api.bodySchema) {
    for (const [key, type] of Object.entries(api.bodySchema)) {
      if (key in shape) continue;
      if (type === 'number') {
        shape[key] = z.number().optional().describe(`Body param: ${key}`);
      } else if (type === 'boolean') {
        shape[key] = z.boolean().optional().describe(`Body param: ${key}`);
      } else {
        shape[key] = z.string().optional().describe(`Body param: ${key}`);
      }
    }
  }

  server.registerTool(
    api.toolName,
    {
      description: `${api.description}\n\nURL: ${api.url}`,
      inputSchema: z.object(shape),
    },
    async (params) => {
      try {
        const result = await callApi(api, params);

        // Auto update token after successful login
        if (api.toolName.startsWith('login_') && result.data?.code === 0) {
          const token = result.data?.data?.token;
          if (token) {
            updateAuthToken(token);
            result.tokenUpdated = true;
          }
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (err) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${err.message}`,
          }],
          isError: true,
        };
      }
    }
  );
}

// --- Start server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`PMS MCP Server running - ${apis.length} API tools registered`);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
