/**
 * Article Body Fetcher
 *
 * Attempts to fetch the full article text from a URL.
 * Uses basic heuristics to extract main content.
 * Falls back to the provided excerpt on failure.
 */

/** Strip HTML tags from content. */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<figure[\s\S]*?<\/figure>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Extract the main article content from HTML.
 * Tries <article>, <main>, [role="main"], then falls back to <body>.
 */
function extractMainContent(html: string): string {
  // Try to find article-like containers (order of preference)
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*role=["']main["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class=["'][^"']*article[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1] && match[1].length > 200) {
      return stripHtml(match[1]);
    }
  }

  // Last resort: strip everything
  return stripHtml(html);
}

/**
 * Fetch the article body from a URL, returning a paragraph array.
 * Returns `[excerpt]` if the fetch fails or content is too short.
 *
 * @param url - The article URL to fetch
 * @param excerpt - Fallback text if extraction fails
 * @param timeoutMs - Fetch timeout in milliseconds (default 5000)
 */
export async function fetchArticleBody(
  url: string,
  excerpt: string,
  timeoutMs = 5000,
): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Gameverse/1.0; +https://gameverse.dev)",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    clearTimeout(timer);

    if (!res.ok) {
      return [excerpt];
    }

    const html = await res.text();
    const content = extractMainContent(html);

    // Split into paragraphs on double newlines
    const paragraphs = content
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 30); // Drop very short fragments

    if (paragraphs.length < 1) {
      return [excerpt];
    }

    // Cap at 10 paragraphs to keep DB rows reasonable
    return paragraphs.slice(0, 10);
  } catch {
    // Timeout, network error, etc.
    return [excerpt];
  }
}
