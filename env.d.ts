// Cloudflare Workers environment bindings
// These are available inside server functions via:
//   import { env } from "cloudflare:workers";

// Augment the Cloudflare.Env interface (declared in @cloudflare/workers-types)
// with our project-specific bindings.
declare namespace Cloudflare {
  interface Env {
    /** Cloudflare D1 database — gameverse-db */
    DB: D1Database;
    /** Cloudflare KV namespace — response cache */
    CACHE: KVNamespace;
    /** RAWG API key (set via wrangler secret) */
    RAWG_API_KEY: string;
    /** PandaScore API key (set via wrangler secret) */
    PANDASCORE_API_KEY: string;
  }
}
