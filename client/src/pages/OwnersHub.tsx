import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function OwnersHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PageHeader
        title="Owners Hub"
        titleKa="მფლობელების ჰაბი"
        subtitle="Inventory management and payouts"
        subtitleKa="ინვენტარის მართვა და გადახდები"
        icon={Users}
        iconGradient="from-emerald-500 to-green-600"
        dataSource={{ type: "demo" }}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Owners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Owner management will be displayed here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Payout information will be displayed here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Performance metrics will be displayed here</p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
