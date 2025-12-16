import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Sparkles, Loader2, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const KnowledgeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (max 20MB)
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({
          title: t("შეცდომა", "Error"),
          description: t("ფაილის ზომა ძალიან დიდია (მაქს. 20MB)", "File size too large (max 20MB)"),
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setLinkUrl(''); // Clear link if file is selected
    }
  };

  const extractContent = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // Handle JSON files
    if (fileType === 'application/json' || fileName.endsWith('.json')) {
      const text = await file.text();
      const json = JSON.parse(text);
      return JSON.stringify(json, null, 2);
    }

    // Handle Excel files
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || 
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel') {
      // For Excel, we'll send it as base64 and let the backend handle it
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }

    // Handle text-based files (PDF, TXT, MD, DOC, etc.)
    return await file.text();
  };

  const handleUpload = async () => {
    if (!file && !linkUrl.trim()) {
      toast({
        title: t("შეცდომა", "Error"),
        description: t("გთხოვთ აირჩიოთ ფაილი ან შეიყვანოთ ლინკი", "Please select a file or enter a link"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisStatus(t("შინაარსი იკითხება...", "Reading content..."));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let fileContent = '';
      let fileName = '';
      let fileType = '';

      if (file) {
        // Handle file upload
        fileName = file.name;
        fileType = file.type;
        fileContent = await extractContent(file);
      } else if (linkUrl.trim()) {
        // Handle link (Google Docs, Sheets, Drive, or any URL)
        fileName = linkUrl;
        fileType = 'application/link';
        
        setAnalysisStatus(t("ლინკი მუშავდება...", "Processing link..."));
        
        // Extract content from link
        if (linkUrl.includes('docs.google.com') || 
            linkUrl.includes('sheets.google.com') || 
            linkUrl.includes('drive.google.com')) {
          fileContent = `Google Link: ${linkUrl}\n\nNote: This is a Google Drive link. Please ensure the document is publicly accessible or shared appropriately.`;
        } else {
          fileContent = `External Link: ${linkUrl}\n\nNote: Content from external links requires manual access.`;
        }
      }
      
      setAnalysisStatus(t("AI Director ანალიზს აწარმოებს...", "AI Director is analyzing..."));

      // Call analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          fileContent,
          fileName,
          fileType,
          userId: user.id,
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      toast({
        title: t("✨ წარმატება!", "✨ Success!"),
        description: t("შინაარსი წარმატებით გაანალიზდა და დაემატა", "Content analyzed and added successfully"),
      });

      setFile(null);
      setLinkUrl('');
      setAnalysisStatus('');
      
      // Trigger a refresh of the documents list
      window.location.reload();

    } catch (error) {
      console.error('Error processing content:', error);
      toast({
        title: t("შეცდომა", "Error"),
        description: error instanceof Error ? error.message : t("შინაარსის დამუშავება ვერ მოხერხდა", "Failed to process content"),
        variant: "destructive",
      });
      setAnalysisStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          {t("AI ავტომატური ანალიზი", "AI Automatic Analysis")}
        </h3>
      </div>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("ფაილი", "File")}
          </TabsTrigger>
          <TabsTrigger value="link" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            {t("ლინკი", "Link")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <div className="text-center py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">
                  {t("ატვირთეთ ფაილი", "Upload File")}
                </h4>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t(
                    "მხარდაჭერილია: PDF, Word, Excel, JSON, TXT და სხვა",
                    "Supported: PDF, Word, Excel, JSON, TXT and more"
                  )}
                </p>
              </div>

              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".txt,.md,.pdf,.doc,.docx,.json,.xlsx,.xls,.csv"
                className="max-w-md"
                disabled={isLoading}
              />

              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="link" className="space-y-4">
          <div className="text-center py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">
                  {t("შეიყვანეთ ლინკი", "Enter Link")}
                </h4>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t(
                    "Google Docs, Google Sheets, Drive ან ნებისმიერი URL",
                    "Google Docs, Google Sheets, Drive or any URL"
                  )}
                </p>
              </div>

              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  setFile(null); // Clear file if link is entered
                }}
                placeholder="https://docs.google.com/..."
                className="max-w-md"
                disabled={isLoading}
              />

              {linkUrl && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LinkIcon className="h-4 w-4" />
                  {linkUrl.substring(0, 50)}...
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {analysisStatus && (
          <div className="flex items-center justify-center gap-2 text-sm text-primary py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            {analysisStatus}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={isLoading || (!file && !linkUrl.trim())}
          className="w-full bg-gradient-ai hover:scale-[1.02] transition-transform"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {analysisStatus}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t("ავტომატური ანალიზი", "Automatic Analysis")}
            </>
          )}
        </Button>
      </Tabs>
    </Card>
  );
};
