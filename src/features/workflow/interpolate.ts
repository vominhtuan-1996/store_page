/**
 * Resolve template references like {{nodeId.path.to.field}} from execution context.
 *
 * - If the ENTIRE value is a single `{{...}}` template → return the raw value (array, object, number…)
 * - If the template is embedded inside a larger string → stringify arrays/objects, keep primitives as-is
 */
export function interpolate(value: string, context: Record<string, unknown>): unknown {
  if (!value) return value;

  function resolve(key: string): unknown {
    const parts = key.trim().split('.');
    let cur: unknown = context;
    for (const p of parts) {
      if (cur !== null && typeof cur === 'object') {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        return undefined;
      }
    }
    return cur;
  }

  // Entire value is a single template → return raw (preserves arrays / objects)
  const single = /^\s*\{\{([^}]+)\}\}\s*$/.exec(value);
  if (single) {
    const resolved = resolve(single[1]);
    return resolved !== undefined ? resolved : value;
  }

  // Mixed string with one or more templates → stringify non-primitives
  return value.replace(/\{\{([^}]+)\}\}/g, (original, key) => {
    const resolved = resolve(key);
    if (resolved === undefined) return original;
    if (typeof resolved === 'object' && resolved !== null) return JSON.stringify(resolved);
    return String(resolved);
  });
}

/**
 * Build URLSearchParams that correctly handles array values.
 * Array → repeated keys: ?id=1&id=2
 */
export function buildQueryParams(
  paramDefs: Record<string, string>,
  context: Record<string, unknown>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [k, template] of Object.entries(paramDefs)) {
    if (!template) continue;
    const resolved = interpolate(template, context);
    if (resolved === undefined || resolved === null || resolved === '') continue;
    if (Array.isArray(resolved)) {
      resolved.forEach(item => params.append(k, String(item)));
    } else {
      params.set(k, String(resolved));
    }
  }
  return params;
}

/**
 * Build request body where each field is properly resolved.
 * Arrays / objects stay as their native type so JSON.stringify downstream is correct.
 */
export function buildBody(
  bodyDefs: Record<string, string>,
  context: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(bodyDefs).map(([k, template]) => [k, interpolate(template, context)])
  );
}
