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
    <Card className="bg-slate-900/85 border-white/8">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI RAG ძიება
        </CardTitle>
        <CardDescription>ვექტორული ძიება KB-ზე — სწრაფი კონტექსტი აგენტებისთვის</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            <Input
              placeholder="კითხვა — напр. “რა ღირს ტრანსფერი აეროპორტიდან?”"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  search(query);
                }
              }}
              className="h-12 rounded-2xl bg-white/5 border-white/10"
            />
            <div className="flex gap-2 flex-wrap">
              {allTags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-white/10 border-white/20 text-white/80 rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button disabled={loading} onClick={() => search(query)} className="w-full rounded-xl">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              ძიება
            </Button>
            <Separator className="bg-white/10" />
            <p className="text-xs text-white/60">
              შედეგები გამოგადგება როგორც ადამიანებს, ისე AI აგენტებს — უბრალოდ დაამატე როგორც context.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {matches.length === 0 && (
              <p className="text-sm text-muted-foreground">ჯერ შედეგი არ არის.</p>
            )}
            {matches.map((m) => (
              <Card key={`${m.articleId}-${m.chunkIndex}`} className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {m.title}
                    <Badge variant="outline" className="text-[11px] border-primary/30 bg-primary/10">
                      score {m.score.toFixed(3)}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex flex-wrap gap-2">
                    {m.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-white/10 border-white/20">
                        {tag}
                      </Badge>
                    ))}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap leading-6 text-white/90">{m.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
