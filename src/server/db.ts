/**
 * Cloudflare D1 + KV access helpers.
 *
 * IMPORTANT: `env` from "cloudflare:workers" must be accessed
 * inside request handlers (server functions), not at the module
 * top level. These helper functions enforce that pattern.
 */
import { env } from "cloudflare:workers";

/** Get the D1 database binding. Call inside server functions only. */
export function getDB(): D1Database {
  return env.DB;
}

/** Get the KV cache binding. Call inside server functions only. */
export function getCache(): KVNamespace {
  return env.CACHE;
}
