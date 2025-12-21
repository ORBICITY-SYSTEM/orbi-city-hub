import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const codeExamples = {
  doPost: {
    title: "doPost ფუნქცია",
    description: "შემოსული WhatsApp შეტყობინებების დამუშავება",
    code: `function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    
    // WhatsApp webhook verification
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;
      
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const from = message.from;
        const text = message.text.body;
        
        // Call Gemini AI
        const response = callGemini(text, from);
        
        // Send response back to WhatsApp
        sendWhatsApp(from, response);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`
  },
  callGemini: {
    title: "callGemini ფუნქცია",
    description: "Vertex AI Gemini-სთან კომუნიკაცია",
    code: `function callGemini(message, senderId) {
  const PROJECT_ID = 'orbi-city-whatsapp-bot';
  const LOCATION = 'us-central1';
  const MODEL = 'gemini-2.0-flash-exp';
  
  // System prompt for Orbi City
  const systemPrompt = \`
თქვენ ხართ "ორბი სითის" აპარტჰოტელის ვირტუალური ასისტენტი.

ინფორმაცია სასტუმროს შესახებ:
- მდებარეობა: ბათუმის ცენტრში, ზღვიდან 50 მეტრში
- ხედი: ცეკვის ფონტანებზე და ზღვაზე
- ნომრები: სტუდიო აპარტამენტები აივნით და სამზარეულოთი
- სერვისები: 24/7 რეცეფცია, უფასო პარკირება, აუზი, სპა, რესტორანი

კომუნიკაციის სტილი:
- პროფესიონალური და მეგობრული
- ზუსტი და დეტალური პასუხები
- ქართულ და ინგლისურ ენებზე კომუნიკაცია

შეზღუდვები:
- არ გასცეთ პასუხი კონკურენტების შესახებ
- არ დაპირდეთ რაიმეს, რაც არ არის დადასტურებული
- გადაამისამართეთ რთული კითხვები რეალურ ოპერატორთან
\`;

  const url = \`https://\${LOCATION}-aiplatform.googleapis.com/v1/projects/\${PROJECT_ID}/locations/\${LOCATION}/publishers/google/models/\${MODEL}:generateContent\`;
  
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: systemPrompt + "\n\nმომხმარებლის შეკითხვა: " + message }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + getAccessToken()
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  
  if (result.candidates && result.candidates.length > 0) {
    return result.candidates[0].content.parts[0].text;
  }
  
  return "ბოდიში, ამჟამად ვერ ვპასუხობ. გთხოვთ დაუკავშირდეთ ჩვენს ოპერატორს.";
}

function getAccessToken() {
  // Load service account key from Script Properties
  const serviceAccountKey = JSON.parse(
    PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT_KEY')
  );
  
  const service = OAuth2.createService('vertex-ai')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(serviceAccountKey.private_key)
    .setIssuer(serviceAccountKey.client_email)
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setScope('https://www.googleapis.com/auth/cloud-platform');
    
  return service.getAccessToken();
}`
  },
  sendWhatsApp: {
    title: "sendWhatsApp ფუნქცია",
    description: "პასუხის გაგზავნა WhatsApp-ში",
    code: `function sendWhatsApp(recipientId, message) {
  const PHONE_NUMBER_ID = PropertiesService.getScriptProperties()
    .getProperty('WHATSAPP_PHONE_NUMBER_ID');
  const ACCESS_TOKEN = PropertiesService.getScriptProperties()
    .getProperty('WHATSAPP_ACCESS_TOKEN');
  
  const url = \`https://graph.facebook.com/v18.0/\${PHONE_NUMBER_ID}/messages\`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: recipientId,
    type: 'text',
    text: {
      body: message
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + ACCESS_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      Logger.log('Message sent successfully: ' + result.messages[0].id);
      return true;
    } else {
      Logger.log('Error sending message: ' + result.error.message);
      return false;
    }
  } catch (error) {
    Logger.log('Exception in sendWhatsApp: ' + error);
    return false;
  }
}`
  },
  webhook: {
    title: "Webhook ვერიფიკაცია",
    description: "Meta Webhook-ის ვერიფიკაციის ფუნქცია",
    code: `function doGet(e) {
  // Webhook verification
  const VERIFY_TOKEN = PropertiesService.getScriptProperties()
    .getProperty('WEBHOOK_VERIFY_TOKEN');
  
  const mode = e.parameter['hub.mode'];
  const token = e.parameter['hub.verify_token'];
  const challenge = e.parameter['hub.challenge'];
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    Logger.log('Webhook verified successfully');
    return ContentService.createTextOutput(challenge);
  } else {
    Logger.log('Webhook verification failed');
    return ContentService.createTextOutput('Verification failed')
      .setMimeType(ContentService.MimeType.TEXT);
  }
}`
  }
};

export default function CodeExamples() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, title: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(title);
    toast.success("კოდი დაკოპირებულია!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
      <div className="container max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            კოდის მაგალითები
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Google Apps Script ფუნქციები WhatsApp ბოტის იმპლემენტაციისთვის
          </p>
        </div>

        <Tabs defaultValue="doPost" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            {Object.entries(codeExamples).map(([key, example]) => (
              <TabsTrigger key={key} value={key}>
                {example.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(codeExamples).map(([key, example]) => (
            <TabsContent key={key} value={key} className="animate-scale-in">
              <Card className="shadow-elegant-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{example.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {example.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(example.code, example.title)}
                    >
                      {copiedCode === example.title ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-secondary p-6 rounded-lg overflow-x-auto">
                    <code className="text-sm">{example.code}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
