import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import crypto from "node:crypto";
import { validateEnv, setSecurityHeaders } from "../_utils/envGuard";

type ArticleMeta = {
  id: string;
  title: string;
  tags: string[];
  file: string;
};

type Chunk = {
  articleId: string;
  title: string;
  tags: string[];
  text: string;
  chunkIndex: number;
};

type EmbeddedChunk = {
  chunk: Chunk;
  embedding: number[];
};

const ARTICLES: ArticleMeta[] = [
  {
    id: "orbi-city-sea-view",
    title: "Orbi City Sea View – სრული აღწერა",
    tags: ["overview", "rooms", "location", "amenities"],
    file: "orbi-city-sea-view.md",
  },
  {
    id: "serviced-apartments-manifesto",
    title: "ORBI CITY: მასპინძლობის ახალი პარადიგმა (Serviced Apartments Manifesto)",
    tags: ["overview", "hospitality", "operations"],
    file: "serviced-apartments-manifesto.md",
  },
  {
    id: "checkin-protocol",
    title: "Check-in ოპერაციული პროტოკოლი",
    tags: ["check-in", "operations", "reception"],
    file: "checkin-protocol.md",
  },
  {
    id: "faq-50",
    title: "FAQ — 50 კითხვა/პასუხი",
    tags: ["faq", "guests", "policies", "support"],
    file: "faq-50.md",
  },
];

function loadArticle(meta: ArticleMeta): string {
  const kbPath = path.join(process.cwd(), "client", "src", "assets", "kb", meta.file);
  return fs.readFileSync(kbPath, "utf-8");
}

function chunkText(text: string, chunkSize = 900, overlap = 120): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if (current.length + p.length + 2 <= chunkSize) {
      current = current ? `${current}\n\n${p}` : p;
    } else {
      if (current) chunks.push(current);
      current = p;
    }
  }
  if (current) chunks.push(current);

  // add overlap by merging neighbors
  if (chunks.length > 1 && overlap > 0) {
    const overlapped: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const prevTail = i > 0 ? tail(chunks[i - 1], overlap) : "";
      overlapped.push(prevTail ? `${prevTail}\n\n${chunks[i]}` : chunks[i]);
    }
    return overlapped;
  }
  return chunks;
}

function tail(text: string, targetChars: number): string {
  if (text.length <= targetChars) return text;
  return text.slice(text.length - targetChars);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

let cachedEmbeddedChunks: EmbeddedChunk[] | null = null;
let cachedContentHash: string | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query, limit = 6, tags } = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "query is required" });
    return;
  }
  if (query.length > 2000) {
    res.status(400).json({ error: "query too long" });
    return;
  }

  // simple IP+UA rate-limit (30 req / 5 min)
  if (!rateLimitOk(req)) {
    res.status(429).json({ error: "rate limit" });
    return;
  }

  const ragApiKey = process.env.RAG_API_KEY;
  if (ragApiKey) {
    const provided = req.headers["x-rag-key"];
    if (provided !== ragApiKey) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
  }

  try {
    validateEnv(["OPENAI_API_KEY"]);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Env validation failed" });
    return;
  }

  const openaiApiKey = process.env.OPENAI_API_KEY!;

  const openai = new OpenAI({ apiKey: openaiApiKey });

  // Ensure cached embeddings (prevents per-request OpenAI calls)
  await ensureCachedEmbeddings(openai);

  const lowerTags = Array.isArray(tags) ? tags.map((t: string) => t.toLowerCase()) : null;
  const filtered = (cachedEmbeddedChunks || []).filter(({ chunk }) => {
    if (!lowerTags || lowerTags.length === 0) return true;
    const articleTags = chunk.tags.map(t => t.toLowerCase());
    return lowerTags.some(t => articleTags.includes(t));
  });

  if (filtered.length === 0) {
    res.status(200).json({ matches: [] });
    return;
  }

  const queryEmbedding = await embed(openai, query);

  const scored = filtered.map(({ chunk, embedding }) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding as number[], embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  const max = Math.min(typeof limit === "number" ? limit : 6, scored.length, 12);
  const top = scored.slice(0, max);

  res.status(200).json({
    matches: top.map(m => ({
      articleId: m.articleId,
      title: m.title,
      tags: m.tags,
      text: m.text,
      score: m.score,
      chunkIndex: m.chunkIndex,
    })),
  });
}

async function embed(openai: OpenAI, input: string | string[]): Promise<number[] | number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });
  const data = response.data.map(d => d.embedding);
  return Array.isArray(input) ? data : data[0];
}

async function ensureCachedEmbeddings(openai: OpenAI) {
  const hash = hashArticles();
  if (cachedEmbeddedChunks && cachedContentHash === hash) return;

  const chunks: Chunk[] = [];
  ARTICLES.forEach(meta => {
    const content = loadArticle(meta);
    const chunked = chunkText(content);
    chunked.forEach((text, idx) => {
      chunks.push({
        articleId: meta.id,
        title: meta.title,
        tags: meta.tags,
        text,
        chunkIndex: idx,
      });
    });
  });

  if (chunks.length === 0) {
    cachedEmbeddedChunks = [];
    cachedContentHash = hash;
    return;
  }

  const embeddings = await embed(openai, chunks.map(c => c.text)) as number[][];
  cachedEmbeddedChunks = chunks.map((chunk, idx) => ({
    chunk,
    embedding: embeddings[idx],
  }));
  cachedContentHash = hash;
}

function hashArticles(): string {
  const content = ARTICLES.map(meta => loadArticle(meta)).join("\n---\n");
  return crypto.createHash("sha256").update(content).digest("hex");
}

// naive in-memory rate limit
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 30;
const rateMap = new Map<string, { count: number; ts: number }>();

function rateLimitOk(req: VercelRequest): boolean {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const key = `${ip}:${ua}`;
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now - entry.ts > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(key, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  rateMap.set(key, entry);
  return true;
}
