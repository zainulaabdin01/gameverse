/**
 * Cloudflare D1 + KV access helpers.
 *
 * IMPORTANT: `env` from "cloudflare:workers" must be accessed
 * inside request handlers (server functions), not at the module
 * top level. These helper functions enforce that pattern.
 */
let envCache: any;

async function getEnv() {
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    // Local development (Node/Vite)
    if (!envCache) {
      envCache = (await import("./cloudflare-mock")).env;
    }
  } else {
    // Production (Cloudflare Pages/Workers)
    if (!envCache) {
      envCache = (await import("cloudflare:workers")).env;
    }
  }
  return envCache;
}

/** Get the D1 database binding. Call inside server functions only. */
export async function getDB(): Promise<D1Database> {
  const env = await getEnv();
  return env.DB;
}

/** Get the KV cache binding. Call inside server functions only. */
export async function getCache(): Promise<KVNamespace> {
  const env = await getEnv();
  return env.CACHE;
}
