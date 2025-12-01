import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ModuleCustomization {
  title: string;
  description: string;
}

export const useModuleCustomization = (
  moduleKey: string,
  defaultTitle: string,
  defaultDescription: string
) => {
  const [customization, setCustomization] = useState<ModuleCustomization>({
    title: defaultTitle,
    description: defaultDescription,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomization();
  }, [moduleKey]);

  const fetchCustomization = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("module_customizations")
      .select("custom_title, custom_description")
      .eq("user_id", user.id)
      .eq("module_key", moduleKey)
      .maybeSingle();

    if (error) {
      console.error("Error fetching customization:", error);
      return;
    }

    if (data) {
      setCustomization({
        title: data.custom_title || defaultTitle,
        description: data.custom_description || defaultDescription,
      });
    }
  };

  const saveCustomization = async (title: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("module_customizations")
      .upsert({
        user_id: user.id,
        module_key: moduleKey,
        custom_title: title,
        custom_description: description,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,module_key"
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save customization",
        variant: "destructive",
      });
      return;
    }

    setCustomization({ title, description });
    toast({
      title: "Success",
      description: "Module customization saved",
    });
  };

  return {
    title: customization.title,
    description: customization.description,
    saveCustomization,
  };
};
