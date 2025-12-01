import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Pencil, Mail, Phone, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useModuleCustomization } from "@/hooks/useModuleCustomization";
import { ModuleEditDialog } from "./ModuleEditDialog";

export const GuestCommunicationModule = () => {
  const { t } = useLanguage();
  const navigate = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  
  const defaultTitle = t("სტუმრებთან კომუნიკაცია", "Guest Communication");
  const defaultDescription = t("ერთიანი მრავალარხიანი მხარდაჭერა GPT-ით და ავტომატური პასუხებით", "Unified multi-channel support with GPT and auto-replies");
  
  const { title, description, saveCustomization } = useModuleCustomization(
    "guest_communication",
    defaultTitle,
    defaultDescription
  );

  return (
    <>
      <Card className="border-primary/20 cursor-pointer" onClick={() => navigate("/guest-communication")}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-ai text-2xl">
              💬
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
              onClick={() => navigate("/guest-communication")}
            >
              <Phone className="h-4 w-4 mr-2" />
              {t("WhatsApp", "WhatsApp")}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate("/guest-communication")}
            >
              <Mail className="h-4 w-4 mr-2" />
              {t("Email", "Email")}
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
          </div>
        </CardContent>
      </Card>
      
      <ModuleEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        moduleKey="guest_communication"
        currentTitle={title}
        currentDescription={description}
        onSave={saveCustomization}
      />
    </>
  );
};
