import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query, limit = 6, tags } = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "query is required" });
    return;
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    return;
  }

  const openai = new OpenAI({ apiKey: openaiApiKey });

  // Load and chunk KB
  const chunks: Chunk[] = [];
  ARTICLES.forEach(meta => {
    const content = loadArticle(meta);
    const chunked = chunkText(content);
    chunked.forEach((text, idx) => {
      // filter by tags if requested
      if (Array.isArray(tags) && tags.length) {
        const lowerTags = tags.map((t: string) => t.toLowerCase());
        const articleTags = meta.tags.map(t => t.toLowerCase());
        const intersects = lowerTags.some(t => articleTags.includes(t));
        if (!intersects) return;
      }
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
    res.status(200).json({ matches: [] });
    return;
  }

  const queryEmbedding = await embed(openai, query);
  const chunkEmbeddings = await embed(openai, chunks.map(c => c.text));

  const scored = chunks.map((chunk, i) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunkEmbeddings[i]),
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, Math.min(limit, scored.length));

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
