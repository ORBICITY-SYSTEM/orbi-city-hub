import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, Database, Users, FileText, DollarSign, 
  TrendingUp, Calendar, Package, Plus, Edit, Trash2, 
  Save, X, Shield, Upload, Download 
} from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-8 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-pink-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ADMIN Panel</h1>
            <p className="text-sm text-muted-foreground">Full control over all data</p>
          </div>
        </div>
        <Badge variant="destructive" className="text-sm">
          <Shield className="h-3 w-3 mr-1" />
          ADMIN ACCESS
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700 font-medium">Bookings</div>
                <div className="text-3xl font-bold text-blue-900">2,098</div>
                <div className="text-xs text-blue-600 mt-1">in database</div>
              </div>
              <Calendar className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 font-medium">Financial Records</div>
                <div className="text-3xl font-bold text-green-900">1,547</div>
                <div className="text-xs text-green-600 mt-1">transactions</div>
              </div>
              <DollarSign className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-700 font-medium">Guests</div>
                <div className="text-3xl font-bold text-purple-900">892</div>
                <div className="text-xs text-purple-600 mt-1">in CRM</div>
              </div>
              <Users className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-700 font-medium">აFriტამენტები</div>
                <div className="text-3xl font-bold text-yellow-900">60</div>
                <div className="text-xs text-yellow-600 mt-1">studios</div>
              </div>
              <Package className="h-10 w-10 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="overview"><Settings className="h-4 w-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="reservations"><Calendar className="h-4 w-4 mr-2" />Bookings</TabsTrigger>
          <TabsTrigger value="finance"><DollarSign className="h-4 w-4 mr-2" />Finance</TabsTrigger>
          <TabsTrigger value="marketing"><TrendingUp className="h-4 w-4 mr-2" />Marketing</TabsTrigger>
          <TabsTrigger value="logistics"><Package className="h-4 w-4 mr-2" />Logistics</TabsTrigger>
          <TabsTrigger value="database"><Database className="h-4 w-4 mr-2" />Database</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>სისტემის Overview</CardTitle>
                <CardDescription>ყველა მოდულის Status და Recent Activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-green-700">CEO Dashboard</div>
                            <div className="text-lg font-bold text-green-900">Working ✅</div>
                          </div>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-green-700">Finance Module</div>
                            <div className="text-lg font-bold text-green-900">Working ✅</div>
                          </div>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-green-700">Marketing Module</div>
                            <div className="text-lg font-bold text-green-900">Working ✅</div>
                          </div>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-green-700">Logistics Module</div>
                            <div className="text-lg font-bold text-green-900">Working ✅</div>
                          </div>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Recent system changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "New booking added", module: "Reservations", time: "5 minutes ago", user: "System" },
                    { action: "Financial Data განახლდა", module: "Finance", time: "15 minutes ago", user: "Admin" },
                    { action: "Marკეტინგული კამპანია შეიქმნა", module: "Marketing", time: "1 hour ago", user: "Admin" },
                    { action: "Cleaning schedule added", module: "Logistics", time: "2 hour ago", user: "Manager" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div>
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-gray-600">{activity.module} • {activity.user}</div>
                      </div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reservations Management */}
        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reservations Management</CardTitle>
                  <CardDescription>Add, edit or delete reservations</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Booking
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add/Edit Form */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">Add New Booking</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Guest Name</Label>
                        <Input placeholder="e.g. John Smith" />
                      </div>
                      <div>
                        <Label>Room</Label>
                        <Input placeholder="e.g. A 3041" />
                      </div>
                      <div>
                        <Label>Channel</Label>
                        <Input placeholder="e.g. Booking.com" />
                      </div>
                      <div>
                        <Label>Check-in</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>Check-out</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>Price (₾)</Label>
                        <Input type="number" placeholder="450" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>guests</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: "BK-001", guest: "John Smith", room: "A 3041", dates: "26-30 Nov", channel: "Booking.com", price: 450 },
                        { id: "BK-002", guest: "Mariam Gelashvili", room: "C 2641", dates: "27 Nov - 2 Dec", channel: "Airbnb", price: 520 },
                        { id: "BK-003", guest: "David Brown", room: "D 3418", dates: "26-28 Nov", channel: "Expedia", price: 280 },
                      ].map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                          <TableCell className="font-medium">{booking.guest}</TableCell>
                          <TableCell><Badge variant="outline">{booking.room}</Badge></TableCell>
                          <TableCell className="text-sm">{booking.dates}</TableCell>
                          <TableCell className="text-sm text-gray-600">{booking.channel}</TableCell>
                          <TableCell className="font-semibold">₾{booking.price}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Management */}
        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Data Management</CardTitle>
                  <CardDescription>Add, edit or delete financial records</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Transaction
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add/Edit Form */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">Add New Transaction</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input placeholder="მაგ: Revenue" />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input placeholder="e.g. Booking.com გადახდა" />
                      </div>
                      <div>
                        <Label>Amount (₾)</Label>
                        <Input type="number" placeholder="15000" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="text-sm text-green-700">Total Revenue</div>
                      <div className="text-2xl font-bold text-green-900">₾508,180</div>
                      <div className="text-xs text-green-600">3 months</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                      <div className="text-sm text-red-700">Total ხარჯები</div>
                      <div className="text-2xl font-bold text-red-900">₾126,045</div>
                      <div className="text-xs text-red-600">3 months</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-sm text-blue-700">Net Profit</div>
                      <div className="text-2xl font-bold text-blue-900">₾382,135</div>
                      <div className="text-xs text-blue-600">75.2% margin</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Management */}
        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Marკეტინგული მონაცემების Marთვა</CardTitle>
                  <CardDescription>დაამატე, შეცვალე ან წაშალე Marკეტინგული Campaigns</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-50 border-purple-200 p-6 rounded-lg border">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-purple-400 mb-3" />
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Marკეტინგული მონაცემები</h3>
                  <p className="text-purple-700 mb-4">აქ შეგიძლია დაამატო და შეცვალო Marკეტინგული Channelsს მონაცემები</p>
                  <Button variant="outline">დაამატე Channel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logistics Management */}
        <TabsContent value="logistics">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ლოჯისტიკური მონაცემების Marთვა</CardTitle>
                  <CardDescription>Add, edit or delete cleaning schedules</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border-yellow-200 p-6 rounded-lg border">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto text-yellow-400 mb-3" />
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">ლოჯისტიკური მონაცემები</h3>
                  <p className="text-yellow-700 mb-4">აქ შეგიძლია დაამატო და შეცვალო დასუფთავების გრაფიკები და Inventory</p>
                  <Button variant="outline">Add Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Management */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>Direct database access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Database className="h-8 w-8 text-red-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-red-900">Danger Zone</div>
                        <div className="text-sm text-red-700">Direct database access - გამოიყენე ფრთხილად!</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm">Backup Database</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20">
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm">Restore Database</div>
                    </div>
                  </Button>
                </div>

                <div>
                  <Label>SQL Query</Label>
                  <Textarea 
                    placeholder="SELECT * FROM reservations WHERE ..." 
                    rows={5}
                    className="font-mono text-sm"
                  />
                  <Button className="mt-2">
                    <Database className="h-4 w-4 mr-2" />
                    Execute Query
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
