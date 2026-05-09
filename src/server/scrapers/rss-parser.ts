/**
 * RSS/Atom Feed Parser
 *
 * Normalizes RSS 2.0 and Atom feeds into a common RawFeedItem shape.
 * Uses fast-xml-parser for XML → JSON conversion.
 */
import { XMLParser } from "fast-xml-parser";

/** A single normalized item from any RSS/Atom feed. */
export interface RawFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author: string;
  categories: string[];
  coverUrl: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Treat text inside CDATA as plain text
  cdataPropName: "__cdata",
  // Always return arrays for these so we don't have to check single vs multi
  isArray: (name) =>
    ["item", "entry", "category", "media:content", "media:thumbnail"].includes(
      name,
    ),
});

/** Decode common HTML entities that appear in RSS titles/descriptions. */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8230;/g, "\u2026");
}

/** Strip all HTML tags from a string. */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract text from a value that might be a string, object with __cdata, or nested. */
function text(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (obj.__cdata) return String(obj.__cdata);
    if (obj["#text"]) return String(obj["#text"]);
  }
  return String(val);
}

/** Extract the first image URL from media elements or description HTML. */
function extractCover(item: Record<string, unknown>): string {
  // media:thumbnail
  const thumbs = item["media:thumbnail"] as
    | Array<Record<string, string>>
    | undefined;
  if (thumbs?.[0]?.["@_url"]) return thumbs[0]["@_url"];

  // media:content with medium="image"
  const media = item["media:content"] as
    | Array<Record<string, string>>
    | undefined;
  if (media) {
    const img = media.find((m) => m["@_medium"] === "image" || m["@_url"]);
    if (img?.["@_url"]) return img["@_url"];
  }

  // enclosure with type image
  const enc = item["enclosure"] as Record<string, string> | undefined;
  if (enc?.["@_url"] && enc["@_type"]?.startsWith("image")) {
    return enc["@_url"];
  }

  // Fallback: first <img> in description HTML
  const desc = text(item["description"] || item["summary"] || item["content"]);
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];

  return "";
}

/** Extract categories/tags from RSS or Atom items. */
function extractCategories(item: Record<string, unknown>): string[] {
  const cats = item["category"];
  if (!cats) return [];
  if (Array.isArray(cats)) {
    return cats.map((c) => {
      if (typeof c === "string") return c;
      if (typeof c === "object" && c) {
        const obj = c as Record<string, unknown>;
        return text(obj["@_term"] || obj["#text"] || obj.__cdata || "");
      }
      return String(c);
    }).filter(Boolean);
  }
  return [String(cats)];
}

/** Extract author from various RSS/Atom fields. */
function extractAuthor(item: Record<string, unknown>): string {
  // RSS <author>
  const author = text(item["author"]);
  if (author) return stripHtml(author);

  // Dublin Core <dc:creator>
  const dc = text(item["dc:creator"]);
  if (dc) return stripHtml(dc);

  // Atom <author><name>
  const atomAuthor = item["author"] as Record<string, unknown> | undefined;
  if (atomAuthor && typeof atomAuthor === "object") {
    const name = text(atomAuthor["name"]);
    if (name) return name;
  }

  return "";
}

/** Extract link, handling both RSS <link> and Atom <link href="...">. */
function extractLink(item: Record<string, unknown>): string {
  const link = item["link"];
  if (typeof link === "string") return link;
  if (Array.isArray(link)) {
    // Atom: array of link objects, find rel="alternate" or first
    const alt = link.find(
      (l: Record<string, string>) =>
        l["@_rel"] === "alternate" || !l["@_rel"],
    ) as Record<string, string> | undefined;
    if (alt?.["@_href"]) return alt["@_href"];
    if ((link[0] as Record<string, string>)?.["@_href"])
      return (link[0] as Record<string, string>)["@_href"];
  }
  if (typeof link === "object" && link) {
    return (link as Record<string, string>)["@_href"] || "";
  }
  return "";
}

/**
 * Parse an RSS or Atom XML string into normalized RawFeedItem[].
 * Returns an empty array on parse failure.
 */
export function parseFeed(xml: string): RawFeedItem[] {
  try {
    const result = parser.parse(xml);

    // RSS 2.0: rss > channel > item[]
    const rssItems =
      result?.rss?.channel?.item || result?.feed?.entry || [];

    const items: RawFeedItem[] = [];

    for (const raw of rssItems) {
      const title = decodeEntities(
        stripHtml(text(raw["title"])),
      );
      const link = extractLink(raw);
      const descRaw = text(
        raw["description"] || raw["summary"] || raw["content"] || raw["content:encoded"] || "",
      );
      const description = stripHtml(decodeEntities(descRaw));
      const pubDate =
        text(raw["pubDate"]) ||
        text(raw["published"]) ||
        text(raw["updated"]) ||
        text(raw["dc:date"]) ||
        "";
      const author = extractAuthor(raw);
      const categories = extractCategories(raw);
      const coverUrl = extractCover(raw);

      if (title && link) {
        items.push({
          title,
          link,
          description,
          pubDate,
          author,
          categories,
          coverUrl,
        });
      }
    }

    return items;
  } catch {
    console.error("[rss-parser] Failed to parse feed XML");
    return [];
  }
}
