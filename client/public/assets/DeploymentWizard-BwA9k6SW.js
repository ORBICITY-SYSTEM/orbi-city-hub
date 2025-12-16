import{r as h,j as e,s as u,ax as j,bO as z,bP as N,q as b,a4 as y,aj as I,b7 as k,aZ as W,aN as D,a6 as A}from"./react-vendor-BIDRRw8F.js";import{C as E,b as _,c as S,d as w,a as R,B as n,T as P}from"./index-BLcOQO7i.js";import{I as p}from"./input-BuEOZAZD.js";import{L as i}from"./label-KexGf_ya.js";import{B as L}from"./badge-BATP3r_Y.js";import{A as l,b as c}from"./alert-DhTQNDzo.js";import"./trpc-vendor-wm-eNDph.js";import"./vendor-INCMKllo.js";const r=[{id:1,title:"Google Apps Script Deploy",icon:u,description:"სკრიპტის გამოქვეყნება და Webhook URL-ის მიღება"},{id:2,title:"WhatsApp Credentials",icon:j,description:"Meta Business-დან საჭირო პარამეტრების მიღება"},{id:3,title:"Configuration",icon:z,description:"Apps Script კონფიგურაციის განახლება"},{id:4,title:"Webhook Setup",icon:N,description:"Meta-ში Webhook-ის კონფიგურაცია"},{id:5,title:"Testing",icon:b,description:"ბოტის ტესტირება და გაშვება"}];function Y(){const[a,m]=h.useState(1),[s,o]=h.useState({webhookUrl:"",phoneNumberId:"",accessToken:"",verifyToken:"orbi_city_verify_token_2025",projectId:"orbi-city-hub",location:"us-central1",modelId:"gemini-2.0-flash"}),x=t=>{navigator.clipboard.writeText(t),A.success("დაკოპირებულია!")},f=()=>{a<r.length&&m(a+1)},v=()=>{a>1&&m(a-1)},O=()=>{switch(a){case 1:return e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:90",className:"space-y-6",children:[e.jsxs(l,{"data-loc":"client/src/pages/DeploymentWizard.tsx:91",children:[e.jsx(u,{"data-loc":"client/src/pages/DeploymentWizard.tsx:92",className:"h-4 w-4"}),e.jsxs(c,{"data-loc":"client/src/pages/DeploymentWizard.tsx:93",children:[e.jsx("strong",{"data-loc":"client/src/pages/DeploymentWizard.tsx:94",children:"ნაბიჯი 1:"})," გახსენით Google Apps Script და შექმენით ახალი პროექტი"]})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:98",className:"space-y-4",children:[e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:99",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:100",className:"font-semibold mb-2",children:"1. გახსენით Apps Script Editor"}),e.jsx(n,{"data-loc":"client/src/pages/DeploymentWizard.tsx:101",asChild:!0,variant:"outline",className:"w-full",children:e.jsxs("a",{"data-loc":"client/src/pages/DeploymentWizard.tsx:102",href:"https://script.google.com",target:"_blank",rel:"noopener noreferrer",children:[e.jsx(D,{"data-loc":"client/src/pages/DeploymentWizard.tsx:103",className:"mr-2 h-4 w-4"}),"script.google.com"]})})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:109",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:110",className:"font-semibold mb-2",children:"2. დააკოპირეთ სრული კოდი"}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:111",className:"relative",children:[e.jsx("pre",{"data-loc":"client/src/pages/DeploymentWizard.tsx:112",className:"bg-secondary p-4 rounded-lg text-xs overflow-x-auto max-h-96",children:`// ⚙️ Configuration
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
      parts: [{ text: SYSTEM_PROMPT + "

მომხმარებელი: " + userMessage }]
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
}`}),e.jsxs(n,{"data-loc":"client/src/pages/DeploymentWizard.tsx:277",size:"sm",variant:"outline",className:"absolute top-2 right-2",onClick:()=>x(document.querySelector("pre")?.textContent||""),children:[e.jsx(W,{"data-loc":"client/src/pages/DeploymentWizard.tsx:283",className:"h-3 w-3 mr-1"}),"კოდის კოპირება"]})]})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:289",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:290",className:"font-semibold mb-2",children:"3. გამოაქვეყნეთ როგორც Web App"}),e.jsxs("ul",{"data-loc":"client/src/pages/DeploymentWizard.tsx:291",className:"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4",children:[e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:292",children:"დააჭირეთ Deploy → New deployment"}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:293",children:'აირჩიეთ "Web app"'}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:294",children:'Execute as: "Me"'}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:295",children:'Who has access: "Anyone"'}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:296",children:"დააჭირეთ Deploy"})]})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:300",children:[e.jsx(i,{"data-loc":"client/src/pages/DeploymentWizard.tsx:301",htmlFor:"webhookUrl",children:"4. Webhook URL (დააკოპირეთ აქ)"}),e.jsx(p,{"data-loc":"client/src/pages/DeploymentWizard.tsx:302",id:"webhookUrl",placeholder:"https://script.google.com/macros/s/...",value:s.webhookUrl,onChange:t=>o({...s,webhookUrl:t.target.value})})]})]})]});case 2:return e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:315",className:"space-y-6",children:[e.jsxs(l,{"data-loc":"client/src/pages/DeploymentWizard.tsx:316",children:[e.jsx(j,{"data-loc":"client/src/pages/DeploymentWizard.tsx:317",className:"h-4 w-4"}),e.jsxs(c,{"data-loc":"client/src/pages/DeploymentWizard.tsx:318",children:[e.jsx("strong",{"data-loc":"client/src/pages/DeploymentWizard.tsx:319",children:"ნაბიჯი 2:"})," მიიღეთ WhatsApp Business Credentials Meta-დან"]})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:323",className:"space-y-4",children:[e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:324",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:325",className:"font-semibold mb-2",children:"1. გახსენით Meta for Developers"}),e.jsx(n,{"data-loc":"client/src/pages/DeploymentWizard.tsx:326",asChild:!0,variant:"outline",className:"w-full",children:e.jsxs("a",{"data-loc":"client/src/pages/DeploymentWizard.tsx:327",href:"https://developers.facebook.com",target:"_blank",rel:"noopener noreferrer",children:[e.jsx(D,{"data-loc":"client/src/pages/DeploymentWizard.tsx:328",className:"mr-2 h-4 w-4"}),"developers.facebook.com"]})})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:334",className:"space-y-3",children:[e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:335",children:[e.jsx(i,{"data-loc":"client/src/pages/DeploymentWizard.tsx:336",htmlFor:"phoneNumberId",children:"Phone Number ID"}),e.jsx(p,{"data-loc":"client/src/pages/DeploymentWizard.tsx:337",id:"phoneNumberId",placeholder:"123456789012345",value:s.phoneNumberId,onChange:t=>o({...s,phoneNumberId:t.target.value})}),e.jsx("p",{"data-loc":"client/src/pages/DeploymentWizard.tsx:343",className:"text-xs text-muted-foreground mt-1",children:"WhatsApp → API Setup → Phone Number ID"})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:348",children:[e.jsx(i,{"data-loc":"client/src/pages/DeploymentWizard.tsx:349",htmlFor:"accessToken",children:"Access Token (Permanent)"}),e.jsx(P,{"data-loc":"client/src/pages/DeploymentWizard.tsx:350",id:"accessToken",placeholder:"EAAxxxxxxxxxxxx...",rows:3,value:s.accessToken,onChange:t=>o({...s,accessToken:t.target.value})}),e.jsx("p",{"data-loc":"client/src/pages/DeploymentWizard.tsx:357",className:"text-xs text-muted-foreground mt-1",children:"WhatsApp → API Setup → Access Token → Generate Permanent Token"})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:362",children:[e.jsx(i,{"data-loc":"client/src/pages/DeploymentWizard.tsx:363",htmlFor:"verifyToken",children:"Verify Token"}),e.jsx(p,{"data-loc":"client/src/pages/DeploymentWizard.tsx:364",id:"verifyToken",value:s.verifyToken,onChange:t=>o({...s,verifyToken:t.target.value})}),e.jsx("p",{"data-loc":"client/src/pages/DeploymentWizard.tsx:369",className:"text-xs text-muted-foreground mt-1",children:"ნებისმიერი სტრინგი (მაგ: orbi_city_verify_token_2025)"})]})]})]})]});case 3:return e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:380",className:"space-y-6",children:[e.jsxs(l,{"data-loc":"client/src/pages/DeploymentWizard.tsx:381",children:[e.jsx(z,{"data-loc":"client/src/pages/DeploymentWizard.tsx:382",className:"h-4 w-4"}),e.jsxs(c,{"data-loc":"client/src/pages/DeploymentWizard.tsx:383",children:[e.jsx("strong",{"data-loc":"client/src/pages/DeploymentWizard.tsx:384",children:"ნაბიჯი 3:"})," განაახლეთ CONFIG Apps Script-ში"]})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:388",className:"space-y-4",children:[e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:389",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:390",className:"font-semibold mb-2",children:"განახლებული კონფიგურაცია:"}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:391",className:"relative",children:[e.jsx("pre",{"data-loc":"client/src/pages/DeploymentWizard.tsx:392",className:"bg-secondary p-4 rounded-lg text-sm",children:`const CONFIG = {
  PROJECT_ID: '${s.projectId}',
  LOCATION: '${s.location}',
  MODEL_ID: '${s.modelId}',
  WHATSAPP_TOKEN: '${s.accessToken||"YOUR_TOKEN_HERE"}',
  VERIFY_TOKEN: '${s.verifyToken}',
  PHONE_NUMBER_ID: '${s.phoneNumberId||"YOUR_ID_HERE"}'
};`}),e.jsx(n,{"data-loc":"client/src/pages/DeploymentWizard.tsx:402",size:"sm",variant:"outline",className:"absolute top-2 right-2",onClick:()=>x(`const CONFIG = {
  PROJECT_ID: '${s.projectId}',
  LOCATION: '${s.location}',
  MODEL_ID: '${s.modelId}',
  WHATSAPP_TOKEN: '${s.accessToken||"YOUR_TOKEN_HERE"}',
  VERIFY_TOKEN: '${s.verifyToken}',
  PHONE_NUMBER_ID: '${s.phoneNumberId||"YOUR_ID_HERE"}'
};`),children:e.jsx(W,{"data-loc":"client/src/pages/DeploymentWizard.tsx:415",className:"h-3 w-3"})})]})]}),e.jsx(l,{"data-loc":"client/src/pages/DeploymentWizard.tsx:420",children:e.jsxs(c,{"data-loc":"client/src/pages/DeploymentWizard.tsx:421",children:[e.jsx("strong",{"data-loc":"client/src/pages/DeploymentWizard.tsx:422",children:"მნიშვნელოვანი:"})," დააკოპირეთ ეს კონფიგურაცია და ჩაანაცვლეთ Apps Script-ში CONFIG ობიექტი"]})})]})]});case 4:return e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:431",className:"space-y-6",children:[e.jsxs(l,{"data-loc":"client/src/pages/DeploymentWizard.tsx:432",children:[e.jsx(N,{"data-loc":"client/src/pages/DeploymentWizard.tsx:433",className:"h-4 w-4"}),e.jsxs(c,{"data-loc":"client/src/pages/DeploymentWizard.tsx:434",children:[e.jsx("strong",{"data-loc":"client/src/pages/DeploymentWizard.tsx:435",children:"ნაბიჯი 4:"})," დააკონფიგურირეთ Webhook Meta-ში"]})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:439",className:"space-y-4",children:[e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:440",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:441",className:"font-semibold mb-2",children:"1. გადადით Webhook Settings-ზე"}),e.jsx("p",{"data-loc":"client/src/pages/DeploymentWizard.tsx:442",className:"text-sm text-muted-foreground mb-2",children:"Meta Developers → თქვენი აპლიკაცია → WhatsApp → Configuration → Webhooks"})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:447",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:448",className:"font-semibold mb-2",children:"2. დაამატეთ Webhook:"}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:449",className:"space-y-3 bg-secondary p-4 rounded-lg",children:[e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:450",children:[e.jsx(i,{"data-loc":"client/src/pages/DeploymentWizard.tsx:451",className:"text-xs",children:"Callback URL:"}),e.jsx("p",{"data-loc":"client/src/pages/DeploymentWizard.tsx:452",className:"font-mono text-sm break-all",children:s.webhookUrl||"თქვენი Webhook URL ნაბიჯი 1-დან"})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:456",children:[e.jsx(i,{"data-loc":"client/src/pages/DeploymentWizard.tsx:457",className:"text-xs",children:"Verify Token:"}),e.jsx("p",{"data-loc":"client/src/pages/DeploymentWizard.tsx:458",className:"font-mono text-sm",children:s.verifyToken})]})]})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:463",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:464",className:"font-semibold mb-2",children:"3. Subscribe to Fields:"}),e.jsxs("ul",{"data-loc":"client/src/pages/DeploymentWizard.tsx:465",className:"list-disc list-inside space-y-1 text-sm ml-4",children:[e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:466",children:"messages"}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:467",children:"message_status"})]})]}),e.jsx(l,{"data-loc":"client/src/pages/DeploymentWizard.tsx:471",children:e.jsx(c,{"data-loc":"client/src/pages/DeploymentWizard.tsx:472",children:'დააჭირეთ "Verify and Save" - თუ ყველაფერი სწორადაა კონფიგურირებული, მიიღებთ ✅ დადასტურებას'})})]})]});case 5:return e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:482",className:"space-y-6",children:[e.jsxs(l,{"data-loc":"client/src/pages/DeploymentWizard.tsx:483",children:[e.jsx(b,{"data-loc":"client/src/pages/DeploymentWizard.tsx:484",className:"h-4 w-4"}),e.jsxs(c,{"data-loc":"client/src/pages/DeploymentWizard.tsx:485",children:[e.jsx("strong",{"data-loc":"client/src/pages/DeploymentWizard.tsx:486",children:"ნაბიჯი 5:"})," ბოტის ტესტირება"]})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:490",className:"space-y-4",children:[e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:491",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:492",className:"font-semibold mb-2",children:"✅ ტესტირების ინსტრუქცია:"}),e.jsxs("ol",{"data-loc":"client/src/pages/DeploymentWizard.tsx:493",className:"list-decimal list-inside space-y-2 text-sm ml-4",children:[e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:494",children:"გაუგზავნეთ WhatsApp შეტყობინება თქვენს ბიზნეს ნომერზე"}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:495",children:'დაწერეთ: "გამარჯობა, რა სერვისები გაქვთ?"'}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:496",children:"ბოტმა უნდა უპასუხოს Gemini AI-ით გენერირებული ტექსტით"}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:497",children:"შეამოწმეთ Apps Script Execution Log"})]})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:501",children:[e.jsx("h3",{"data-loc":"client/src/pages/DeploymentWizard.tsx:502",className:"font-semibold mb-2",children:"🔍 Troubleshooting:"}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:503",className:"space-y-2",children:[e.jsxs("details",{"data-loc":"client/src/pages/DeploymentWizard.tsx:504",className:"bg-secondary p-3 rounded-lg",children:[e.jsx("summary",{"data-loc":"client/src/pages/DeploymentWizard.tsx:505",className:"cursor-pointer font-medium text-sm",children:"ბოტი არ პასუხობს"}),e.jsxs("ul",{"data-loc":"client/src/pages/DeploymentWizard.tsx:508",className:"list-disc list-inside text-xs mt-2 ml-4 space-y-1",children:[e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:509",children:"შეამოწმეთ Webhook URL სწორია"}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:510",children:"გადაამოწმეთ Access Token და Phone Number ID"}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:511",children:"შეამოწმეთ Apps Script Execution Log"})]})]}),e.jsxs("details",{"data-loc":"client/src/pages/DeploymentWizard.tsx:515",className:"bg-secondary p-3 rounded-lg",children:[e.jsx("summary",{"data-loc":"client/src/pages/DeploymentWizard.tsx:516",className:"cursor-pointer font-medium text-sm",children:"Gemini არ გენერირებს პასუხს"}),e.jsxs("ul",{"data-loc":"client/src/pages/DeploymentWizard.tsx:519",className:"list-disc list-inside text-xs mt-2 ml-4 space-y-1",children:[e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:520",children:"დარწმუნდით რომ Vertex AI API გააქტიურებულია"}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:521",children:"შეამოწმეთ PROJECT_ID სწორია"}),e.jsx("li",{"data-loc":"client/src/pages/DeploymentWizard.tsx:522",children:"გადაამოწმეთ OAuth permissions"})]})]})]})]}),e.jsxs(l,{"data-loc":"client/src/pages/DeploymentWizard.tsx:528",className:"bg-green-500/10 border-green-500/50",children:[e.jsx(y,{"data-loc":"client/src/pages/DeploymentWizard.tsx:529",className:"h-4 w-4 text-green-500"}),e.jsxs(c,{"data-loc":"client/src/pages/DeploymentWizard.tsx:530",children:[e.jsx("strong",{"data-loc":"client/src/pages/DeploymentWizard.tsx:531",children:"გილოცავთ! 🎉"})," თქვენი WhatsApp ბოტი მზადაა და მუშაობს!"]})]})]})]});default:return null}};return e.jsx("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:544",className:"min-h-screen bg-gradient-to-br from-background to-secondary py-12",children:e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:545",className:"container max-w-5xl",children:[e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:546",className:"text-center mb-12 animate-fade-in",children:[e.jsx("h1",{"data-loc":"client/src/pages/DeploymentWizard.tsx:547",className:"text-4xl md:text-5xl font-bold mb-4 text-gradient",children:"Deployment Wizard"}),e.jsx("p",{"data-loc":"client/src/pages/DeploymentWizard.tsx:550",className:"text-lg text-muted-foreground max-w-2xl mx-auto",children:"5 ნაბიჯი სრული ფუნქციონალური WhatsApp ბოტის გასაშვებად"})]}),e.jsx("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:556",className:"mb-12",children:e.jsx("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:557",className:"flex items-center justify-between",children:r.map((t,T)=>{const C=t.icon,g=a===t.id,d=a>t.id;return e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:564",className:"flex items-center flex-1",children:[e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:565",className:"flex flex-col items-center flex-1",children:[e.jsx("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:566",className:`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${g?"border-primary bg-primary text-primary-foreground":d?"border-green-500 bg-green-500 text-white":"border-muted bg-background text-muted-foreground"}`,children:d?e.jsx(y,{"data-loc":"client/src/pages/DeploymentWizard.tsx:576",className:"h-6 w-6"}):e.jsx(C,{"data-loc":"client/src/pages/DeploymentWizard.tsx:578",className:"h-6 w-6"})}),e.jsx("p",{"data-loc":"client/src/pages/DeploymentWizard.tsx:581",className:`text-xs mt-2 text-center ${g?"font-semibold":""}`,children:t.title})]}),T<r.length-1&&e.jsx("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:586",className:`h-0.5 flex-1 mx-2 ${d?"bg-green-500":"bg-muted"}`})]},t.id)})})}),e.jsxs(E,{"data-loc":"client/src/pages/DeploymentWizard.tsx:599",className:"shadow-elegant-lg mb-6",children:[e.jsx(_,{"data-loc":"client/src/pages/DeploymentWizard.tsx:600",children:e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:601",className:"flex items-center gap-3",children:[(()=>{const t=r[a-1].icon;return e.jsx(t,{"data-loc":"client/src/pages/DeploymentWizard.tsx:604",className:"h-8 w-8 text-primary"})})(),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:606",children:[e.jsx(S,{"data-loc":"client/src/pages/DeploymentWizard.tsx:607",className:"text-2xl",children:r[a-1].title}),e.jsx(w,{"data-loc":"client/src/pages/DeploymentWizard.tsx:608",className:"text-base",children:r[a-1].description})]})]})}),e.jsx(R,{"data-loc":"client/src/pages/DeploymentWizard.tsx:614",children:O()})]}),e.jsxs("div",{"data-loc":"client/src/pages/DeploymentWizard.tsx:618",className:"flex justify-between",children:[e.jsxs(n,{"data-loc":"client/src/pages/DeploymentWizard.tsx:619",variant:"outline",onClick:v,disabled:a===1,children:[e.jsx(I,{"data-loc":"client/src/pages/DeploymentWizard.tsx:624",className:"mr-2 h-4 w-4"}),"უკან"]}),e.jsxs(L,{"data-loc":"client/src/pages/DeploymentWizard.tsx:627",variant:"outline",className:"px-4 py-2",children:["ნაბიჯი ",a," / ",r.length]}),e.jsxs(n,{"data-loc":"client/src/pages/DeploymentWizard.tsx:630",onClick:f,disabled:a===r.length,children:["შემდეგი",e.jsx(k,{"data-loc":"client/src/pages/DeploymentWizard.tsx:635",className:"ml-2 h-4 w-4"})]})]})]})})}export{Y as default};
