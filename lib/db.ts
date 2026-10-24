import { getCloudflareContext } from '@opennextjs/cloudflare';
// Imported explicitly: global Workers runtime types would override DOM types (e.g. Response.json)
import type { D1Database } from '@cloudflare/workers-types';

export type { D1Result } from '@cloudflare/workers-types';

// D1 database bound as `DB` in wrangler.jsonc
export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}
