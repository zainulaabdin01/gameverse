import { createServerFn } from "@tanstack/react-start";
import { getDB } from "../server/db";
import { type ArticleRow, articleRowToArticle } from "../server/types";

/**
 * Fetch the 100 most recent articles to populate the News Hub.
 */
export const listArticlesFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM articles ORDER BY published_at DESC LIMIT 100")
    .all<ArticleRow>();

  if (!result.results) return [];
  return result.results.map(articleRowToArticle);
});

/**
 * Fetch a single article by its slug.
 */
export const getArticleBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    const db = await getDB();
    const result = await db
      .prepare("SELECT * FROM articles WHERE slug = ?")
      .bind(data)
      .first<ArticleRow>();

    if (!result) return null;
    return articleRowToArticle(result);
  });

/**
 * Fetch the top stories, featured articles, and trending articles for the homepage.
 */
export const getNewsHomepageFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDB();

  // Trending: highest reads
  const trendingRes = await db
    .prepare("SELECT * FROM articles ORDER BY reads DESC LIMIT 5")
    .all<ArticleRow>();

  // Featured: specifically marked as featured
  const featuredRes = await db
    .prepare("SELECT * FROM articles WHERE featured = 1 ORDER BY published_at DESC LIMIT 2")
    .all<ArticleRow>();

  // Top Stories: recent non-featured
  const topStoriesRes = await db
    .prepare("SELECT * FROM articles WHERE featured = 0 ORDER BY published_at DESC LIMIT 6")
    .all<ArticleRow>();

  return {
    trending: trendingRes.results?.map(articleRowToArticle) || [],
    featured: featuredRes.results?.map(articleRowToArticle) || [],
    topStories: topStoriesRes.results?.map(articleRowToArticle) || [],
  };
});

/**
 * Fetch up to 3 related articles by category, excluding the current one.
 */
export const getRelatedArticlesFn = createServerFn({ method: "GET" })
  .inputValidator((data: { category: string; excludeSlug: string }) => data)
  .handler(async ({ data }) => {
    const db = await getDB();
    const result = await db
      .prepare(
        "SELECT * FROM articles WHERE category = ? AND slug != ? ORDER BY published_at DESC LIMIT 3"
      )
      .bind(data.category, data.excludeSlug)
      .all<ArticleRow>();

    if (!result.results) return [];
    return result.results.map(articleRowToArticle);
  });
