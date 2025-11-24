import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Users } from "lucide-react";
import ManusAIChat from "@/components/ManusAIChat";

export default function Reservations() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reservations</h1>
        <p className="text-slate-600">Manage bookings and guest information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Active Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">42</div>
            <p className="text-sm text-slate-600">Current reservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Check-ins Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">8</div>
            <p className="text-sm text-slate-600">Arriving guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Unread Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">15</div>
            <p className="text-sm text-slate-600">Pending responses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gmail Integration</CardTitle>
          <CardDescription>Sync booking emails automatically</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <Mail className="w-4 h-4 mr-2" />
            Sync Emails
          </Button>
        </CardContent>
      </Card>

      {/* Manus AI Assistant */}
      <ManusAIChat
        module="Reservations"
        title="📋 Reservations AI Agent"
        description="Upload booking data or ask about occupancy, guest management, pricing optimization"
        placeholder="e.g., 'Show me bookings for next week' or 'Optimize pricing for December'"
      />
    </div>
  );
}
