import type { ApiDefinition } from '../types/api';

interface PostmanItem {
  name: string;
  item?: PostmanItem[];
  request?: {
    method: string;
    url: string | { raw: string; query?: { key: string; value?: string; description?: string }[] };
    body?: { mode?: string; raw?: string };
  };
}

function slugify(str: string): string {
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

function extractApis(items: PostmanItem[], prefix = '', folder = ''): ApiDefinition[] {
  const results: ApiDefinition[] = [];

  for (const item of items) {
    const name = item.name || '';
    const fullName = prefix ? `${prefix}/${name}` : name;
    const currentFolder = folder || name;

    if (Array.isArray(item.item)) {
      results.push(...extractApis(item.item, fullName, currentFolder));
      continue;
    }

    if (!item.request) continue;

    const req = item.request;
    const method = req.method || 'GET';
    const url = typeof req.url === 'string' ? req.url : req.url?.raw || '';
    const query = typeof req.url === 'object' ? req.url?.query || [] : [];
    const body = req.body || {};
    const bodyRaw = body.mode === 'raw' ? body.raw || '' : null;

    let bodySchema: Record<string, string> | null = null;
    if (bodyRaw) {
      try {
        const parsed = JSON.parse(bodyRaw);
        bodySchema = Object.keys(parsed).reduce<Record<string, string>>((acc, key) => {
          const val = parsed[key];
          acc[key] = typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : 'string';
          return acc;
        }, {});
      } catch {
        bodySchema = null;
      }
    }

    const queryParams = query
      .filter((q) => q && q.key)
      .map((q) => ({
        key: q.key,
        value: q.value || '',
        description: q.description || '',
      }));

    results.push({
      toolName: slugify(fullName),
      displayName: name,
      description: `[${method}] ${name}`,
      method,
      url,
      folder: currentFolder,
      queryParams,
      bodySchema,
    });
  }

  return results;
}

export function parsePostmanCollection(collection: { item: PostmanItem[] }): ApiDefinition[] {
  return extractApis(collection.item || []);
}
