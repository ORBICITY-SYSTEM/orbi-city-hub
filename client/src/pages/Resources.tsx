import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Cloud, Code, MessageSquare, Book, Video, FileText } from "lucide-react";

const resources = [
  {
    category: "Google Cloud",
    icon: Cloud,
    color: "text-blue-500",
    items: [
      {
        title: "Google Cloud Console",
        description: "პროექტების მართვა და API-ების გააქტიურება",
        url: "https://console.cloud.google.com",
        icon: ExternalLink
      },
      {
        title: "Vertex AI Documentation",
        description: "Gemini AI-ის ოფიციალური დოკუმენტაცია",
        url: "https://cloud.google.com/vertex-ai/docs",
        icon: Book
      },
      {
        title: "Service Accounts Guide",
        description: "სერვისის ანგარიშების კონფიგურაცია",
        url: "https://cloud.google.com/iam/docs/service-accounts",
        icon: FileText
      }
    ]
  },
  {
    category: "Google Apps Script",
    icon: Code,
    color: "text-green-500",
    items: [
      {
        title: "Apps Script Editor",
        description: "სკრიპტების შექმნა და რედაქტირება",
        url: "https://script.google.com",
        icon: ExternalLink
      },
      {
        title: "Apps Script Documentation",
        description: "სრული დოკუმენტაცია და API მითითებები",
        url: "https://developers.google.com/apps-script",
        icon: Book
      },
      {
        title: "OAuth2 Library",
        description: "OAuth2 ბიბლიოთეკა Apps Script-ისთვის",
        url: "https://github.com/googleworkspace/apps-script-oauth2",
        icon: Code
      }
    ]
  },
  {
    category: "Meta for Developers",
    icon: MessageSquare,
    color: "text-purple-500",
    items: [
      {
        title: "Meta for Developers",
        description: "WhatsApp Business API კონფიგურაცია",
        url: "https://developers.facebook.com",
        icon: ExternalLink
      },
      {
        title: "WhatsApp Business API",
        description: "WhatsApp API დოკუმენტაცია",
        url: "https://developers.facebook.com/docs/whatsapp",
        icon: Book
      },
      {
        title: "Webhook Setup Guide",
        description: "Webhook-ების კონფიგურაციის სახელმძღვანელო",
        url: "https://developers.facebook.com/docs/whatsapp/webhooks",
        icon: FileText
      }
    ]
  },
  {
    category: "სასწავლო მასალები",
    icon: Video,
    color: "text-orange-500",
    items: [
      {
        title: "Gemini AI Quickstart",
        description: "Gemini AI-ის დაწყების სახელმძღვანელო",
        url: "https://ai.google.dev/gemini-api/docs/quickstart",
        icon: Book
      },
      {
        title: "WhatsApp Cloud API Tutorial",
        description: "WhatsApp Cloud API-ის ტუტორიალი",
        url: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
        icon: Video
      },
      {
        title: "Apps Script Best Practices",
        description: "Apps Script-ის საუკეთესო პრაქტიკები",
        url: "https://developers.google.com/apps-script/guides/support/best-practices",
        icon: FileText
      }
    ]
  }
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary py-12">
      <div className="container max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            რესურსები და ბმულები
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            სასარგებლო რესურსები და დოკუმენტაცია WhatsApp ბოტის იმპლემენტაციისთვის
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((category, idx) => {
            const CategoryIcon = category.icon;
            
            return (
              <Card key={idx} className="shadow-elegant animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CategoryIcon className={`h-6 w-6 ${category.color}`} />
                    <CardTitle>{category.category}</CardTitle>
                  </div>
                  <CardDescription>
                    {category.items.length} რესურსი
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.items.map((item, itemIdx) => {
                    const ItemIcon = item.icon;
                    
                    return (
                      <div
                        key={itemIdx}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/5 transition-colors group"
                      >
                        <ItemIcon className="h-5 w-5 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {item.description}
                          </p>
                          <Button
                            asChild
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                          >
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              გახსნა <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
