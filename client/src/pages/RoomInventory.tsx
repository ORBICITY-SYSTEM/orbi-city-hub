import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, Calendar, Users, Package } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function RoomInventory() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PageHeader
        title="Room Inventory"
        titleKa="ოთახების ინვენტარი"
        subtitle="Manage room inventory and availability"
        subtitleKa="ოთახების ინვენტარისა და ხელმისაწვდომობის მართვა"
        icon={Package}
        iconGradient="from-blue-500 to-indigo-600"
        dataSource={{ type: "demo" }}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-blue-500" />
              Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Room inventory will be displayed here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Availability calendar will be displayed here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Occupancy statistics will be displayed here</p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
