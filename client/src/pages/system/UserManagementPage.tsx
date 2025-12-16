import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  User,
  Eye,
  Mail,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useRole, ROLE_DISPLAY_NAMES, ROLE_COLORS, UserRole } from "@/contexts/RoleContext";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive" | "pending";
  lastActive: Date;
  createdAt: Date;
}

// Mock team members
const MOCK_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "თამარ მახარაძე",
    email: "tamar@orbicity.ge",
    role: "admin",
    status: "active",
    lastActive: new Date(),
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "გიორგი ბერიძე",
    email: "giorgi@orbicity.ge",
    role: "manager",
    status: "active",
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date("2024-03-20"),
  },
  {
    id: "3",
    name: "ნინო კვარაცხელია",
    email: "nino@orbicity.ge",
    role: "staff",
    status: "active",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date("2024-06-10"),
  },
  {
    id: "4",
    name: "დავით ჩხეიძე",
    email: "davit@orbicity.ge",
    role: "staff",
    status: "inactive",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date("2024-08-05"),
  },
  {
    id: "5",
    name: "ანა გელაშვილი",
    email: "ana@orbicity.ge",
    role: "viewer",
    status: "pending",
    lastActive: new Date(),
    createdAt: new Date("2024-12-01"),
  },
];

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <ShieldCheck className="w-4 h-4" />,
  manager: <Shield className="w-4 h-4" />,
  staff: <User className="w-4 h-4" />,
  viewer: <Eye className="w-4 h-4" />,
};

export default function UserManagementPage() {
  const { hasPermission } = useRole();
  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "staff" as UserRole });

  if (!hasPermission("canManageUsers")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a1628]">
        <div className="text-center p-8 bg-[#1a2942] rounded-xl border border-red-500/30">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">წვდომა შეზღუდულია</h2>
          <p className="text-gray-400">მხოლოდ ადმინისტრატორს შეუძლია მომხმარებლების მართვა</p>
        </div>
      </div>
    );
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      toast.error("გთხოვთ შეავსოთ ყველა ველი");
      return;
    }
    
    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: "pending",
      lastActive: new Date(),
      createdAt: new Date(),
    };
    
    setMembers([...members, member]);
    setNewMember({ name: "", email: "", role: "staff" });
    setIsAddDialogOpen(false);
    toast.success("მომხმარებელი დამატებულია");
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    toast.success("მომხმარებელი წაშლილია");
  };

  const handleRoleChange = (id: string, newRole: UserRole) => {
    setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
    toast.success("როლი განახლებულია");
  };

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === "active").length,
    admins: members.filter(m => m.role === "admin").length,
    managers: members.filter(m => m.role === "manager").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2137] to-[#0a1628] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              ← უკან
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-10 h-10 text-blue-400" />
              მომხმარებლების მართვა
            </h1>
            <p className="text-gray-400 mt-1">გუნდის წევრები და როლები</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="w-4 h-4 mr-2" />
              დაამატე მომხმარებელი
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a2942] border-[#2a3f5f] text-white">
            <DialogHeader>
              <DialogTitle>ახალი მომხმარებელი</DialogTitle>
              <DialogDescription className="text-gray-400">
                დაამატეთ ახალი გუნდის წევრი
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">სახელი</label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="სახელი გვარი"
                  className="bg-[#0d1829] border-[#2a3f5f] text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">ელ-ფოსტა</label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="email@example.com"
                  className="bg-[#0d1829] border-[#2a3f5f] text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">როლი</label>
                <Select value={newMember.role} onValueChange={(v) => setNewMember({ ...newMember, role: v as UserRole })}>
                  <SelectTrigger className="bg-[#0d1829] border-[#2a3f5f] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2942] border-[#2a3f5f]">
                    <SelectItem value="admin" className="text-white">ადმინისტრატორი</SelectItem>
                    <SelectItem value="manager" className="text-white">მენეჯერი</SelectItem>
                    <SelectItem value="staff" className="text-white">თანამშრომელი</SelectItem>
                    <SelectItem value="viewer" className="text-white">მნახველი</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-600">
                გაუქმება
              </Button>
              <Button onClick={handleAddMember} className="bg-emerald-600 hover:bg-emerald-700">
                დამატება
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm">სულ მომხმარებლები</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm">აქტიური</p>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </div>
            <User className="w-10 h-10 text-emerald-400" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm">ადმინები</p>
              <p className="text-3xl font-bold text-white">{stats.admins}</p>
            </div>
            <ShieldCheck className="w-10 h-10 text-red-400" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">მენეჯერები</p>
              <p className="text-3xl font-bold text-white">{stats.managers}</p>
            </div>
            <Shield className="w-10 h-10 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ძებნა სახელით ან ელ-ფოსტით..."
                className="pl-10 bg-[#0d1829] border-[#2a3f5f] text-white"
              />
            </div>
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px] bg-[#0d1829] border-[#2a3f5f] text-white">
              <SelectValue placeholder="როლი" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2942] border-[#2a3f5f]">
              <SelectItem value="all" className="text-white">ყველა როლი</SelectItem>
              <SelectItem value="admin" className="text-white">ადმინისტრატორი</SelectItem>
              <SelectItem value="manager" className="text-white">მენეჯერი</SelectItem>
              <SelectItem value="staff" className="text-white">თანამშრომელი</SelectItem>
              <SelectItem value="viewer" className="text-white">მნახველი</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#1a2942]/80 border-[#2a3f5f]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a3f5f] hover:bg-transparent">
              <TableHead className="text-gray-400">მომხმარებელი</TableHead>
              <TableHead className="text-gray-400">როლი</TableHead>
              <TableHead className="text-gray-400">სტატუსი</TableHead>
              <TableHead className="text-gray-400">ბოლო აქტივობა</TableHead>
              <TableHead className="text-gray-400">დამატების თარიღი</TableHead>
              <TableHead className="text-gray-400 text-right">მოქმედებები</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id} className="border-[#2a3f5f] hover:bg-[#0d1829]/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={member.role} onValueChange={(v) => handleRoleChange(member.id, v as UserRole)}>
                    <SelectTrigger className="w-[150px] bg-transparent border-[#2a3f5f] text-white">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${ROLE_COLORS[member.role]}`} />
                        {ROLE_ICONS[member.role]}
                        <span>{ROLE_DISPLAY_NAMES[member.role]}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2942] border-[#2a3f5f]">
                      <SelectItem value="admin" className="text-white">ადმინისტრატორი</SelectItem>
                      <SelectItem value="manager" className="text-white">მენეჯერი</SelectItem>
                      <SelectItem value="staff" className="text-white">თანამშრომელი</SelectItem>
                      <SelectItem value="viewer" className="text-white">მნახველი</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge className={
                    member.status === "active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    member.status === "pending" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }>
                    {member.status === "active" ? "აქტიური" : member.status === "pending" ? "მოლოდინში" : "არააქტიური"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-400">
                  {member.lastActive.toLocaleString("ka-GE")}
                </TableCell>
                <TableCell className="text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {member.createdAt.toLocaleDateString("ka-GE")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
