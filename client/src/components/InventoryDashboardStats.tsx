import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, CheckCircle, Home, Wrench, Sparkles, Database } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function InventoryDashboardStats() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const utils = trpc.useUtils();
  
  const seedMutation = trpc.logistics.seedData.useMutation({
    onSuccess: (data) => {
      setIsSeeding(false);
      utils.logistics.dashboard.stats.invalidate();
      utils.logistics.rooms.list.invalidate();
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
  
  const handleSeed = () => {
    setIsSeeding(true);
    seedMutation.mutate();
  };
  
  const { data: stats, isLoading } = trpc.logistics.dashboard.stats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats || stats.totalRooms === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-muted-foreground">
          {t("მონაცემები არ მოიძებნა", "No data found")}
        </div>
        <Button
          onClick={handleSeed}
          disabled={isSeeding}
          className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
          size="lg"
        >
          {isSeeding ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t("მიმდინარეობს...", "Seeding...")}
            </>
          ) : (
            <>
              <Database className="h-5 w-5 mr-2" />
              {t("🌱 შეიტანე 56 ოთახი და ინვენტარი", "🌱 Seed 56 Rooms & Inventory")}
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          {t("A, C, D1, D2 კორპუსების ოთახები და სტანდარტული ინვენტარი", "Rooms from A, C, D1, D2 buildings and standard inventory")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Home className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("სულ ოთახები", "Total Rooms")}</p>
              <p className="text-2xl font-bold">{stats.totalRooms}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Sparkles className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("დასუფთავება", "Housekeeping")}</p>
              <p className="text-2xl font-bold">
                <span className="text-yellow-500">{stats.housekeeping.pending}</span>
                <span className="text-muted-foreground text-sm"> / {stats.housekeeping.total}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {t("მოლოდინში", "Pending")} / {t("სულ", "Total")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-500/20">
              <Wrench className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("ტექნიკური", "Maintenance")}</p>
              <p className="text-2xl font-bold">
                <span className="text-orange-500">{stats.maintenance.pending}</span>
                <span className="text-muted-foreground text-sm"> / {stats.maintenance.total}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {t("აქტიური", "Active")} / {t("სულ", "Total")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stats.inventory.totalMissingItems > 0 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
              {stats.inventory.totalMissingItems > 0 ? (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("დაკლებული ნივთები", "Missing Items")}</p>
              <p className="text-2xl font-bold">
                <span className={stats.inventory.totalMissingItems > 0 ? 'text-red-500' : 'text-green-500'}>
                  {stats.inventory.totalMissingItems}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.inventory.itemsWithIssues} {t("კატეგორია", "categories")}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Missing Items Details */}
      {stats.inventory.missingItems.length > 0 && (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {t("დაკლებული ნივთების დეტალები", "Missing Items Details")}
          </h3>
          <div className="space-y-4">
            {stats.inventory.missingItems.map((item, index) => (
              <div key={index} className="p-4 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.itemName}</span>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <Badge variant="destructive">
                    -{item.totalMissing} {t("ერთეული", "units")}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.roomsWithIssues.slice(0, 5).map((room, roomIndex) => (
                    <Badge key={roomIndex} variant="secondary" className="text-xs">
                      {room.roomNumber}: {room.actualQuantity}/{item.standardQuantity}
                    </Badge>
                  ))}
                  {item.roomsWithIssues.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.roomsWithIssues.length - 5} {t("სხვა", "more")}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All OK message */}
      {stats.inventory.missingItems.length === 0 && (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-green-500/20">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-green-500">
              {t("ყველა ნივთი სრულყოფილია!", "All items are complete!")}
            </h3>
            <p className="text-muted-foreground mt-2">
              {t("ინვენტარში დანაკლისი არ არის", "No missing items in inventory")}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
