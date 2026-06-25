const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Guard before hitting a Postgres uuid column so a bad id is a clean 4xx, not a 500. */
export function isUuid(v) {
  return typeof v === 'string' && UUID_RE.test(v);
}
