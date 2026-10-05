import { createClient } from "@supabase/supabase-js";

// 环境变量优先，回退到项目原型中的 Supabase 项目配置
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://sejfszjlpfupxosvyfid.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlamZzempscGZ1cHhvc3Z5ZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMzY5ODYsImV4cCI6MjEwNjcxMjk4Nn0.qPvQ4c6T42kBCGvY3Lt4-pW7l00BtNvGFMlCPVwy2Zw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Article {
  id: number;
  user_id: string;
  title: string;
  content: string;
  author: string;
  description: string;
  created_at: string;
}

// 列表只需要这些列，避免拉取大段 content
export interface ArticleSummary {
  id: number;
  user_id: string;
  title: string;
  author: string;
  description: string;
  created_at: string;
}

const ARTICLE_LIST_COLUMNS =
  "id, user_id, title, author, description, created_at";

export async function fetchArticles(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: ArticleSummary[]; total: number }> {
  const { limit = 20, offset = 0 } = options ?? {};
  const { data, error, count } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { data: (data ?? []) as ArticleSummary[], total: count ?? 0 };
}

export async function fetchArticleById(id: number): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Article;
}

export async function publishArticle(input: {
  user_id: string;
  title: string;
  content: string;
  author: string;
  description: string;
}): Promise<Article> {
  const { data, error } = await supabase.from("articles").insert(input).select().single();
  if (error) throw error;
  return data as Article;
}