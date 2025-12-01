import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "wouter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Check if user has any of the allowed roles
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error checking user roles:", error);
        toast({
          title: "შეცდომა",
          description: "როლის შემოწმება ვერ მოხერხდა",
          variant: "destructive",
        });
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      const roles = userRoles?.map((r) => r.role) || [];
      // Admin role has access to everything
      const isAdmin = roles.includes('admin');
      const hasRequiredRole = isAdmin || roles.some((role) => allowedRoles.includes(role));

      setHasAccess(hasRequiredRole);
      setIsLoading(false);

      if (!hasRequiredRole) {
        toast({
          title: "წვდომა აკრძალულია",
          description: "თქვენ არ გაქვთ ამ გვერდზე წვდომის უფლება",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in role check:", error);
      setHasAccess(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
