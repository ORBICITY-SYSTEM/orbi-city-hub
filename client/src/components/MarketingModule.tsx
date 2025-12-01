import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Pencil, Star, TrendingUp, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useModuleCustomization } from "@/hooks/useModuleCustomization";
import { ModuleEditDialog } from "./ModuleEditDialog";

export const MarketingModule = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useLocation();
  
  const defaultTitle = t("მარკეტინგი", "Marketing");
  const defaultDescription = t("კამპანიების მართვა, OTA ანალიტიკა და სოციალური მედიის მონიტორინგი", "Campaign management, OTA analytics and social media monitoring");
  
  const { title, description, saveCustomization } = useModuleCustomization(
    "marketing",
    defaultTitle,
    defaultDescription
  );

  return (
    <>
      <Card className="border-primary/20 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-ai text-2xl">
              📢
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  {title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Active
                </Badge>
              </div>
              <CardDescription>
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate("/marketing")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("კამპანიები", "Campaigns")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate("/guest-communication")}
            >
              <Star className="h-4 w-4 mr-2" />
              {t("მიმოხილვები", "Reviews")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate("/marketing")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("სოციალური", "Social")}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <ModuleEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        moduleKey="marketing"
        currentTitle={title}
        currentDescription={description}
        onSave={saveCustomization}
      />
    </>
  );
};
