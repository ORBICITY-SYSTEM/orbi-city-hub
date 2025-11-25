import { useState } from "react";
import { Package, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data matching Lovable structure
const mockData = {
  totalRooms: 56,
  regularRooms: 32,
  problemRooms: 24,
  cleaning: {
    total: 28,
    completed: 27,
    inProgress: 1,
  },
  technical: {
    total: 14,
    completed: 14,
    inProgress: 0,
    totalCost: 762.65,
  },
  missingByCategory: {
    "Furniture and Textiles": [
      { name: "Chair", missing: 3 },
      { name: "Balcony Chair", missing: 12 },
      { name: "Balcony Table", missing: 4 },
      { name: "Decorative Bedspread", missing: 2 },
      { name: "Towel", missing: 1 },
      { name: "Pillow", missing: 5 },
      { name: "Pillowcase", missing: 9 },
      { name: "Mattress Cover", missing: 3 },
      { name: "Blanket", missing: 5 },
      { name: "Sheet", missing: 8 },
    ],
    "Appliances": [
      { name: "Minibar", missing: 3 },
      { name: "Refrigerator", missing: 1 },
      { name: "Washing Machine", missing: 1 },
      { name: "Microwave", missing: 2 },
      { name: "Electric Kettle", missing: 2 },
    ],
    "Small Inventory": [
      { name: "Wine Glass", missing: 10 },
      { name: "Coffee/Tea Cup", missing: 5 },
      { name: "Juice Glass", missing: 10 },
      { name: "Water Glass", missing: 10 },
      { name: "Wine Opener", missing: 7 },
      { name: "Induction Pot", missing: 1 },
      { name: "Table Spoon", missing: 3 },
      { name: "Tea Spoon", missing: 16 },
      { name: "Pot Ladle", missing: 2 },
      { name: "Cutting Knife", missing: 6 },
      { name: "Large Plate", missing: 9 },
      { name: "Medium Plate", missing: 2 },
      { name: "Cutting Board", missing: 4 },
      { name: "Grater", missing: 5 },
      { name: "Drying Rack", missing: 1 },
      { name: "Broom/Mop", missing: 1 },
      { name: "Floor Stick", missing: 3 },
    ],
    "Bathroom Accessories": [
      { name: "Wooden Basket", missing: 6 },
    ],
  },
  missingByRoom: [
    {
      room: "A 1033",
      totalMissing: 8,
      items: [
        { name: "Balcony Chair", qty: -2 },
        { name: "Pillowcase", qty: -1 },
        { name: "Blanket", qty: -1 },
        { name: "Sheet", qty: -1 },
        { name: "Wine Glass", qty: -2 },
        { name: "Water Glass", qty: -1 },
        { name: "Tea Spoon", qty: -2 },
        { name: "Large Plate", qty: -1 },
      ],
    },
    {
      room: "A 1258",
      totalMissing: 13,
      items: [
        { name: "Chair", qty: -1 },
        { name: "Decorative Bedspread", qty: -1 },
        { name: "Towel", qty: -1 },
        { name: "Pillow", qty: -2 },
        { name: "Pillowcase", qty: -2 },
        { name: "Blanket", qty: -1 },
        { name: "Sheet", qty: -2 },
        { name: "Coffee/Tea Cup", qty: -1 },
        { name: "Juice Glass", qty: -1 },
        { name: "Table Spoon", qty: -1 },
        { name: "Cutting Knife", qty: -1 },
        { name: "Large Plate", qty: -2 },
        { name: "Wooden Basket", qty: -1 },
      ],
    },
    {
      room: "A 1301",
      totalMissing: 1,
      items: [{ name: "Pillowcase", qty: -1 }],
    },
    {
      room: "A 1806",
      totalMissing: 14,
      items: [
        { name: "Pillow", qty: -1 },
        { name: "Pillowcase", qty: -1 },
        { name: "Blanket", qty: -1 },
        { name: "Sheet", qty: -2 },
        { name: "Wine Glass", qty: -2 },
        { name: "Coffee/Tea Cup", qty: -1 },
        { name: "Juice Glass", qty: -2 },
        { name: "Water Glass", qty: -2 },
        { name: "Tea Spoon", qty: -3 },
        { name: "Cutting Knife", qty: -1 },
        { name: "Large Plate", qty: -2 },
        { name: "Medium Plate", qty: -1 },
        { name: "Cutting Board", qty: -1 },
        { name: "Wooden Basket", qty: -1 },
      ],
    },
    {
      room: "A 1833",
      totalMissing: 2,
      items: [
        { name: "Minibar", qty: -1 },
        { name: "Wine Opener", qty: -1 },
      ],
    },
    {
      room: "A 2035",
      totalMissing: 12,
      items: [
        { name: "Balcony Chair", qty: -2 },
        { name: "Pillow", qty: -1 },
        { name: "Pillowcase", qty: -1 },
        { name: "Blanket", qty: -1 },
        { name: "Sheet", qty: -1 },
        { name: "Wine Glass", qty: -2 },
        { name: "Juice Glass", qty: -1 },
        { name: "Water Glass", qty: -1 },
        { name: "Tea Spoon", qty: -2 },
        { name: "Large Plate", qty: -1 },
        { name: "Grater", qty: -1 },
        { name: "Wooden Basket", qty: -1 },
      ],
    },
  ],
};

function RoomMissingItems({ room, totalMissing, items }: { room: string; totalMissing: number; items: { name: string; qty: number }[] }) {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-lg">{room}</h4>
        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">{totalMissing}</span>
      </div>
      <div className="space-y-1">
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{item.name}</span>
            <span className="text-red-600 font-medium">{item.qty}</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-blue-600"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              +{items.length - 3} More
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default function LogisticsNew() {
  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Rooms and Cleaning</h1>
            <p className="text-gray-600">Studio Inventory Management and Analytics</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="dashboard" className="data-[state=active]:ocean-gradient-green">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:ocean-gradient-blue">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="cleaning" className="data-[state=active]:ocean-gradient-orange">
            Cleaning
          </TabsTrigger>
          <TabsTrigger value="technical" className="data-[state=active]:ocean-gradient-purple">
            Technical
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:ocean-gradient-teal">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 glass-card">
              <div className="flex items-center gap-3">
                <Package className="w-10 h-10 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Rooms</p>
                  <p className="text-3xl font-bold">{mockData.totalRooms}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Regular Rooms</p>
                  <p className="text-3xl font-bold">{mockData.regularRooms}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-10 h-10 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Rooms with Problems</p>
                  <p className="text-3xl font-bold">{mockData.problemRooms}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Middle Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 glass-card">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold">Cleaning</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-bold">{mockData.cleaning.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-bold text-green-600">{mockData.cleaning.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-bold text-yellow-600">{mockData.cleaning.inProgress}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold">Technical</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-bold">{mockData.technical.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-bold text-green-600">{mockData.technical.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-bold text-yellow-600">{mockData.technical.inProgress}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="font-bold text-blue-600">{mockData.technical.totalCost} ₾</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Missing Items by Category */}
          <Card className="p-6 glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold">Missing Items by Category</h3>
            </div>

            <div className="space-y-6">
              {Object.entries(mockData.missingByCategory).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-semibold text-lg mb-3 text-yellow-700">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-sm">{item.name}</span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          Missing: {item.missing}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Missing Items by Room */}
          <Card className="p-6 glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold">Missing Items by Room</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockData.missingByRoom.map((room, idx) => (
                <RoomMissingItems key={idx} {...room} />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="p-6 glass-card">
            <p className="text-gray-600">Inventory management coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="cleaning">
          <Card className="p-6 glass-card">
            <p className="text-gray-600">Cleaning schedule coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="technical">
          <Card className="p-6 glass-card">
            <p className="text-gray-600">Technical tasks coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-6 glass-card">
            <p className="text-gray-600">Activity log coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
