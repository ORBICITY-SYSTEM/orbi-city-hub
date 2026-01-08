import { useRole, ROLE_DISPLAY_NAMES, ROLE_COLORS, UserRole } from "@/contexts/RoleContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, ShieldCheck, User, Eye } from "lucide-react";

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <ShieldCheck className="w-4 h-4" />,
  manager: <Shield className="w-4 h-4" />,
  staff: <User className="w-4 h-4" />,
  viewer: <Eye className="w-4 h-4" />,
};

export function RoleSelector() {
  const { currentRole, setCurrentRole, allRoles } = useRole();

  return (
    <Select value={currentRole} onValueChange={(value) => setCurrentRole(value as UserRole)}>
      <SelectTrigger className="w-[180px] bg-[#1a2942] border-[#2a3f5f] text-white">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${ROLE_COLORS[currentRole]}`} />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#1a2942] border-[#2a3f5f]">
        {allRoles.map((role) => (
          <SelectItem 
            key={role} 
            value={role}
            className="text-white hover:bg-[#2a3f5f] focus:bg-[#2a3f5f] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {ROLE_ICONS[role]}
              <span>{ROLE_DISPLAY_NAMES[role]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Compact version for mobile/sidebar
export function RoleBadge() {
  const { currentRole } = useRole();
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-white ${ROLE_COLORS[currentRole]}`}>
      {ROLE_ICONS[currentRole]}
      <span>{ROLE_DISPLAY_NAMES[currentRole]}</span>
    </div>
  );
}
