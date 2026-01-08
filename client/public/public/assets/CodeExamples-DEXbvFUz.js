import{r as n,j as e,aV as i,aZ as l,a6 as p}from"./react-vendor-BIDRRw8F.js";import{C as d,b as m,c as g,d as x,B as u,a as h}from"./index-BLcOQO7i.js";import{T as C,a as E,b as f,c as y}from"./tabs-D52QQNv5.js";import"./trpc-vendor-wm-eNDph.js";import"./vendor-INCMKllo.js";const a={doPost:{title:"doPost ფუნქცია",description:"შემოსული WhatsApp შეტყობინებების დამუშავება",code:`function doPost(e) {
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
}`},callGemini:{title:"callGemini ფუნქცია",description:"Vertex AI Gemini-სთან კომუნიკაცია",code:`function callGemini(message, senderId) {
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
        parts: [{ text: systemPrompt + "

მომხმარებლის შეკითხვა: " + message }]
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
}`},sendWhatsApp:{title:"sendWhatsApp ფუნქცია",description:"პასუხის გაგზავნა WhatsApp-ში",code:`function sendWhatsApp(recipientId, message) {
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
}`},webhook:{title:"Webhook ვერიფიკაცია",description:"Meta Webhook-ის ვერიფიკაციის ფუნქცია",code:`function doGet(e) {
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
}`}};function O(){const[r,o]=n.useState(null),c=(s,t)=>{navigator.clipboard.writeText(s),o(t),p.success("კოდი დაკოპირებულია!"),setTimeout(()=>o(null),2e3)};return e.jsx("div",{"data-loc":"client/src/pages/CodeExamples.tsx:207",className:"min-h-screen bg-gradient-to-br from-background to-secondary py-12",children:e.jsxs("div",{"data-loc":"client/src/pages/CodeExamples.tsx:208",className:"container max-w-6xl",children:[e.jsxs("div",{"data-loc":"client/src/pages/CodeExamples.tsx:209",className:"text-center mb-12 animate-fade-in",children:[e.jsx("h1",{"data-loc":"client/src/pages/CodeExamples.tsx:210",className:"text-4xl md:text-5xl font-bold mb-4 text-gradient",children:"კოდის მაგალითები"}),e.jsx("p",{"data-loc":"client/src/pages/CodeExamples.tsx:213",className:"text-lg text-muted-foreground max-w-2xl mx-auto",children:"Google Apps Script ფუნქციები WhatsApp ბოტის იმპლემენტაციისთვის"})]}),e.jsxs(C,{"data-loc":"client/src/pages/CodeExamples.tsx:218",defaultValue:"doPost",className:"space-y-6",children:[e.jsx(E,{"data-loc":"client/src/pages/CodeExamples.tsx:219",className:"grid w-full grid-cols-2 lg:grid-cols-4",children:Object.entries(a).map(([s,t])=>e.jsx(f,{"data-loc":"client/src/pages/CodeExamples.tsx:221",value:s,children:t.title},s))}),Object.entries(a).map(([s,t])=>e.jsx(y,{"data-loc":"client/src/pages/CodeExamples.tsx:228",value:s,className:"animate-scale-in",children:e.jsxs(d,{"data-loc":"client/src/pages/CodeExamples.tsx:229",className:"shadow-elegant-lg",children:[e.jsx(m,{"data-loc":"client/src/pages/CodeExamples.tsx:230",children:e.jsxs("div",{"data-loc":"client/src/pages/CodeExamples.tsx:231",className:"flex items-start justify-between",children:[e.jsxs("div",{"data-loc":"client/src/pages/CodeExamples.tsx:232",children:[e.jsx(g,{"data-loc":"client/src/pages/CodeExamples.tsx:233",className:"text-2xl",children:t.title}),e.jsx(x,{"data-loc":"client/src/pages/CodeExamples.tsx:234",className:"mt-2",children:t.description})]}),e.jsx(u,{"data-loc":"client/src/pages/CodeExamples.tsx:238",variant:"outline",size:"sm",onClick:()=>c(t.code,t.title),children:r===t.title?e.jsx(i,{"data-loc":"client/src/pages/CodeExamples.tsx:244",className:"h-4 w-4"}):e.jsx(l,{"data-loc":"client/src/pages/CodeExamples.tsx:246",className:"h-4 w-4"})})]})}),e.jsx(h,{"data-loc":"client/src/pages/CodeExamples.tsx:251",children:e.jsx("pre",{"data-loc":"client/src/pages/CodeExamples.tsx:252",className:"bg-secondary p-6 rounded-lg overflow-x-auto",children:e.jsx("code",{"data-loc":"client/src/pages/CodeExamples.tsx:253",className:"text-sm",children:t.code})})})]})},s))]})]})})}export{O as default};
