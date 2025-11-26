import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter } from "lucide-react";
import { useState } from "react";

// Mock transaction data from August 2025 reservations
const mockTransactions = [
  { id: "TRX-001", date: "2025-08-01", type: "revenue", source: "Booking.com", apartment: "A 3041", guest: "Jasinski Piotr", amount: 128.6, commission: 20, net: 108.6, status: "completed" },
  { id: "TRX-002", date: "2025-08-01", type: "revenue", source: "Expedia", apartment: "C 2641", guest: "Singh Akshay", amount: 432, commission: 60, net: 372, status: "completed" },
  { id: "TRX-003", date: "2025-08-02", type: "revenue", source: "WhatsApp", apartment: "A 3041", guest: "Pashkovski Jaba", amount: 150, commission: 30, net: 120, status: "completed" },
  { id: "TRX-004", date: "2025-08-02", type: "revenue", source: "Airbnb", apartment: "A 1833", guest: "Guvendi Ali", amount: 255, commission: 40, net: 215, status: "completed" },
  { id: "TRX-005", date: "2025-08-04", type: "expense", source: "Cleaning", apartment: "Multiple", guest: "-", amount: -200, commission: 0, net: -200, status: "paid" },
  { id: "TRX-006", date: "2025-08-05", type: "revenue", source: "Booking.com", apartment: "A 3041", guest: "ÇELİK Coşkun", amount: 351.9, commission: 60, net: 291.9, status: "completed" },
  { id: "TRX-007", date: "2025-08-07", type: "revenue", source: "Expedia", apartment: "A 2441", guest: "Alotebi Monerh", amount: 780.04, commission: 120, net: 660.04, status: "completed" },
  { id: "TRX-008", date: "2025-08-09", type: "revenue", source: "Airbnb", apartment: "A 1833", guest: "Guvendi Ali", amount: 255, commission: 40, net: 215, status: "completed" },
  { id: "TRX-009", date: "2025-08-10", type: "expense", source: "Marketing", apartment: "-", guest: "-", amount: -150, commission: 0, net: -150, status: "paid" },
  { id: "TRX-010", date: "2025-08-11", type: "revenue", source: "WhatsApp", apartment: "A 2441", guest: "Melikishvili Nini", amount: 300, commission: 60, net: 240, status: "completed" },
  { id: "TRX-011", date: "2025-08-13", type: "revenue", source: "WhatsApp", apartment: "A 3041", guest: "Bukhrishvili Elene", amount: 160, commission: 30, net: 130, status: "completed" },
  { id: "TRX-012", date: "2025-08-14", type: "revenue", source: "WhatsApp", apartment: "A 3041", guest: "Ghlonti Ekaterine", amount: 900, commission: 180, net: 720, status: "completed" },
  { id: "TRX-013", date: "2025-08-15", type: "expense", source: "Utilities", apartment: "-", guest: "-", amount: -131, commission: 0, net: -131, status: "paid" },
  { id: "TRX-014", date: "2025-08-19", type: "revenue", source: "Airbnb", apartment: "A 1833", guest: "Asgarov Maharram", amount: 230, commission: 40, net: 190, status: "completed" },
  { id: "TRX-015", date: "2025-08-21", type: "revenue", source: "WhatsApp", apartment: "A 3041", guest: "Abilaikhan Sadybek", amount: 560, commission: 80, net: 480, status: "completed" },
  { id: "TRX-016", date: "2025-08-25", type: "revenue", source: "Booking.com", apartment: "A 1833", guest: "Burtchuladze Giorgi", amount: 114.57, commission: 20, net: 94.57, status: "completed" },
  { id: "TRX-017", date: "2025-08-26", type: "revenue", source: "Booking.com", apartment: "A 2441", guest: "Kalaycı Abdulkadir", amount: 106.49, commission: 20, net: 86.49, status: "completed" },
  { id: "TRX-018", date: "2025-08-27", type: "revenue", source: "WhatsApp", apartment: "A 3041", guest: "Gubeladze Salome", amount: 800, commission: 150, net: 650, status: "completed" },
  { id: "TRX-019", date: "2025-08-28", type: "revenue", source: "Booking.com", apartment: "C 2641", guest: "Denizli Erkan", amount: 113.4, commission: 20, net: 93.4, status: "completed" },
  { id: "TRX-020", date: "2025-08-30", type: "revenue", source: "Booking.com", apartment: "A 1833", guest: "Yıldırım İsa", amount: 122.85, commission: 20, net: 102.85, status: "completed" },
  { id: "TRX-021", date: "2025-08-31", type: "expense", source: "Salary", apartment: "-", guest: "-", amount: -4000, commission: 0, net: -4000, status: "paid" },
];

export function FinanceTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const filteredTransactions = mockTransactions.filter(txn => {
    const matchesSearch = 
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.apartment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || txn.type === typeFilter;
    const matchesSource = sourceFilter === "all" || txn.source === sourceFilter;

    return matchesSearch && matchesType && matchesSource;
  });

  const totalRevenue = filteredTransactions
    .filter(t => t.type === "revenue")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCommissions = filteredTransactions
    .reduce((sum, t) => sum + t.commission, 0);

  const netTotal = filteredTransactions
    .reduce((sum, t) => sum + t.net, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">transactions</h2>
          <p className="text-sm text-gray-600">Complete record of financial operations</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">₾{totalRevenue.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">₾{totalExpenses.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Commissions</div>
          <div className="text-2xl font-bold text-orange-600">₾{totalCommissions.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Net Total</div>
          <div className="text-2xl font-bold text-purple-600">₾{netTotal.toFixed(2)}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by ID, guest, or apartment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Booking.com">Booking.com</SelectItem>
              <SelectItem value="Expedia">Expedia</SelectItem>
              <SelectItem value="Airbnb">Airbnb</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Cleaning">Cleaning</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Salary">Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Apartment</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                <TableCell>{txn.date}</TableCell>
                <TableCell>
                  <Badge variant={txn.type === "revenue" ? "default" : "destructive"}>
                    {txn.type === "revenue" ? "Revenue" : "Expense"}
                  </Badge>
                </TableCell>
                <TableCell>{txn.source}</TableCell>
                <TableCell>{txn.apartment}</TableCell>
                <TableCell>{txn.guest}</TableCell>
                <TableCell className={`text-right font-semibold ${txn.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  ₾{Math.abs(txn.amount).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">₾{txn.commission.toFixed(2)}</TableCell>
                <TableCell className={`text-right font-semibold ${txn.net > 0 ? "text-green-600" : "text-red-600"}`}>
                  ₾{txn.net.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {txn.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Footer Summary */}
      <div className="text-sm text-gray-600 text-right">
        Showing {filteredTransactions.length} of {mockTransactions.length} transactions
      </div>
    </div>
  );
}
