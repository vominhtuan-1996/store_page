import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

function extractApis(items, prefix = '') {
  const results = [];

  for (const item of items) {
    const name = item.name || '';
    const fullName = prefix ? `${prefix}/${name}` : name;

    if (Array.isArray(item.item)) {
      results.push(...extractApis(item.item, fullName));
      continue;
    }

    if (!item.request) continue;

    const req = item.request;
    const method = req.method || 'GET';
    const url = typeof req.url === 'string' ? req.url : req.url?.raw || '';
    const query = typeof req.url === 'object' ? req.url?.query || [] : [];
    const body = req.body || {};
    const bodyMode = body.mode || null;
    const bodyRaw = bodyMode === 'raw' ? body.raw || '' : null;

    let bodySchema = null;
    if (bodyRaw) {
      try {
        const parsed = JSON.parse(bodyRaw);
        bodySchema = Object.keys(parsed).reduce((acc, key) => {
          const val = parsed[key];
          acc[key] = typeof val === 'number' ? 'number'
            : typeof val === 'boolean' ? 'boolean'
            : 'string';
          return acc;
        }, {});
      } catch {
        bodySchema = null;
      }
    }

    const queryParams = query
      .filter(q => q && q.key)
      .map(q => ({
        key: q.key,
        value: q.value || '',
        description: q.description || '',
      }));

    results.push({
      toolName: slugify(fullName),
      displayName: fullName,
      description: `[${method}] ${name}`,
      method,
      url,
      queryParams,
      bodySchema,
      bodyMode,
    });
  }

  return results;
}

export function parseCollection() {
  const filePath = path.join(__dirname, 'PMS.postman.json');
  const collection = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return extractApis(collection.item || []);
}
