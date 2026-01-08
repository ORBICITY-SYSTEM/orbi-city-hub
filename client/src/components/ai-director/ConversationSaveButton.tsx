import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConversationSaveButtonProps {
  messages: Array<{ role: string; content: string }>;
  onSaved?: (conversationId: string) => void;
}

export const ConversationSaveButton = ({ messages, onSaved }: ConversationSaveButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { t } = useLanguage();

  const handleSave = async () => {
    if (messages.length < 2) {
      toast.error(t("საუბარი ძალიან მოკლეა შესანახად", "Conversation too short to save"));
      return;
    }

    setIsSaving(true);

    try {
      // Step 1: Extract tasks and analyze conversation
      console.log('Step 1: Analyzing conversation...');
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'extract-tasks-from-conversation',
        {
          body: {
            conversation: messages
          }
        }
      );

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw new Error('Failed to analyze conversation');
      }

      if (!analysisData?.success) {
        throw new Error(analysisData?.error || 'Analysis failed');
      }

      console.log('Analysis result:', analysisData.analysis);

      // Step 2: Save conversation and create tasks
      console.log('Step 2: Saving conversation...');
      const { data: saveData, error: saveError } = await supabase.functions.invoke(
        'save-conversation-to-memory',
        {
          body: {
            conversation: messages,
            analysis: analysisData.analysis,
            createTasks: true
          }
        }
      );

      if (saveError) {
        console.error('Save error:', saveError);
        throw new Error('Failed to save conversation');
      }

      if (!saveData?.success) {
        throw new Error(saveData?.error || 'Save failed');
      }

      console.log('Saved successfully:', saveData);

      setIsSaved(true);
      
      toast.success(
        t(
          `✅ საუბარი შენახულია!\n📝 შექმნილია ${saveData.tasksCreated} დავალება\n🗄️ დამატებულია GPT Memory-ში`,
          `✅ Conversation saved!\n📝 Created ${saveData.tasksCreated} tasks\n🗄️ Added to GPT Memory`
        ),
        { duration: 5000 }
      );

      if (onSaved && saveData.conversation) {
        onSaved(saveData.conversation.id);
      }

      // Reset after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);

    } catch (error) {
      console.error('Error saving conversation:', error);
      toast.error(
        t(
          "შეცდომა საუბრის შენახვისას",
          "Error saving conversation"
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaved) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle className="h-4 w-4 text-success" />
        {t("შენახულია", "Saved")}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving || messages.length < 2}
      variant="outline"
      className="gap-2"
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("ინახება...", "Saving...")}
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {t("საუბრის შენახვა", "Save Conversation")}
        </>
      )}
    </Button>
  );
};