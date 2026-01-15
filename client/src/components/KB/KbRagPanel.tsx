import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2 } from "lucide-react";
import { useKbRag } from "@/hooks/useKbRag";
import { kbArticles } from "@/utils/kbArticles";

export function KbRagPanel() {
  const { search, matches, loading } = useKbRag();
  const [query, setQuery] = useState("");

  const allTags = Array.from(
    new Set(kbArticles.flatMap(a => a.tags.map(tag => tag.toLowerCase())))
  ).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI RAG ძიება
        </CardTitle>
        <CardDescription>KB-ზე ვექტორული ძიება (OpenAI embeddings, ლოკალური ჩანკები)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="კითხვა — напр. “რა ღირს ტრანსფერი აეროპორტიდან?”"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              search(query);
            }
          }}
        />
        <div className="flex gap-2 flex-wrap">
          {allTags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <Button disabled={loading} onClick={() => search(query)}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          ძიება
        </Button>

        <Separator />

        <div className="space-y-3">
          {matches.length === 0 && (
            <p className="text-sm text-muted-foreground">ჯერ შედეგი არ არის.</p>
          )}
          {matches.map((m) => (
            <Card key={`${m.articleId}-${m.chunkIndex}`} className="bg-secondary/40">
              <CardHeader>
                <CardTitle className="text-sm">{m.title}</CardTitle>
                <CardDescription className="flex flex-wrap gap-2">
                  {m.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                  <Badge variant="secondary">score: {m.score.toFixed(3)}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
