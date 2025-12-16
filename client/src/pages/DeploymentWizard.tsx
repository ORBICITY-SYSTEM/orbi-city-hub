import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  ExternalLink,
  Cloud,
  Code,
  Link2,
  Settings,
  Rocket
} from "lucide-react";
import { toast } from "sonner";

const steps = [
  {
    id: 1,
    title: "Google Apps Script Deploy",
    icon: Code,
    description: "სკრიპტის გამოქვეყნება და Webhook URL-ის მიღება"
  },
  {
    id: 2,
    title: "WhatsApp Credentials",
    icon: Settings,
    description: "Meta Business-დან საჭირო პარამეტრების მიღება"
  },
  {
    id: 3,
    title: "Configuration",
    icon: Cloud,
    description: "Apps Script კონფიგურაციის განახლება"
  },
  {
    id: 4,
    title: "Webhook Setup",
    icon: Link2,
    description: "Meta-ში Webhook-ის კონფიგურაცია"
  },
  {
    id: 5,
    title: "Testing",
    icon: Rocket,
    description: "ბოტის ტესტირება და გაშვება"
  }
];

export default function DeploymentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState({
    webhookUrl: "",
    phoneNumberId: "",
    accessToken: "",
    verifyToken: "orbi_city_verify_token_2025",
    projectId: "orbi-city-hub",
    location: "us-central1",
    modelId: "gemini-2.0-flash"
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("დაკოპირებულია!");
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Alert>
              <Code className="h-4 w-4" />
              <AlertDescription>
                <strong>ნაბიჯი 1:</strong> გახსენით Google Apps Script და შექმენით ახალი პროექტი
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. გახსენით Apps Script Editor</h3>
                <Button asChild variant="outline" className="w-full">
                  <a href="https://script.google.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    script.google.com
                  </a>
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. დააკოპირეთ სრული კოდი</h3>
                <div className="relative">
                  <pre className="bg-secondary p-4 rounded-lg text-xs overflow-x-auto max-h-96">
{`// ⚙️ Configuration
const CONFIG = {
  PROJECT_ID: 'orbi-city-hub',
  LOCATION: 'us-central1',
  MODEL_ID: 'gemini-2.0-flash',
  WHATSAPP_TOKEN: 'YOUR_TOKEN_HERE',
  VERIFY_TOKEN: 'orbi_city_verify_token_2025',
  PHONE_NUMBER_ID: 'YOUR_ID_HERE'
};

// 🤖 System Prompt for Orbi City
const SYSTEM_PROMPT = \`
თქვენ ხართ ORBI CITY აპარტჰოტელის ოფიციალური ვირტუალური ასისტენტი.

📍 ინფორმაცია:
- სახელი: ORBI CITY Aparthotel
- მდებარეობა: ბათუმი, საქართველო
- სერვისები: განთავსება, კონსიერჟი, ტურები, ჯავშნები
- საკონტაქტო: info@orbicitybatumi.com

💬 კომუნიკაციის სტილი:
- პროფესიონალური და მეგობრული
- სწრაფი და ზუსტი პასუხები
- მხარდაჭერა ქართულ, ინგლისურ და რუსულ ენებზე

✅ რა შეგიძლიათ:
- ინფორმაცია ნომრების, ფასების, ხელმისაწვდომობის შესახებ
- ჯავშნის დახმარება
- ტურების და სერვისების რეკომენდაცია
- ზოგადი კითხვებზე პასუხი

❌ შეზღუდვები:
- არ დაპირდეთ რაიმეს რაც არ არის დადასტურებული
- რთული კითხვები გადაამისამართეთ ოპერატორთან
\`;

// 📨 Handle incoming WhatsApp messages
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;
      
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const from = message.from;
        const text = message.text.body;
        
        Logger.log(\`Received message from \${from}: \${text}\`);
        
        // Get AI response
        const response = callGemini(text);
        
        // Send back to WhatsApp
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
}

// 🔐 Webhook verification
function doGet(e) {
  const mode = e.parameter['hub.mode'];
  const token = e.parameter['hub.verify_token'];
  const challenge = e.parameter['hub.challenge'];
  
  if (mode === 'subscribe' && token === CONFIG.VERIFY_TOKEN) {
    Logger.log('Webhook verified successfully');
    return ContentService.createTextOutput(challenge);
  } else {
    Logger.log('Webhook verification failed');
    return ContentService.createTextOutput('Verification failed');
  }
}

// 🧠 Call Gemini AI
function callGemini(userMessage) {
  const url = \`https://\${CONFIG.LOCATION}-aiplatform.googleapis.com/v1/projects/\${CONFIG.PROJECT_ID}/locations/\${CONFIG.LOCATION}/publishers/google/models/\${CONFIG.MODEL_ID}:generateContent\`;
  
  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT + "\n\nმომხმარებელი: " + userMessage }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.candidates && result.candidates.length > 0) {
      return result.candidates[0].content.parts[0].text;
    }
    
    return "ბოდიში, ამჟამად ვერ ვპასუხობ. გთხოვთ დაუკავშირდეთ ჩვენს ოპერატორს.";
  } catch (error) {
    Logger.log('Error calling Gemini: ' + error);
    return "ტექნიკური შეცდომა. გთხოვთ სცადოთ მოგვიანებით.";
  }
}

// 📤 Send message to WhatsApp
function sendWhatsApp(recipientId, message) {
  const url = \`https://graph.facebook.com/v18.0/\${CONFIG.PHONE_NUMBER_ID}/messages\`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: recipientId,
    type: 'text',
    text: { body: message }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + CONFIG.WHATSAPP_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      Logger.log('Message sent: ' + result.messages[0].id);
      return true;
    } else {
      Logger.log('Error: ' + result.error.message);
      return false;
    }
  } catch (error) {
    Logger.log('Exception: ' + error);
    return false;
  }
}`}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(document.querySelector("pre")?.textContent || "")}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    კოდის კოპირება
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. გამოაქვეყნეთ როგორც Web App</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>დააჭირეთ Deploy → New deployment</li>
                  <li>აირჩიეთ "Web app"</li>
                  <li>Execute as: "Me"</li>
                  <li>Who has access: "Anyone"</li>
                  <li>დააჭირეთ Deploy</li>
                </ul>
              </div>

              <div>
                <Label htmlFor="webhookUrl">4. Webhook URL (დააკოპირეთ აქ)</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://script.google.com/macros/s/..."
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>ნაბიჯი 2:</strong> მიიღეთ WhatsApp Business Credentials Meta-დან
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. გახსენით Meta for Developers</h3>
                <Button asChild variant="outline" className="w-full">
                  <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    developers.facebook.com
                  </a>
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                  <Input
                    id="phoneNumberId"
                    placeholder="123456789012345"
                    value={config.phoneNumberId}
                    onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    WhatsApp → API Setup → Phone Number ID
                  </p>
                </div>

                <div>
                  <Label htmlFor="accessToken">Access Token (Permanent)</Label>
                  <Textarea
                    id="accessToken"
                    placeholder="EAAxxxxxxxxxxxx..."
                    rows={3}
                    value={config.accessToken}
                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    WhatsApp → API Setup → Access Token → Generate Permanent Token
                  </p>
                </div>

                <div>
                  <Label htmlFor="verifyToken">Verify Token</Label>
                  <Input
                    id="verifyToken"
                    value={config.verifyToken}
                    onChange={(e) => setConfig({ ...config, verifyToken: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ნებისმიერი სტრინგი (მაგ: orbi_city_verify_token_2025)
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Alert>
              <Cloud className="h-4 w-4" />
              <AlertDescription>
                <strong>ნაბიჯი 3:</strong> განაახლეთ CONFIG Apps Script-ში
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">განახლებული კონფიგურაცია:</h3>
                <div className="relative">
                  <pre className="bg-secondary p-4 rounded-lg text-sm">
{`const CONFIG = {
  PROJECT_ID: '${config.projectId}',
  LOCATION: '${config.location}',
  MODEL_ID: '${config.modelId}',
  WHATSAPP_TOKEN: '${config.accessToken || 'YOUR_TOKEN_HERE'}',
  VERIFY_TOKEN: '${config.verifyToken}',
  PHONE_NUMBER_ID: '${config.phoneNumberId || 'YOUR_ID_HERE'}'
};`}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`const CONFIG = {
  PROJECT_ID: '${config.projectId}',
  LOCATION: '${config.location}',
  MODEL_ID: '${config.modelId}',
  WHATSAPP_TOKEN: '${config.accessToken || 'YOUR_TOKEN_HERE'}',
  VERIFY_TOKEN: '${config.verifyToken}',
  PHONE_NUMBER_ID: '${config.phoneNumberId || 'YOUR_ID_HERE'}'
};`)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>მნიშვნელოვანი:</strong> დააკოპირეთ ეს კონფიგურაცია და ჩაანაცვლეთ Apps Script-ში CONFIG ობიექტი
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Alert>
              <Link2 className="h-4 w-4" />
              <AlertDescription>
                <strong>ნაბიჯი 4:</strong> დააკონფიგურირეთ Webhook Meta-ში
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. გადადით Webhook Settings-ზე</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Meta Developers → თქვენი აპლიკაცია → WhatsApp → Configuration → Webhooks
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. დაამატეთ Webhook:</h3>
                <div className="space-y-3 bg-secondary p-4 rounded-lg">
                  <div>
                    <Label className="text-xs">Callback URL:</Label>
                    <p className="font-mono text-sm break-all">
                      {config.webhookUrl || "თქვენი Webhook URL ნაბიჯი 1-დან"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs">Verify Token:</Label>
                    <p className="font-mono text-sm">{config.verifyToken}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Subscribe to Fields:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>messages</li>
                  <li>message_status</li>
                </ul>
              </div>

              <Alert>
                <AlertDescription>
                  დააჭირეთ "Verify and Save" - თუ ყველაფერი სწორადაა კონფიგურირებული, მიიღებთ ✅ დადასტურებას
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Alert>
              <Rocket className="h-4 w-4" />
              <AlertDescription>
                <strong>ნაბიჯი 5:</strong> ბოტის ტესტირება
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">✅ ტესტირების ინსტრუქცია:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-4">
                  <li>გაუგზავნეთ WhatsApp შეტყობინება თქვენს ბიზნეს ნომერზე</li>
                  <li>დაწერეთ: "გამარჯობა, რა სერვისები გაქვთ?"</li>
                  <li>ბოტმა უნდა უპასუხოს Gemini AI-ით გენერირებული ტექსტით</li>
                  <li>შეამოწმეთ Apps Script Execution Log</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🔍 Troubleshooting:</h3>
                <div className="space-y-2">
                  <details className="bg-secondary p-3 rounded-lg">
                    <summary className="cursor-pointer font-medium text-sm">
                      ბოტი არ პასუხობს
                    </summary>
                    <ul className="list-disc list-inside text-xs mt-2 ml-4 space-y-1">
                      <li>შეამოწმეთ Webhook URL სწორია</li>
                      <li>გადაამოწმეთ Access Token და Phone Number ID</li>
                      <li>შეამოწმეთ Apps Script Execution Log</li>
                    </ul>
                  </details>

                  <details className="bg-secondary p-3 rounded-lg">
                    <summary className="cursor-pointer font-medium text-sm">
                      Gemini არ გენერირებს პასუხს
                    </summary>
                    <ul className="list-disc list-inside text-xs mt-2 ml-4 space-y-1">
                      <li>დარწმუნდით რომ Vertex AI API გააქტიურებულია</li>
                      <li>შეამოწმეთ PROJECT_ID სწორია</li>
                      <li>გადაამოწმეთ OAuth permissions</li>
                    </ul>
                  </details>
                </div>
              </div>

              <Alert className="bg-green-500/10 border-green-500/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>გილოცავთ! 🎉</strong> თქვენი WhatsApp ბოტი მზადაა და მუშაობს!
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary py-12">
      <div className="container max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Deployment Wizard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            5 ნაბიჯი სრული ფუნქციონალური WhatsApp ბოტის გასაშვებად
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCompleted
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-muted bg-background text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <p className={`text-xs mt-2 text-center ${isActive ? "font-semibold" : ""}`}>
                      {step.title}
                    </p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-elegant-lg mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon;
                return <StepIcon className="h-8 w-8 text-primary" />;
              })()}
              <div>
                <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
                <CardDescription className="text-base">
                  {steps[currentStep - 1].description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            უკან
          </Button>
          <Badge variant="outline" className="px-4 py-2">
            ნაბიჯი {currentStep} / {steps.length}
          </Badge>
          <Button
            onClick={nextStep}
            disabled={currentStep === steps.length}
          >
            შემდეგი
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
