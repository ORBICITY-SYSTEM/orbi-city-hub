import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Role definitions
export type UserRole = "admin" | "manager" | "staff" | "viewer";

export interface RolePermissions {
  canViewFinance: boolean;
  canEditFinance: boolean;
  canViewMarketing: boolean;
  canEditMarketing: boolean;
  canViewReservations: boolean;
  canEditReservations: boolean;
  canViewLogistics: boolean;
  canEditLogistics: boolean;
  canViewAIAgent: boolean;
  canApproveAITasks: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canManageUsers: boolean;
  canViewActivityLog: boolean;
  canExportData: boolean;
}

// Role permission mappings
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewFinance: true,
    canEditFinance: true,
    canViewMarketing: true,
    canEditMarketing: true,
    canViewReservations: true,
    canEditReservations: true,
    canViewLogistics: true,
    canEditLogistics: true,
    canViewAIAgent: true,
    canApproveAITasks: true,
    canViewSettings: true,
    canEditSettings: true,
    canManageUsers: true,
    canViewActivityLog: true,
    canExportData: true,
  },
  manager: {
    canViewFinance: true,
    canEditFinance: true,
    canViewMarketing: true,
    canEditMarketing: true,
    canViewReservations: true,
    canEditReservations: true,
    canViewLogistics: true,
    canEditLogistics: true,
    canViewAIAgent: true,
    canApproveAITasks: true,
    canViewSettings: true,
    canEditSettings: false,
    canManageUsers: false,
    canViewActivityLog: true,
    canExportData: true,
  },
  staff: {
    canViewFinance: false,
    canEditFinance: false,
    canViewMarketing: true,
    canEditMarketing: false,
    canViewReservations: true,
    canEditReservations: true,
    canViewLogistics: true,
    canEditLogistics: true,
    canViewAIAgent: true,
    canApproveAITasks: false,
    canViewSettings: false,
    canEditSettings: false,
    canManageUsers: false,
    canViewActivityLog: false,
    canExportData: false,
  },
  viewer: {
    canViewFinance: true,
    canEditFinance: false,
    canViewMarketing: true,
    canEditMarketing: false,
    canViewReservations: true,
    canEditReservations: false,
    canViewLogistics: true,
    canEditLogistics: false,
    canViewAIAgent: false,
    canApproveAITasks: false,
    canViewSettings: false,
    canEditSettings: false,
    canManageUsers: false,
    canViewActivityLog: false,
    canExportData: false,
  },
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "ადმინისტრატორი",
  manager: "მენეჯერი",
  staff: "თანამშრომელი",
  viewer: "მნახველი",
};

// Role colors
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-500",
  manager: "bg-blue-500",
  staff: "bg-emerald-500",
  viewer: "bg-gray-500",
};

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  permissions: RolePermissions;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  allRoles: UserRole[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  // Default to admin for demo purposes - in production this would come from auth
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [permissions, setPermissions] = useState<RolePermissions>(ROLE_PERMISSIONS.admin);

  useEffect(() => {
    setPermissions(ROLE_PERMISSIONS[currentRole]);
  }, [currentRole]);

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };

  const allRoles: UserRole[] = ["admin", "manager", "staff", "viewer"];

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, permissions, hasPermission, allRoles }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

// Higher-order component for role-based access
export function withRoleAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: keyof RolePermissions
) {
  return function WithRoleAccessComponent(props: P) {
    const { hasPermission } = useRole();
    
    if (!hasPermission(requiredPermission)) {
      return (
        <div className="flex items-center justify-center min-h-[400px] bg-[#0a1628]">
          <div className="text-center p-8 bg-[#1a2942] rounded-xl border border-red-500/30">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-white mb-2">წვდომა შეზღუდულია</h2>
            <p className="text-gray-400">თქვენ არ გაქვთ ამ გვერდის ნახვის უფლება</p>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}
