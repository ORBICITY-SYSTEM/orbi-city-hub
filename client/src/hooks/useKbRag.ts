import { useState } from "react";
import { toast } from "sonner";

type KbMatch = {
  articleId: string;
  title: string;
  tags: string[];
  text: string;
  score: number;
  chunkIndex: number;
};

export function useKbRag() {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<KbMatch[]>([]);

  const search = async (query: string, tags?: string[], limit = 6) => {
    if (!query.trim()) {
      toast.error("შეიყვანე საკვანძო კითხვა");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/kb/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, tags, limit }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "KB search failed");
      }
      const data = await res.json();
      setMatches(data.matches || []);
      return data.matches as KbMatch[];
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "KB search failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, matches, search };
}
