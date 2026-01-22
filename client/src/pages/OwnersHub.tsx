import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

export default function OwnersHub() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Owners Hub</h1>
          <DataSourceBadge type="demo" size="md" />
        </div>
        <p className="text-muted-foreground">Inventory management and payouts</p>
      </div>

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
  );
}
