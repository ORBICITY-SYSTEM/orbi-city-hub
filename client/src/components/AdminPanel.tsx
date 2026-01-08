import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2, UserCheck, Link2, Copy, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export const AdminPanel = () => {
  const navigate = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [newUserId, setNewUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "moderator" | "user">("user");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const baseUrl = window.location.origin;
  
  const roleLinks = [
    { 
      role: "Finance", 
      url: "/finances",
      fullUrl: `${baseUrl}/finances`,
      description: "ფინანსური ინტელექტი - ყველა ფინანსური მოდული",
      icon: "💰"
    },
    { 
      role: "Marketing", 
      url: "/marketing",
      fullUrl: `${baseUrl}/marketing`,
      description: "მარკეტინგის კონტროლი - კამპანიები და ანალიტიკა",
      icon: "📢"
    },
    { 
      role: "Logistics", 
      url: "/logistics",
      fullUrl: `${baseUrl}/logistics`,
      description: "ოთახები და დასუფთავება - ინვენტარის მართვა",
      icon: "📦"
    },
    { 
      role: "Customer Service", 
      url: "/customer-service",
      fullUrl: `${baseUrl}/customer-service`,
      description: "სტუმრებთან კომუნიკაცია - მხარდაჭერა",
      icon: "💬"
    },
    { 
      role: "Admin (Main Dashboard)", 
      url: "/",
      fullUrl: `${baseUrl}/`,
      description: "ადმინისტრატორის სრული Dashboard - ყველა მოდული",
      icon: "🔐"
    },
  ];

  useEffect(() => {
    checkAdminStatus();
    fetchRoles();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (data && !error) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setRoles(data);
    }
  };

  const addRole = async () => {
    if (!newUserId.trim()) {
      toast({
        title: t("შეცდომა", "Error"),
        description: t("გთხოვთ შეიყვანოთ User ID", "Please enter User ID"),
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: newUserId, role: selectedRole });

    if (error) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("წარმატება", "Success"),
        description: t("როლი წარმატებით დაემატა", "Role added successfully"),
      });
      setNewUserId("");
      fetchRoles();
    }
  };

  const deleteRole = async (roleId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", roleId);

    if (error) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("წარმატება", "Success"),
        description: t("როლი წარმატებით წაიშალა", "Role deleted successfully"),
      });
      fetchRoles();
    }
  };

  const copyToClipboard = async (fullUrl: string, role: string) => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(role);
      toast({
        title: t("დაკოპირდა", "Copied"),
        description: t(`${role} ლინკი დაკოპირდა`, `${role} link copied to clipboard`),
      });
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      toast({
        title: t("შეცდომა", "Error"),
        description: t("ლინკის კოპირება ვერ მოხერხდა", "Failed to copy link"),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          {t("იტვირთება...", "Loading...")}
        </p>
      </Card>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Role Links Section */}
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 mb-6">
          <Link2 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("როლების ლინკები", "Role Access Links")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("გაუზიარეთ ლინკები თანამშრომლებს", "Share links with team members")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {roleLinks.map((link) => (
            <Card key={link.role} className="p-4 bg-background border-border hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{link.icon}</span>
                    <h3 className="font-semibold text-foreground">{link.role}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{link.description}</p>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <code className="text-xs font-mono flex-1 truncate">{link.url}</code>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={copiedLink === link.role ? "default" : "outline"}
                  onClick={() => copyToClipboard(link.fullUrl, link.role)}
                  className="shrink-0"
                >
                  {copiedLink === link.role ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Admin Panel */}
      <Card className="p-6 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-amber-500" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("ადმინისტრატორის პანელი", "Admin Panel")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("მომხმარებლების როლების მართვა", "Manage user roles")}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/user-approval")}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {t("რეგისტრაციების დამტკიცება", "Approve Registrations")}
          </Button>
        </div>

      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="User ID"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            className="flex-1"
          />
          <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="customer_service">Customer Service</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
          </Select>
          <Button onClick={addRole}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t("დამატება", "Add")}
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("User ID", "User ID")}</TableHead>
            <TableHead>{t("როლი", "Role")}</TableHead>
            <TableHead>{t("თარიღი", "Date")}</TableHead>
            <TableHead className="text-right">{t("მოქმედება", "Action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-mono text-sm">{role.user_id}</TableCell>
              <TableCell>
                <span className="capitalize px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  {role.role}
                </span>
              </TableCell>
              <TableCell>{new Date(role.created_at).toLocaleDateString('ka-GE')}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRole(role.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Card>
    </div>
  );
};
