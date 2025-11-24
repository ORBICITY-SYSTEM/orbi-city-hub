import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, AlertTriangle } from "lucide-react";
import ManusAIChat from "@/components/ManusAIChat";

export default function Logistics() {
  const inventory = [
    { name: "Shampoo", quantity: 45, min: 20, status: "good" },
    { name: "Towels", quantity: 120, min: 80, status: "good" },
    { name: "Soap", quantity: 15, min: 25, status: "low" },
    { name: "Bed Sheets", quantity: 90, min: 60, status: "good" },
    { name: "Toilet Paper", quantity: 8, min: 30, status: "critical" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Logistics</h1>
        <p className="text-slate-600">Inventory and housekeeping management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">278</div>
            <p className="text-sm text-slate-600">In stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">2</div>
            <p className="text-sm text-slate-600">Items need reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">12</div>
            <p className="text-sm text-slate-600">Housekeeping tasks</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
          <CardDescription>Current stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 mb-1">{item.name}</div>
                  <div className="text-sm text-slate-600">
                    Minimum: {item.min} units
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{item.quantity}</div>
                    <div className="text-xs text-slate-500">units</div>
                  </div>
                  <Badge
                    variant={item.status === "critical" ? "destructive" : item.status === "low" ? "outline" : "default"}
                    className={
                      item.status === "good"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : item.status === "low"
                        ? "text-yellow-700 border-yellow-300"
                        : ""
                    }
                  >
                    {item.status === "critical" ? "Critical" : item.status === "low" ? "Low" : "Good"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manus AI Assistant */}
      <ManusAIChat
        module="Logistics"
        title="🚚 Logistics AI Agent"
        description="Upload inventory data or ask about stock management, housekeeping optimization, supply chain"
        placeholder="e.g., 'What items need reorder?' or 'Optimize housekeeping schedule'"
      />
    </div>
  );
}
