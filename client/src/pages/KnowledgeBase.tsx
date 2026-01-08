/**
 * Knowledge Base Page
 * Displays Obsidian knowledge base content
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Search, ExternalLink, FileText, Folder, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface KnowledgeItem {
  title: string;
  path: string;
  type: "file" | "folder";
  content?: string;
  lastModified?: string;
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const knowledgeBaseUrl = import.meta.env.VITE_KNOWLEDGE_BASE_URL;

  useEffect(() => {
    if (!knowledgeBaseUrl) {
      setError("Knowledge Base URL is not configured. Please set VITE_KNOWLEDGE_BASE_URL in environment variables.");
      setIsLoading(false);
      return;
    }

    // Load knowledge base content
    // For now, we'll show a placeholder structure
    // In production, this would fetch from Obsidian Publish or Supabase Storage
    loadKnowledgeBase();
  }, [knowledgeBaseUrl]);

  const loadKnowledgeBase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Fetch actual content from Obsidian Publish API or Supabase Storage
      // For now, use mock data
      const mockItems: KnowledgeItem[] = [
        {
          title: "Housekeeping Procedures",
          path: "operations/housekeeping",
          type: "file",
          content: "# Housekeeping Procedures\n\nThis is a placeholder. In production, this will load from Obsidian.",
          lastModified: new Date().toISOString(),
        },
        {
          title: "Guest Check-in Process",
          path: "operations/check-in",
          type: "file",
          content: "# Guest Check-in Process\n\nThis is a placeholder. In production, this will load from Obsidian.",
          lastModified: new Date().toISOString(),
        },
        {
          title: "Maintenance Guidelines",
          path: "operations/maintenance",
          type: "file",
          content: "# Maintenance Guidelines\n\nThis is a placeholder. In production, this will load from Obsidian.",
          lastModified: new Date().toISOString(),
        },
        {
          title: "Marketing Guidelines",
          path: "marketing/guidelines",
          type: "file",
          content: "# Marketing Guidelines\n\nThis is a placeholder. In production, this will load from Obsidian.",
          lastModified: new Date().toISOString(),
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setItems(mockItems);
    } catch (error) {
      setError(`Failed to load knowledge base: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.path.split("/")[0] || "general";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, KnowledgeItem[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-info to-accent flex items-center justify-center shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Knowledge Base
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                <FileText className="h-3 w-3 mr-1" />
                Obsidian
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Staff documentation and operational procedures
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {knowledgeBaseUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(knowledgeBaseUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Obsidian
            </Button>
          )}
          <Button
            variant="outline"
            onClick={loadKnowledgeBase}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info Card */}
      {knowledgeBaseUrl && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm">Obsidian Integration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              This knowledge base is powered by Obsidian. Content is synchronized from your Obsidian vault.
            </p>
            <p className="mt-2">
              <strong>URL:</strong> <a href={knowledgeBaseUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{knowledgeBaseUrl}</a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.keys(groupedItems).map(category => (
                    <Button
                      key={category}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        // Scroll to category
                        document.getElementById(`category-${category}`)?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                      <Badge variant="secondary" className="ml-auto">
                        {groupedItems[category].length}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} id={`category-${category}`}>
                <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
                <div className="space-y-3">
                  {categoryItems.map(item => (
                    <Card
                      key={item.path}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {item.title}
                        </CardTitle>
                        <CardDescription>{item.path}</CardDescription>
                      </CardHeader>
                      {item.content && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {item.content.split("\n")[1] || item.content.slice(0, 150)}...
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No results found" : "No items available"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Selected Item Modal/Detail */}
      {selectedItem && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedItem.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
            </div>
            <CardDescription>{selectedItem.path}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{selectedItem.content || "No content available"}</pre>
            </div>
            {selectedItem.lastModified && (
              <p className="text-xs text-muted-foreground mt-4">
                Last modified: {new Date(selectedItem.lastModified).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
