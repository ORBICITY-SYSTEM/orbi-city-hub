import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Mail, User as UserIcon, Calendar, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

export const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </Card>
    );
  }

  if (!user) return null;

  const getInitials = () => {
    const email = user.email || "";
    return email.charAt(0).toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
          <AvatarFallback className="bg-gradient-ai text-primary-foreground text-xl font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("მომხმარებლის პროფილი", "User Profile")}
            </p>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("ID:", "ID:")}
              </span>
              <code className="text-xs bg-muted px-2 py-1 rounded text-foreground font-mono">
                {user.id}
              </code>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("რეგისტრაცია:", "Registered:")}
              </span>
              <span className="text-foreground">{formatDate(user.created_at)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("როლი:", "Role:")}
              </span>
              <span className="text-foreground capitalize">{user.role || 'user'}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
