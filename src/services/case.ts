// Deep camelCase <-> snake_case conversion for the Python backend contract.
// Preserves Files, Blobs, Dates and non-plain-object instances.

const toSnake = (s: string) =>
  s.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase()).replace(/^_/, "");
const toCamel = (s: string) =>
  s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (v === null || typeof v !== "object") return false;
  if (typeof File !== "undefined" && v instanceof File) return false;
  if (typeof Blob !== "undefined" && v instanceof Blob) return false;
  if (v instanceof Date) return false;
  if (Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

export function camelToSnake<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) return input.map((v) => camelToSnake(v)) as T;
  if (!isPlainObject(input)) return input as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    out[toSnake(k)] = camelToSnake(v);
  }
  return out as T;
}

export function snakeToCamel<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) return input.map((v) => snakeToCamel(v)) as T;
  if (!isPlainObject(input)) return input as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    out[toCamel(k)] = snakeToCamel(v);
  }
  return out as T;
}
