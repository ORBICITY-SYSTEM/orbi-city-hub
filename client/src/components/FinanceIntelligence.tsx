import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Pencil, FileText, Upload, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useModuleCustomization } from "@/hooks/useModuleCustomization";
import { ModuleEditDialog } from "./ModuleEditDialog";

export const FinanceIntelligence = () => {
  const { t } = useLanguage();
  const navigate = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  
  const defaultTitle = t("ფინანსები", "Finance");
  const defaultDescription = t("შემოსავლების, ხარჯებისა და მოგების ანალიზი", "Revenue, expenses, and profit analysis");
  
  const { title, description, saveCustomization } = useModuleCustomization(
    "finance_intelligence",
    defaultTitle,
    defaultDescription
  );

  return (
    <>
      <Card className="border-primary/20 cursor-pointer" onClick={() => navigate("/finance")}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-ai text-2xl">
              📈
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
              onClick={() => navigate("/finance/reports")}
            >
              <FileText className="h-4 w-4 mr-2" />
              {t("ანგარიშები", "Reports")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate("/finance/monthly-analysis")}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t("ატვირთვა", "Upload")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate("/finance/analytics")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("ანალიტიკა", "Analytics")}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <ModuleEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        moduleKey="finance_intelligence"
        currentTitle={title}
        currentDescription={description}
        onSave={saveCustomization}
      />
    </>
  );
};
