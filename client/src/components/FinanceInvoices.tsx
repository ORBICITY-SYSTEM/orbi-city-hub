import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Send, FileText } from "lucide-react";
import { useState } from "react";

// Mock invoice data from August 2025 owner reports
const mockInvoices = [
  { id: "INV-2025-08-001", date: "2025-08-31", owner: "Aleksandre Makharashvili", apartment: "A 3041", revenue: 4595.5, commission: 800, expenses: 200, netPayable: 3595.5, status: "paid", paidDate: "2025-09-05" },
  { id: "INV-2025-08-002", date: "2025-08-31", owner: "Archil Pirosmanashvili", apartment: "C 2641", revenue: 3854.69, commission: 650, expenses: 180, netPayable: 3024.69, status: "paid", paidDate: "2025-09-05" },
  { id: "INV-2025-08-003", date: "2025-08-31", owner: "Bachuki Tsikarishvili", apartment: "A 2441", revenue: 4040.81, commission: 700, expenses: 190, netPayable: 3150.81, status: "paid", paidDate: "2025-09-06" },
  { id: "INV-2025-08-004", date: "2025-08-31", owner: "Bela Jincharadze", apartment: "A 1833", revenue: 4267.34, commission: 750, expenses: 200, netPayable: 3317.34, status: "paid", paidDate: "2025-09-06" },
  { id: "INV-2025-08-005", date: "2025-08-31", owner: "Gulnazi Erkomaishvili", apartment: "C 2547", revenue: 3946, commission: 680, expenses: 175, netPayable: 3091, status: "paid", paidDate: "2025-09-07" },
  { id: "INV-2025-08-006", date: "2025-08-31", owner: "Davit Pirosmanashvili", apartment: "C 4706", revenue: 4720.36, commission: 820, expenses: 210, netPayable: 3690.36, status: "paid", paidDate: "2025-09-07" },
  { id: "INV-2025-08-007", date: "2025-08-31", owner: "Davit Pirosmanashvili", apartment: "A 4027", revenue: 4327.77, commission: 750, expenses: 195, netPayable: 3382.77, status: "paid", paidDate: "2025-09-07" },
  { id: "INV-2025-08-008", date: "2025-08-31", owner: "Davit Pirosmanashvili", apartment: "A 4029", revenue: 4485.05, commission: 780, expenses: 200, netPayable: 3505.05, status: "paid", paidDate: "2025-09-07" },
  { id: "INV-2025-08-009", date: "2025-08-31", owner: "Tatia Khutsishvili/Temo", apartment: "D 3418", revenue: 3575.05, commission: 620, expenses: 165, netPayable: 2790.05, status: "pending", paidDate: null },
  { id: "INV-2025-08-010", date: "2025-08-31", owner: "Tatia Khutsishvili/Temo", apartment: "D 3414", revenue: 3579.05, commission: 620, expenses: 165, netPayable: 2794.05, status: "pending", paidDate: null },
  { id: "INV-2025-08-011", date: "2025-08-31", owner: "Tatia Khutsishvili/Temo", apartment: "D 3416", revenue: 4294.25, commission: 745, expenses: 190, netPayable: 3359.25, status: "pending", paidDate: null },
  { id: "INV-2025-08-012", date: "2025-08-31", owner: "Tinatin Javakhidze", apartment: "C 2847", revenue: 4107.03, commission: 710, expenses: 185, netPayable: 3212.03, status: "sent", paidDate: null },
  { id: "INV-2025-08-013", date: "2025-08-31", owner: "Ia Maisaia", apartment: "C 1256", revenue: 3470, commission: 600, expenses: 160, netPayable: 2710, status: "sent", paidDate: null },
  { id: "INV-2025-08-014", date: "2025-08-31", owner: "Irakli Khubutia", apartment: "C 2524", revenue: 3623.47, commission: 630, expenses: 170, netPayable: 2823.47, status: "sent", paidDate: null },
  { id: "INV-2025-08-015", date: "2025-08-31", owner: "Leonidas Paratidis", apartment: "C 2961", revenue: 5123.86, commission: 890, expenses: 225, netPayable: 4008.86, status: "draft", paidDate: null },
  { id: "INV-2025-08-016", date: "2025-08-31", owner: "Misho Janibegashvili", apartment: "C 2861", revenue: 4196.49, commission: 730, expenses: 190, netPayable: 3276.49, status: "draft", paidDate: null },
  { id: "INV-2025-08-017", date: "2025-08-31", owner: "Mose Toidze", apartment: "C 2520", revenue: 3165.2, commission: 550, expenses: 150, netPayable: 2465.2, status: "draft", paidDate: null },
  { id: "INV-2025-08-018", date: "2025-08-31", owner: "Nika Gogoladze/Kapanadze", apartment: "C 3428", revenue: 4262.82, commission: 740, expenses: 195, netPayable: 3327.82, status: "draft", paidDate: null },
  { id: "INV-2025-08-019", date: "2025-08-31", owner: "Nini/Nika Kalandadze", apartment: "C 2921", revenue: 4840.09, commission: 840, expenses: 215, netPayable: 3785.09, status: "draft", paidDate: null },
  { id: "INV-2025-08-020", date: "2025-08-31", owner: "Nino Makharashvili", apartment: "A 3035", revenue: 4191, commission: 730, expenses: 190, netPayable: 3271, status: "draft", paidDate: null },
];

export function FinanceInvoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInvoices = mockInvoices.filter(inv => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.apartment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.revenue, 0);
  const totalCommission = filteredInvoices.reduce((sum, inv) => sum + inv.commission, 0);
  const totalExpenses = filteredInvoices.reduce((sum, inv) => sum + inv.expenses, 0);
  const totalPayable = filteredInvoices.reduce((sum, inv) => sum + inv.netPayable, 0);

  const statusCounts = {
    paid: mockInvoices.filter(i => i.status === "paid").length,
    sent: mockInvoices.filter(i => i.status === "sent").length,
    pending: mockInvoices.filter(i => i.status === "pending").length,
    draft: mockInvoices.filter(i => i.status === "draft").length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      paid: { variant: "default", label: "Paid" },
      sent: { variant: "secondary", label: "Sent" },
      pending: { variant: "outline", label: "Pending" },
      draft: { variant: "destructive", label: "Draft" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="text-sm text-gray-600">მესაკუთრეთა Settlements - Augისტო 2025</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">₾{totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{filteredInvoices.length} invoices</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Commission</div>
          <div className="text-2xl font-bold text-orange-600">₾{totalCommission.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{((totalCommission / totalRevenue) * 100).toFixed(1)}% of revenue</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">₾{totalExpenses.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Cleaning & utilities</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Net Payable</div>
          <div className="text-2xl font-bold text-purple-600">₾{totalPayable.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">To owners</div>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-sm text-green-700 font-medium">Paid</div>
          <div className="text-3xl font-bold text-green-900">{statusCounts.paid}</div>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-sm text-blue-700 font-medium">Sent</div>
          <div className="text-3xl font-bold text-blue-900">{statusCounts.sent}</div>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-sm text-yellow-700 font-medium">Pending</div>
          <div className="text-3xl font-bold text-yellow-900">{statusCounts.pending}</div>
        </Card>
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="text-sm text-gray-700 font-medium">Draft</div>
          <div className="text-3xl font-bold text-gray-900">{statusCounts.draft}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by invoice ID, owner, or apartment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Apartment</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Net Payable</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-sm font-medium">{inv.id}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell className="font-medium">{inv.owner}</TableCell>
                <TableCell>{inv.apartment}</TableCell>
                <TableCell className="text-right text-green-600 font-semibold">₾{inv.revenue.toFixed(2)}</TableCell>
                <TableCell className="text-right text-orange-600">₾{inv.commission.toFixed(2)}</TableCell>
                <TableCell className="text-right text-red-600">₾{inv.expenses.toFixed(2)}</TableCell>
                <TableCell className="text-right text-purple-600 font-bold">₾{inv.netPayable.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(inv.status)}</TableCell>
                <TableCell>{inv.paidDate || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {inv.status !== "paid" && (
                      <Button size="sm" variant="ghost">
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Footer Summary */}
      <div className="text-sm text-gray-600 text-right">
        Showing {filteredInvoices.length} of {mockInvoices.length} invoices
      </div>
    </div>
  );
}
