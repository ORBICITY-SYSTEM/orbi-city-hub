import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  FileText, 
  Code, 
  Rocket, 
  CheckCircle2,
  ExternalLink,
  Copy,
  Cloud,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const getDownloadableFiles = (t: (key: string) => string) => [
  {
    title: "ORBI_CITY_COMPLETE_IMPLEMENTATION.md",
    descriptionKey: "whatsapp.fullInstructions",
    icon: FileText,
    content: `# ORBI CITY WhatsApp Bot - სრული იმპლემენტაციის გეგმა

## 🚀 სწრაფი დაწყება (10 წუთი)

### ნაბიჯი 1: Google Apps Script Deploy

1. გახსენით: https://script.google.com
2. შექმენით ახალი პროექტი
3. დააკოპირეთ კოდი \`whatsapp_gemini_bot.gs\`-დან
4. Deploy → New deployment → Web app
5. დააკოპირეთ Webhook URL

### ნაბიჯი 2: WhatsApp Business Credentials

1. გადადით: https://business.facebook.com
2. მონიშნეთ თქვენი WhatsApp Business Account
3. მიიღეთ:
   - Phone Number ID
   - Access Token (Permanent)
   - შექმენით Verify Token

### ნაბიჯი 3: კონფიგურაციის განახლება

\`\`\`javascript
const CONFIG = {
  PROJECT_ID: 'orbi-city-hub',
  LOCATION: 'us-central1',
  MODEL_ID: 'gemini-2.0-flash',
  WHATSAPP_TOKEN: 'YOUR_TOKEN_HERE',
  VERIFY_TOKEN: 'orbi_city_verify_token_2025',
  PHONE_NUMBER_ID: 'YOUR_ID_HERE'
};
\`\`\`

### ნაბიჯი 4: Webhook Configuration

1. Meta Developers → Configuration → Webhooks
2. Callback URL: თქვენი Webhook URL
3. Verify Token: \`orbi_city_verify_token_2025\`
4. Subscribe: messages, message_status

### ნაბიჯი 5: ტესტირება

1. გაუგზავნეთ WhatsApp შეტყობინება
2. ბოტი უპასუხებს Gemini AI-ით
3. შეამოწმეთ Apps Script Logs

## ✅ Checklist

- [ ] Google Apps Script გამოქვეყნებული
- [ ] Webhook URL მიღებული
- [ ] Phone Number ID და Access Token მიღებული
- [ ] CONFIG განახლებული
- [ ] Webhook Meta-ში კონფიგურირებული
- [ ] ტესტირება ჩატარებული

## 🎯 სისტემის არქიტექტურა

\`\`\`
WhatsApp User → Meta API → Apps Script → Gemini AI → Response
\`\`\`

## 📞 ORBI CITY ინფორმაცია

- **სახელი:** ORBI CITY Aparthotel
- **მდებარეობა:** ბათუმი, საქართველო
- **სერვისები:** განთავსება, კონსიერჟი, ტურები
- **კონტაქტი:** info@orbicitybatumi.com
- **ენები:** ქართული, ინგლისური, რუსული

## 🔧 Troubleshooting

### ბოტი არ პასუხობს
- შეამოწმეთ Webhook URL
- გადაამოწმეთ Access Token
- შეამოწმეთ Apps Script Logs

### Gemini არ გენერირებს პასუხს
- Vertex AI API გააქტიურებული?
- PROJECT_ID სწორია?
- OAuth permissions OK?

## 📚 დამატებითი რესურსები

- Google Cloud Console: https://console.cloud.google.com
- Meta for Developers: https://developers.facebook.com
- Apps Script Docs: https://developers.google.com/apps-script
`
  },
  {
    title: "whatsapp_gemini_bot.gs",
    descriptionKey: "whatsapp.fullCode",
    icon: Code,
    content: `// ⚙️ Configuration
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
      parts: [{ text: SYSTEM_PROMPT + "\\n\\nმომხმარებელი: " + userMessage }]
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
}
`
  },
  {
    title: "META_WHATSAPP_SETUP_GUIDE.md",
    descriptionKey: "whatsapp.metaGuide",
    icon: Settings,
    content: `# Meta WhatsApp Business Setup

## 📱 WhatsApp Business Account Setup

### 1. Meta Business Manager-ის შექმნა

1. გადადით: https://business.facebook.com
2. შექმენით ახალი Business Account
3. დაამატეთ თქვენი ბიზნესის ინფორმაცია

### 2. WhatsApp Business Account-ის დამატება

1. Business Settings → Accounts → WhatsApp Accounts
2. Add → Create a WhatsApp Business Account
3. აირჩიეთ ტელეფონის ნომერი
4. გაიარეთ ვერიფიკაცია

### 3. Meta Developer App-ის შექმნა

1. გადადით: https://developers.facebook.com
2. My Apps → Create App
3. აირჩიეთ "Business" type
4. დაამატეთ WhatsApp Product

### 4. Credentials-ის მიღება

#### Phone Number ID:
1. WhatsApp → API Setup
2. დააკოპირეთ "Phone number ID"

#### Access Token (Permanent):
1. WhatsApp → API Setup → Temporary access token
2. გადადით System Users → Add
3. შექმენით System User
4. Assign Assets → WhatsApp Account
5. Generate Token → whatsapp_business_messaging, whatsapp_business_management
6. დააკოპირეთ Permanent Token

### 5. Webhook Configuration

1. WhatsApp → Configuration → Webhooks
2. Edit Webhook:
   - **Callback URL:** თქვენი Apps Script Webhook URL
   - **Verify Token:** \`orbi_city_verify_token_2025\`
3. Subscribe to fields:
   - ✅ messages
   - ✅ message_status
4. Verify and Save

### 6. Test Number Setup

1. WhatsApp → API Setup → To
2. Add Phone Number
3. გაუგზავნეთ ტესტ შეტყობინება

## ✅ Verification Checklist

- [ ] Business Manager Account შექმნილია
- [ ] WhatsApp Business Account დამატებულია
- [ ] Developer App შექმნილია
- [ ] Phone Number ID მიღებულია
- [ ] Permanent Access Token გენერირებულია
- [ ] Webhook კონფიგურირებულია და verified
- [ ] Test Number დამატებულია

## 🔒 Security Best Practices

- არასოდეს გაუზიაროთ Access Token
- გამოიყენეთ Permanent Token (არა Temporary)
- რეგულარულად შეამოწმეთ Token Permissions
- Enable 2FA თქვენს Meta Account-ზე

## 📞 Support

- Meta Business Help: https://business.facebook.com/help
- WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp
`
  },
  {
    title: "ORBI_CITY_BOT_QUICK_REFERENCE.md",
    descriptionKey: "whatsapp.quickRef",
    icon: Rocket,
    content: `# ORBI CITY WhatsApp Bot - Quick Reference

## 🔑 Credentials Checklist

### Google Cloud (უკვე კონფიგურირებული)
- ✅ Project ID: \`orbi-city-hub\`
- ✅ Location: \`us-central1\`
- ✅ Model: \`gemini-2.0-flash\`
- ✅ Vertex AI API: Enabled

### Meta WhatsApp (საჭიროა მიღება)
- [ ] Phone Number ID: \`___________________\`
- [ ] Access Token: \`___________________\`
- [ ] Verify Token: \`orbi_city_verify_token_2025\`

### Apps Script
- [ ] Webhook URL: \`___________________\`
- [ ] Deployment Status: ✅ Published

## 🧪 Testing Commands

გაუგზავნეთ ეს შეტყობინებები WhatsApp-ში ტესტირებისთვის:

1. **ზოგადი მისალმება:**
   \`\`\`
   გამარჯობა
   \`\`\`

2. **სერვისების შესახებ:**
   \`\`\`
   რა სერვისები გაქვთ?
   \`\`\`

3. **ფასების შესახებ:**
   \`\`\`
   რა ფასები გაქვთ?
   \`\`\`

4. **მდებარეობა:**
   \`\`\`
   სად იმყოფებით?
   \`\`\`

5. **ჯავშანი:**
   \`\`\`
   როგორ შემიძლია ჯავშანი?
   \`\`\`

## 🔧 Troubleshooting Guide

### ❌ ბოტი არ პასუხობს

**შემოწმება:**
1. Apps Script Execution Log
2. Webhook URL სწორია Meta-ში?
3. Access Token ვალიდურია?
4. Phone Number ID სწორია?

**გადაწყვეტა:**
\`\`\`javascript
// შეამოწმეთ CONFIG:
Logger.log(CONFIG.PHONE_NUMBER_ID);
Logger.log(CONFIG.WHATSAPP_TOKEN);
\`\`\`

### ❌ Gemini არ გენერირებს პასუხს

**შემოწმება:**
1. Vertex AI API გააქტიურებული?
2. OAuth Permissions OK?
3. PROJECT_ID სწორია?

**გადაწყვეტა:**
\`\`\`javascript
// Test Gemini directly:
function testGemini() {
  const response = callGemini("გამარჯობა");
  Logger.log(response);
}
\`\`\`

### ❌ Webhook Verification Failed

**შემოწმება:**
1. Verify Token ემთხვევა CONFIG-ში?
2. Apps Script Published როგორც Web App?
3. "Anyone" access enabled?

**გადაწყვეტა:**
- Re-deploy Apps Script
- გადაამოწმეთ Verify Token
- სცადეთ ხელახლა Meta-ში

### ❌ "Authorization Failed" Error

**შემოწმება:**
1. Apps Script OAuth Scopes
2. Service Account Permissions

**გადაწყვეტა:**
1. Apps Script → Project Settings → Scopes
2. დაამატეთ: \`https://www.googleapis.com/auth/cloud-platform\`
3. Re-authorize

## 📊 System Architecture

\`\`\`
┌─────────────┐
│ WhatsApp    │
│ User        │
└──────┬──────┘
       │ Message
       ▼
┌─────────────┐
│ Meta        │
│ WhatsApp    │
│ API         │
└──────┬──────┘
       │ Webhook
       ▼
┌─────────────┐
│ Google      │
│ Apps Script │ ◄─── CONFIG
└──────┬──────┘
       │ API Call
       ▼
┌─────────────┐
│ Vertex AI   │
│ Gemini      │ ◄─── SYSTEM_PROMPT
└──────┬──────┘
       │ Response
       ▼
┌─────────────┐
│ WhatsApp    │
│ User        │
└─────────────┘
\`\`\`

## 📚 Useful Links

- **Google Cloud Console:** https://console.cloud.google.com/welcome?project=orbi-city-hub
- **Apps Script Editor:** https://script.google.com
- **Meta for Developers:** https://developers.facebook.com
- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp

## 💡 Tips

- შეინახეთ Credentials უსაფრთხო ადგილას
- რეგულარულად შეამოწმეთ Logs
- ტესტირება ჩაატარეთ Test Number-ზე
- Production-ში გადასვლამდე დარწმუნდით რომ ყველაფერი მუშაობს
`
  }
];

export default function QuickStart() {
  const { t } = useLanguage();
  
  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} ${t('whatsapp.downloaded')}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('whatsapp.copied'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary py-12">
      <div className="container max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <Badge className="mb-4 px-4 py-1.5">
            <Rocket className="h-3 w-3 mr-1.5" />
            {t('whatsapp.quickStart')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            {t('whatsapp.documentation')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('whatsapp.downloadDocs')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-elegant">
            <CardHeader>
              <Code className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">{t('whatsapp.deploymentWizard')}</CardTitle>
              <CardDescription>
                {t('whatsapp.stepByStep')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/deployment-wizard">
                  {t('whatsapp.start')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <Cloud className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Google Cloud</CardTitle>
              <CardDescription>
                orbi-city-hub {t('whatsapp.project')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a href="https://console.cloud.google.com/welcome?project=orbi-city-hub" target="_blank" rel="noopener noreferrer">
                  {t('whatsapp.open')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <Settings className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Meta Developers</CardTitle>
              <CardDescription>
                {t('whatsapp.whatsappConfig')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">
                  {t('whatsapp.open')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Downloadable Files */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('whatsapp.downloadableFiles')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getDownloadableFiles(t).map((file, idx) => {
              const FileIcon = file.icon;
              
              return (
                <Card key={idx} className="shadow-elegant animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <FileIcon className="h-8 w-8 text-primary mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{file.title}</CardTitle>
                        <CardDescription>{t(file.descriptionKey)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => downloadFile(file.title, file.content)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t('whatsapp.download')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => copyToClipboard(file.content)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {t('whatsapp.copyCode')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Reference */}
        <Card className="mt-12 shadow-elegant-lg">
          <CardHeader>
            <CardTitle className="text-2xl">⚡ {t('whatsapp.quickReference')}</CardTitle>
            <CardDescription>
              {t('whatsapp.importantInfo')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {t('whatsapp.alreadyConfigured')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Project ID</p>
                  <p className="font-mono text-sm">orbi-city-hub</p>
                </div>
                <div className="bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-mono text-sm">us-central1</p>
                </div>
                <div className="bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Model</p>
                  <p className="font-mono text-sm">gemini-2.0-flash</p>
                </div>
                <div className="bg-secondary p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Vertex AI API</p>
                  <p className="font-mono text-sm text-green-500">✅ Enabled</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">📝 {t('whatsapp.requiredCredentials')}</h3>
              <Alert>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Phone Number ID (Meta WhatsApp)</li>
                    <li>Access Token (Permanent)</li>
                    <li>Webhook URL (Apps Script)</li>
                    <li>Verify Token: <code className="bg-secondary px-2 py-0.5 rounded">orbi_city_verify_token_2025</code></li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-3">🚀 {t('whatsapp.nextSteps')}</h3>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <a href="/deployment-wizard">
                    {t('whatsapp.startWithWizard')}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
