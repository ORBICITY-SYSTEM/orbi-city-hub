import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Database, CheckCircle, AlertCircle, Package, Home, Boxes } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SeedLogistics() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Get current status
  const statusQuery = trpc.seedLogistics.status.useQuery();

  // Seed all mutation
  const seedAllMutation = trpc.logistics.seedData.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setIsSeeding(false);
      statusQuery.refetch();
      toast({
        title: "✅ Seed წარმატებით დასრულდა!",
        description: `${data.roomsInserted} ოთახი, ${data.itemsInserted} ინვენტარი`,
      });
    },
    onError: (error) => {
      setIsSeeding(false);
      toast({
        title: "❌ შეცდომა",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSeedAll = () => {
    setIsSeeding(true);
    setResult(null);
    seedAllMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            🌱 Logistics Data Seed
          </h1>
          <p className="text-white/70">
            ოთახებისა და ინვენტარის მონაცემების შეტანა Hub-ის database-ში
          </p>
        </div>

        {/* Current Status */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-400" />
              მიმდინარე სტატუსი
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusQuery.isLoading ? (
              <div className="flex items-center gap-2 text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                იტვირთება...
              </div>
            ) : statusQuery.error ? (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                {statusQuery.error.message}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-white/70 mb-2">
                    <Home className="h-4 w-4" />
                    ოთახები
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {statusQuery.data?.roomsInDb || 0}
                    <span className="text-sm text-white/50 ml-2">
                      / {statusQuery.data?.roomsToSeed || 0} seed-ში
                    </span>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-white/70 mb-2">
                    <Boxes className="h-4 w-4" />
                    სტანდარტული ინვენტარი
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {statusQuery.data?.standardItemsInDb || 0}
                    <span className="text-sm text-white/50 ml-2">
                      / {statusQuery.data?.itemsToSeed || 0} seed-ში
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seed Action */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-green-400" />
              Seed მონაცემები
            </CardTitle>
            <CardDescription className="text-white/60">
              56 ოთახი (A, C, D1, D2 კორპუსები) და 16 სტანდარტული ინვენტარი
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSeedAll}
              disabled={isSeeding}
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
              size="lg"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  მიმდინარეობს...
                </>
              ) : (
                <>
                  <Database className="h-5 w-5 mr-2" />
                  🚀 გაუშვი Seed All
                </>
              )}
            </Button>

            {/* Result */}
            {result && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-green-400 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">წარმატებით დასრულდა!</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {result.roomsInserted}
                    </div>
                    <div className="text-white/60">ოთახი</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {result.itemsInserted}
                    </div>
                    <div className="text-white/60">ინვენტარი</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-white/60 space-y-2">
              <p>📍 <strong>წყარო:</strong> orbi-ai-nexus (Supabase) → LOGISTICS_DATA_EXPORT.json</p>
              <p>📍 <strong>დანიშნულება:</strong> orbi-city-hub (TiDB/MySQL)</p>
              <p>📍 <strong>ოპერაცია:</strong> Upsert (არსებულს განაახლებს, ახალს დაამატებს)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
