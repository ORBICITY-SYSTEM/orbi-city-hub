import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface ModuleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleKey: string;
  currentTitle: string;
  currentDescription: string;
  onSave: (title: string, description: string) => void;
}

export const ModuleEditDialog = ({
  open,
  onOpenChange,
  moduleKey,
  currentTitle,
  currentDescription,
  onSave,
}: ModuleEditDialogProps) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);

  const handleSave = () => {
    onSave(title, description);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("მოდულის რედაქტირება", "Edit Module")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">
              {t("სათაური", "Title")}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={currentTitle}
            />
          </div>
          <div>
            <Label htmlFor="description">
              {t("აღწერა", "Description")}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={currentDescription}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("გაუქმება", "Cancel")}
            </Button>
            <Button onClick={handleSave}>
              {t("შენახვა", "Save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
