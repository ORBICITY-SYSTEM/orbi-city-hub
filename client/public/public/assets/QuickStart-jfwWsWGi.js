import{j as e,q as m,s as x,aN as p,bO as b,ax as h,F as _,ag as A,aZ as N,a4 as f,a6 as g}from"./react-vendor-BIDRRw8F.js";import{C as c,b as r,c as o,d as i,a as n,B as s}from"./index-BLcOQO7i.js";import{B as j}from"./badge-BATP3r_Y.js";import{A as y,b as C}from"./alert-DhTQNDzo.js";import"./trpc-vendor-wm-eNDph.js";import"./vendor-INCMKllo.js";const T=[{title:"ORBI_CITY_COMPLETE_IMPLEMENTATION.md",description:"სრული ნაბიჯ-ნაბიჯ ინსტრუქციები",icon:_,content:`# ORBI CITY WhatsApp Bot - სრული იმპლემენტაციის გეგმა

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
`},{title:"whatsapp_gemini_bot.gs",description:"სრული Google Apps Script კოდი",icon:x,content:`// ⚙️ Configuration
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
`},{title:"META_WHATSAPP_SETUP_GUIDE.md",description:"Meta Business Setup სახელმძღვანელო",icon:h,content:`# Meta WhatsApp Business Setup

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
`},{title:"ORBI_CITY_BOT_QUICK_REFERENCE.md",description:"სწრაფი მითითებები და Troubleshooting",icon:m,content:`# ORBI CITY WhatsApp Bot - Quick Reference

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
`}];function W(){const k=(t,l)=>{const d=new Blob([l],{type:"text/plain"}),u=URL.createObjectURL(d),a=document.createElement("a");a.href=u,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(u),g.success(`${t} ჩამოტვირთულია!`)},S=t=>{navigator.clipboard.writeText(t),g.success("დაკოპირებულია!")};return e.jsx("div",{"data-loc":"client/src/pages/QuickStart.tsx:542",className:"min-h-screen bg-gradient-to-br from-background to-secondary py-12",children:e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:543",className:"container max-w-6xl",children:[e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:544",className:"text-center mb-12 animate-fade-in",children:[e.jsxs(j,{"data-loc":"client/src/pages/QuickStart.tsx:545",className:"mb-4 px-4 py-1.5",children:[e.jsx(m,{"data-loc":"client/src/pages/QuickStart.tsx:546",className:"h-3 w-3 mr-1.5"}),"სწრაფი დაწყება"]}),e.jsx("h1",{"data-loc":"client/src/pages/QuickStart.tsx:549",className:"text-4xl md:text-5xl font-bold mb-4 text-gradient",children:"დოკუმენტაცია და ფაილები"}),e.jsx("p",{"data-loc":"client/src/pages/QuickStart.tsx:552",className:"text-lg text-muted-foreground max-w-2xl mx-auto",children:"ჩამოტვირთეთ სრული დოკუმენტაცია და კოდი"})]}),e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:558",className:"grid grid-cols-1 md:grid-cols-3 gap-6 mb-12",children:[e.jsxs(c,{"data-loc":"client/src/pages/QuickStart.tsx:559",className:"shadow-elegant",children:[e.jsxs(r,{"data-loc":"client/src/pages/QuickStart.tsx:560",children:[e.jsx(x,{"data-loc":"client/src/pages/QuickStart.tsx:561",className:"h-8 w-8 text-primary mb-2"}),e.jsx(o,{"data-loc":"client/src/pages/QuickStart.tsx:562",className:"text-lg",children:"Deployment Wizard"}),e.jsx(i,{"data-loc":"client/src/pages/QuickStart.tsx:563",children:"ნაბიჯ-ნაბიჯ გაშვების ინსტრუქცია"})]}),e.jsx(n,{"data-loc":"client/src/pages/QuickStart.tsx:567",children:e.jsx(s,{"data-loc":"client/src/pages/QuickStart.tsx:568",asChild:!0,className:"w-full",children:e.jsxs("a",{"data-loc":"client/src/pages/QuickStart.tsx:569",href:"/deployment-wizard",children:["დაწყება",e.jsx(p,{"data-loc":"client/src/pages/QuickStart.tsx:571",className:"ml-2 h-4 w-4"})]})})})]}),e.jsxs(c,{"data-loc":"client/src/pages/QuickStart.tsx:577",className:"shadow-elegant",children:[e.jsxs(r,{"data-loc":"client/src/pages/QuickStart.tsx:578",children:[e.jsx(b,{"data-loc":"client/src/pages/QuickStart.tsx:579",className:"h-8 w-8 text-blue-500 mb-2"}),e.jsx(o,{"data-loc":"client/src/pages/QuickStart.tsx:580",className:"text-lg",children:"Google Cloud"}),e.jsx(i,{"data-loc":"client/src/pages/QuickStart.tsx:581",children:"orbi-city-hub პროექტი"})]}),e.jsx(n,{"data-loc":"client/src/pages/QuickStart.tsx:585",children:e.jsx(s,{"data-loc":"client/src/pages/QuickStart.tsx:586",asChild:!0,variant:"outline",className:"w-full",children:e.jsxs("a",{"data-loc":"client/src/pages/QuickStart.tsx:587",href:"https://console.cloud.google.com/welcome?project=orbi-city-hub",target:"_blank",rel:"noopener noreferrer",children:["გახსნა",e.jsx(p,{"data-loc":"client/src/pages/QuickStart.tsx:589",className:"ml-2 h-4 w-4"})]})})})]}),e.jsxs(c,{"data-loc":"client/src/pages/QuickStart.tsx:595",className:"shadow-elegant",children:[e.jsxs(r,{"data-loc":"client/src/pages/QuickStart.tsx:596",children:[e.jsx(h,{"data-loc":"client/src/pages/QuickStart.tsx:597",className:"h-8 w-8 text-green-500 mb-2"}),e.jsx(o,{"data-loc":"client/src/pages/QuickStart.tsx:598",className:"text-lg",children:"Meta Developers"}),e.jsx(i,{"data-loc":"client/src/pages/QuickStart.tsx:599",children:"WhatsApp კონფიგურაცია"})]}),e.jsx(n,{"data-loc":"client/src/pages/QuickStart.tsx:603",children:e.jsx(s,{"data-loc":"client/src/pages/QuickStart.tsx:604",asChild:!0,variant:"outline",className:"w-full",children:e.jsxs("a",{"data-loc":"client/src/pages/QuickStart.tsx:605",href:"https://developers.facebook.com",target:"_blank",rel:"noopener noreferrer",children:["გახსნა",e.jsx(p,{"data-loc":"client/src/pages/QuickStart.tsx:607",className:"ml-2 h-4 w-4"})]})})})]})]}),e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:615",className:"space-y-6",children:[e.jsx("h2",{"data-loc":"client/src/pages/QuickStart.tsx:616",className:"text-2xl font-bold",children:"ჩამოსატვირთი ფაილები"}),e.jsx("div",{"data-loc":"client/src/pages/QuickStart.tsx:617",className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:T.map((t,l)=>{const d=t.icon;return e.jsxs(c,{"data-loc":"client/src/pages/QuickStart.tsx:622",className:"shadow-elegant animate-slide-up",style:{animationDelay:`${l*100}ms`},children:[e.jsx(r,{"data-loc":"client/src/pages/QuickStart.tsx:623",children:e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:624",className:"flex items-start gap-3",children:[e.jsx(d,{"data-loc":"client/src/pages/QuickStart.tsx:625",className:"h-8 w-8 text-primary mt-1"}),e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:626",className:"flex-1",children:[e.jsx(o,{"data-loc":"client/src/pages/QuickStart.tsx:627",className:"text-lg",children:t.title}),e.jsx(i,{"data-loc":"client/src/pages/QuickStart.tsx:628",children:t.description})]})]})}),e.jsxs(n,{"data-loc":"client/src/pages/QuickStart.tsx:632",className:"space-y-3",children:[e.jsxs(s,{"data-loc":"client/src/pages/QuickStart.tsx:633",className:"w-full",onClick:()=>k(t.title,t.content),children:[e.jsx(A,{"data-loc":"client/src/pages/QuickStart.tsx:637",className:"mr-2 h-4 w-4"}),"ჩამოტვირთვა"]}),e.jsxs(s,{"data-loc":"client/src/pages/QuickStart.tsx:640",variant:"outline",className:"w-full",onClick:()=>S(t.content),children:[e.jsx(N,{"data-loc":"client/src/pages/QuickStart.tsx:645",className:"mr-2 h-4 w-4"}),"კოდის კოპირება"]})]})]},l)})})]}),e.jsxs(c,{"data-loc":"client/src/pages/QuickStart.tsx:656",className:"mt-12 shadow-elegant-lg",children:[e.jsxs(r,{"data-loc":"client/src/pages/QuickStart.tsx:657",children:[e.jsx(o,{"data-loc":"client/src/pages/QuickStart.tsx:658",className:"text-2xl",children:"⚡ სწრაფი მითითებები"}),e.jsx(i,{"data-loc":"client/src/pages/QuickStart.tsx:659",children:"ყველაზე მნიშვნელოვანი ინფორმაცია ერთ ადგილას"})]}),e.jsxs(n,{"data-loc":"client/src/pages/QuickStart.tsx:663",className:"space-y-6",children:[e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:664",children:[e.jsxs("h3",{"data-loc":"client/src/pages/QuickStart.tsx:665",className:"font-semibold mb-3 flex items-center gap-2",children:[e.jsx(f,{"data-loc":"client/src/pages/QuickStart.tsx:666",className:"h-5 w-5 text-green-500"}),"უკვე კონფიგურირებული"]}),e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:669",className:"grid grid-cols-1 md:grid-cols-2 gap-3",children:[e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:670",className:"bg-secondary p-3 rounded-lg",children:[e.jsx("p",{"data-loc":"client/src/pages/QuickStart.tsx:671",className:"text-xs text-muted-foreground",children:"Project ID"}),e.jsx("p",{"data-loc":"client/src/pages/QuickStart.tsx:672",className:"font-mono text-sm",children:"orbi-city-hub"})]}),e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:674",className:"bg-secondary p-3 rounded-lg",children:[e.jsx("p",{"data-loc":"client/src/pages/QuickStart.tsx:675",className:"text-xs text-muted-foreground",children:"Location"}),e.jsx("p",{"data-loc":"client/src/pages/QuickStart.tsx:676",className:"font-mono text-sm",children:"us-central1"})]}),e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:678",className:"bg-secondary p-3 rounded-lg",children:[e.jsx("p",{"data-loc":"client/src/pages/QuickStart.tsx:679",className:"text-xs text-muted-foreground",children:"Model"}),e.jsx("p",{"data-loc":"client/src/pages/QuickStart.tsx:680",className:"font-mono text-sm",children:"gemini-2.0-flash"})]}),e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:682",className:"bg-secondary p-3 rounded-lg",children:[e.jsx("p",{"data-loc":"client/src/pages/QuickStart.tsx:683",className:"text-xs text-muted-foreground",children:"Vertex AI API"}),e.jsx("p",{"data-loc":"client/src/pages/QuickStart.tsx:684",className:"font-mono text-sm text-green-500",children:"✅ Enabled"})]})]})]}),e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:689",children:[e.jsx("h3",{"data-loc":"client/src/pages/QuickStart.tsx:690",className:"font-semibold mb-3",children:"📝 საჭირო Credentials"}),e.jsx(y,{"data-loc":"client/src/pages/QuickStart.tsx:691",children:e.jsx(C,{"data-loc":"client/src/pages/QuickStart.tsx:692",children:e.jsxs("ul",{"data-loc":"client/src/pages/QuickStart.tsx:693",className:"list-disc list-inside space-y-1 text-sm",children:[e.jsx("li",{"data-loc":"client/src/pages/QuickStart.tsx:694",children:"Phone Number ID (Meta WhatsApp)"}),e.jsx("li",{"data-loc":"client/src/pages/QuickStart.tsx:695",children:"Access Token (Permanent)"}),e.jsx("li",{"data-loc":"client/src/pages/QuickStart.tsx:696",children:"Webhook URL (Apps Script)"}),e.jsxs("li",{"data-loc":"client/src/pages/QuickStart.tsx:697",children:["Verify Token: ",e.jsx("code",{"data-loc":"client/src/pages/QuickStart.tsx:697",className:"bg-secondary px-2 py-0.5 rounded",children:"orbi_city_verify_token_2025"})]})]})})})]}),e.jsxs("div",{"data-loc":"client/src/pages/QuickStart.tsx:703",children:[e.jsx("h3",{"data-loc":"client/src/pages/QuickStart.tsx:704",className:"font-semibold mb-3",children:"🚀 შემდეგი ნაბიჯები"}),e.jsx("div",{"data-loc":"client/src/pages/QuickStart.tsx:705",className:"flex flex-col gap-2",children:e.jsx(s,{"data-loc":"client/src/pages/QuickStart.tsx:706",asChild:!0,children:e.jsxs("a",{"data-loc":"client/src/pages/QuickStart.tsx:707",href:"/deployment-wizard",children:["დაიწყეთ Deployment Wizard-ით",e.jsx(p,{"data-loc":"client/src/pages/QuickStart.tsx:709",className:"ml-2 h-4 w-4"})]})})})]})]})]})]})})}export{W as default};
