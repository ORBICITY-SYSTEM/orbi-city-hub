import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Pencil, Warehouse, Calendar, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useModuleCustomization } from "@/hooks/useModuleCustomization";
import { ModuleEditDialog } from "./ModuleEditDialog";

export const OrbiLogistics = () => {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  
  const defaultTitle = t("ოთახები და დასუფთავება", "Rooms & Housekeeping");
  const defaultDescription = t("სტუდიოების ინვენტარის მართვა და ანალიტიკა", "Studio inventory management and analytics");
  
  const { title, description, saveCustomization } = useModuleCustomization(
    "orbi_logistics",
    defaultTitle,
    defaultDescription
  );
  
  return (
    <>
      <Card className="border-primary/20 cursor-pointer" onClick={() => setLocation("/logistics")}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-ai text-2xl">
              📦
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
              onClick={() => setLocation("/logistics")}
            >
              <Warehouse className="h-4 w-4 mr-2" />
              {t("ინვენტარი", "Inventory")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setLocation("/logistics/housekeeping")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t("დასუფთავება", "Cleaning")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setLocation("/logistics/maintenance")}
            >
              <Wrench className="h-4 w-4 mr-2" />
              {t("მომსახურება", "Maintenance")}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <ModuleEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        moduleKey="orbi_logistics"
        currentTitle={title}
        currentDescription={description}
        onSave={saveCustomization}
      />
    </>
  );
};
