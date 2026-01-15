import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Search, FileText, Sparkles, Filter } from "lucide-react";
import { kbArticles } from "@/utils/kbArticles";
import { KbRagPanel } from "@/components/KB/KbRagPanel";

type CategorizedArticle = (typeof kbArticles)[number] & { category: string };

const CATEGORY_ORDER = [
  "overview",
  "check-in",
  "faq",
  "rooms",
  "services",
  "payments",
  "transfers",
  "location",
  "contacts",
  "policies",
  "general",
];

const CATEGORY_LABELS: Record<string, string> = {
  overview: "Overview & Concept",
  "check-in": "Check-in Playbook",
  faq: "FAQ",
  rooms: "Rooms & Blocks",
  services: "Services & Housekeeping",
  payments: "Payments & Finance",
  transfers: "Transfers",
  location: "Location & Nearby",
  contacts: "Contacts & Channels",
  policies: "Policies & Offers",
  general: "General",
};

function deriveCategory(tags: string[]): string {
  const tagSet = new Set(tags.map(t => t.toLowerCase()));
  if (tagSet.has("check-in") || tagSet.has("reception")) return "check-in";
  if (tagSet.has("faq")) return "faq";
  if (tagSet.has("rooms") || tagSet.has("hospitality") || tagSet.has("overview")) return "overview";
  if (tagSet.has("services") || tagSet.has("operations")) return "services";
  if (tagSet.has("payments") || tagSet.has("finance") || tagSet.has("policies")) return "payments";
  if (tagSet.has("transfers")) return "transfers";
  if (tagSet.has("location")) return "location";
  if (tagSet.has("contacts") || tagSet.has("support")) return "contacts";
  return "general";
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(kbArticles[0]?.id ?? null);

  const articles: CategorizedArticle[] = useMemo(
    () =>
      kbArticles.map(article => ({
        ...article,
        category: deriveCategory(article.tags),
      })),
    []
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    kbArticles.forEach(a => a.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return articles.filter(article => {
      const matchesQuery =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query)) ||
        article.content.toLowerCase().includes(query);
      const matchesTag = !activeTag || article.tags.map(t => t.toLowerCase()).includes(activeTag.toLowerCase());
      return matchesQuery && matchesTag;
    });
  }, [articles, searchQuery, activeTag]);

  const grouped = useMemo(() => {
    const buckets: Record<string, CategorizedArticle[]> = {};
    filtered.forEach(article => {
      const category = article.category || "general";
      if (!buckets[category]) buckets[category] = [];
      buckets[category].push(article);
    });
    return buckets;
  }, [filtered]);

  const orderedCategories = CATEGORY_ORDER.filter(cat => grouped[cat]?.length).concat(
    Object.keys(grouped).filter(cat => !CATEGORY_ORDER.includes(cat))
  );

  const selectedArticle = articles.find(a => a.id === selectedId) || filtered[0] || articles[0] || null;

  return (
    <div className="space-y-8 max-w-screen-2xl mx-auto px-4 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-800 border border-white/5 px-5 py-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-info to-accent flex items-center justify-center shadow-lg ring-4 ring-primary/10">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
              <Badge variant="outline" className="ml-1 bg-primary/10 text-primary border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Live Docs
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              ყველა საჭირო ცოდნა ერთ ეკრანზე — თანამშრომლებისთვის და AI აგენტებისთვის. გრაფიკები/ციფრები არა, მხოლოდ სუფთა ტექსტი.
            </p>
          </div>
        </div>
      </div>

      {/* Search + Tag filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ძიება სათაურში, ტეგებში ან ტექსტში…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base rounded-xl bg-slate-900/70 border-white/10"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="flex items-center gap-1 bg-white/5 border-white/10 text-white/80">
            <Filter className="h-3 w-3" />
            ტეგები
          </Badge>
          <Button
            size="sm"
            variant={activeTag ? "ghost" : "default"}
            className="rounded-full"
            onClick={() => setActiveTag(null)}
          >
            All
          </Button>
          {allTags.map(tag => (
            <Button
              key={tag}
              size="sm"
              variant={activeTag?.toLowerCase() === tag.toLowerCase() ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar list */}
        <Card className="lg:col-span-1 rounded-3xl border-white/10 bg-slate-900/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              ყველა სტატია ({filtered.length || articles.length})
            </CardTitle>
            <CardDescription>გაფილტრე კატეგორიით ან ტეგით</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[70vh]">
              <div className="divide-y divide-border/50">
                {orderedCategories.map(category => (
                  <div key={category}>
                    <div className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      {CATEGORY_LABELS[category] ?? category}
                      <Badge variant="secondary" className="ml-auto">
                        {grouped[category]?.length ?? 0}
                      </Badge>
                    </div>
                    <div className="space-y-1 pb-2">
                      {grouped[category]?.map(article => (
                        <button
                          key={article.id}
                          onClick={() => setSelectedId(article.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-secondary/60 transition ${
                            selectedId === article.id ? "bg-secondary/80 border-l-2 border-primary" : ""
                          }`}
                        >
                          <div className="font-medium text-sm">{article.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {article.tags.join(", ")}
                          </div>
                        </button>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}
                {orderedCategories.length === 0 && (
                  <div className="px-4 py-6 text-center text-muted-foreground">
                    ვერ მოიძებნა შედეგები
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-2 rounded-3xl border-white/10 bg-slate-900/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedArticle?.title ?? "აირჩიე სტატია"}
            </CardTitle>
            {selectedArticle && (
              <CardDescription className="flex flex-wrap gap-2">
                {selectedArticle.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedArticle ? (
              <div className="prose prose-base md:prose-lg dark:prose-invert max-w-none leading-7">
                <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">აირჩიე სტატია სიისგან.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RAG panel for agents and staff */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/60 backdrop-blur shadow-2xl">
        <KbRagPanel />
      </div>
    </div>
  );
}
