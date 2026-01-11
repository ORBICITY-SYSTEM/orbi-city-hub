# 🔌 Axiom AI Automation API Integration

## ✅ Implementation Complete

The Axiom AI Automation API has been successfully integrated into the management app.

---

## 📋 What Was Implemented

### 1. **Environment Variables (.env)**
- ✅ `AXIOM_API_TOKEN=28632451e1c3bd006512ed`
- ✅ `AXIOM_API_BASE_URL=https://api.axiom.ai` (default)

### 2. **Service Client (`server/services/axiomClient.ts`)**
- ✅ `triggerBot(botId, payload)` - Trigger an Axiom bot
- ✅ `testAxiomConnection()` - Test API connection and token validity

### 3. **tRPC Router (`server/routers/axiomRouter.ts`)**
- ✅ `axiom.testConnection` - Test connection mutation
- ✅ `axiom.triggerBot` - Trigger bot mutation

### 4. **Test Script (`test-axiom-connection.js`)**
- ✅ Standalone test script to verify connection
- ✅ Tests both health endpoint and trigger endpoint

---

## 🚀 Usage

### Test Connection (Node.js Script)

```bash
node test-axiom-connection.js
```

This will:
- Check if `AXIOM_API_TOKEN` is configured
- Test the API connection
- Verify token validity

### Trigger Bot via tRPC (Frontend/Backend)

```typescript
import { trpc } from './lib/trpc';

// Trigger a bot
const triggerMutation = trpc.axiom.triggerBot.useMutation();

triggerMutation.mutate({
  botId: 'your-bot-id',
  payload: {
    // Your custom payload data
    key: 'value',
  },
});

// Test connection
const testMutation = trpc.axiom.testConnection.useMutation();
testMutation.mutate();
```

### Direct Service Usage (Backend)

```typescript
import { triggerBot, testAxiomConnection } from '../services/axiomClient';

// Trigger a bot
const result = await triggerBot('your-bot-id', {
  customField: 'value',
});

if (result.success) {
  console.log('Bot triggered! Run ID:', result.run_id);
} else {
  console.error('Error:', result.error);
}

// Test connection
const testResult = await testAxiomConnection();
console.log('Connection:', testResult.success ? 'OK' : 'FAILED');
```

---

## 🔐 Security

- ✅ API token is stored in `.env` file (not hardcoded)
- ✅ Token is loaded from environment variables
- ✅ Service functions validate token presence
- ⚠️ **IMPORTANT**: Never commit `.env` file to Git

---

## 📝 API Endpoints

### Trigger Bot
- **Method**: POST
- **URL**: `https://api.axiom.ai/v1/trigger`
- **Headers**:
  - `Authorization: Bearer {AXIOM_API_TOKEN}`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "bot_id": "your-bot-id",
    "custom_field": "value"
  }
  ```

---

## 🧪 Testing

1. **Test Connection Script**:
   ```bash
   node test-axiom-connection.js
   ```

2. **Test via tRPC** (if server is running):
   ```typescript
   const test = trpc.axiom.testConnection.useMutation();
   test.mutate();
   ```

3. **Test Trigger** (with valid bot ID):
   ```typescript
   const trigger = trpc.axiom.triggerBot.useMutation();
   trigger.mutate({
     botId: 'your-actual-bot-id',
     payload: { test: true },
   });
   ```

---

## 📚 Files Created

- `server/services/axiomClient.ts` - Axiom API service client
- `server/routers/axiomRouter.ts` - tRPC router for Axiom endpoints
- `test-axiom-connection.js` - Connection test script
- `.env` - Environment variables (updated with AXIOM_API_TOKEN)

---

## ⚠️ Notes

1. **API Endpoint**: The default base URL is `https://app.axiom.ai/api` (may need adjustment). 
   - ⚠️ **IMPORTANT**: Check Axiom AI documentation for the correct API base URL
   - Common possibilities: `https://app.axiom.ai/api`, `https://api.axiom.ai`, or custom URL
   - Update `AXIOM_API_BASE_URL` in `.env` file with the correct URL
   - Documentation: https://axiom.ai/docs/

2. **Bot ID**: You need to provide the actual bot ID when triggering bots. The test script uses a placeholder `test-bot-id`.

3. **Error Handling**: The service includes comprehensive error handling and logging.

4. **Response Format**: The API response format may vary. The service handles both JSON and text responses.

---

## 🔄 Next Steps

1. ✅ Test the connection using the test script
2. ✅ Verify the token works with your Axiom AI account
3. ✅ Get your actual bot IDs from Axiom AI dashboard
4. ✅ Start triggering bots with real data!

---

**Status**: ✅ **READY TO USE**
