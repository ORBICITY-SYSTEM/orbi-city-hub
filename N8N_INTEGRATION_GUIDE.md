# 🔗 n8n Integration Guide - ORBI City Hub

## Overview

This guide explains how to integrate n8n workflows with the ORBI City Hub Chat Module to receive and manage guest messages.

---

## 📡 Webhook Endpoint

### **POST /api/trpc/n8nWebhook.receiveGuestMessage**

**Base URL:** `https://team.orbicitybatumi.com`

**Full Endpoint:** `https://team.orbicitybatumi.com/api/trpc/n8nWebhook.receiveGuestMessage`

---

## 📥 Request Format

### **Headers**
```
Content-Type: application/json
```

### **Body (JSON)**
```json
{
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+995555123456",
  "message": "Hello, I would like to book a room for next week.",
  "source": "whatsapp",
  "metadata": {
    "conversationId": "abc123",
    "platform": "WhatsApp Business",
    "timestamp": "2024-12-02T10:30:00Z"
  }
}
```

### **Field Descriptions**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `guestName` | string | ✅ Yes | Guest's full name |
| `guestEmail` | string | ❌ No | Guest's email address |
| `guestPhone` | string | ❌ No | Guest's phone number |
| `message` | string | ✅ Yes | Message content from guest |
| `source` | string | ❌ No | Message source (default: "n8n") |
| `metadata` | object | ❌ No | Additional data (JSON object) |

---

## 📤 Response Format

### **Success Response (200 OK)**
```json
{
  "result": {
    "data": {
      "success": true,
      "messageId": 123,
      "guestId": 456,
      "message": "Guest message received successfully"
    }
  }
}
```

### **Error Response (400/500)**
```json
{
  "error": {
    "message": "Failed to save guest message",
    "code": "INTERNAL_SERVER_ERROR"
  }
}
```

---

## 🔧 n8n Workflow Setup

### **Step 1: Create Webhook Trigger**

1. Add **Webhook** node to your n8n workflow
2. Set **HTTP Method:** POST
3. Set **Path:** `/guest-message` (or any path you prefer)
4. **Authentication:** None (or configure as needed)

### **Step 2: Process Incoming Data**

Add **Function** node to transform incoming data:

```javascript
// Example: Transform WhatsApp message to ORBI format
const guestName = $input.item.json.contact.name;
const guestPhone = $input.item.json.contact.phone;
const message = $input.item.json.message.text;

return {
  json: {
    guestName: guestName,
    guestPhone: guestPhone,
    message: message,
    source: "whatsapp",
    metadata: {
      conversationId: $input.item.json.id,
      platform: "WhatsApp Business",
      timestamp: new Date().toISOString()
    }
  }
};
```

### **Step 3: Send to ORBI Hub**

Add **HTTP Request** node:

- **Method:** POST
- **URL:** `https://team.orbicitybatumi.com/api/trpc/n8nWebhook.receiveGuestMessage`
- **Authentication:** None
- **Body Content Type:** JSON
- **Body:** `{{ $json }}`

### **Step 4: Handle Response**

Add **IF** node to check response:

```javascript
// Check if message was saved successfully
return $input.item.json.result.data.success === true;
```

---

## 🎯 Example n8n Workflows

### **Example 1: WhatsApp to ORBI Chat**

```
Webhook (WhatsApp) 
  → Function (Transform Data) 
  → HTTP Request (Send to ORBI) 
  → IF (Check Success) 
  → Send Confirmation
```

### **Example 2: Email to ORBI Chat**

```
Email Trigger (IMAP) 
  → Function (Extract Email Data) 
  → HTTP Request (Send to ORBI) 
  → IF (Check Success) 
  → Mark Email as Read
```

### **Example 3: Telegram to ORBI Chat**

```
Telegram Trigger 
  → Function (Format Message) 
  → HTTP Request (Send to ORBI) 
  → Telegram Reply (Confirmation)
```

---

## 📊 Chat Module Features

### **1. Message Management**
- ✅ View all incoming messages
- ✅ Mark messages as read/unread
- ✅ Filter by status (unread, read, replied)
- ✅ Auto-refresh every 30 seconds

### **2. Guest Management**
- ✅ Automatic guest creation
- ✅ Duplicate detection (by email/phone)
- ✅ Guest profile with contact info

### **3. Reply System**
- ✅ Send replies from dashboard
- ✅ Reply history tracking
- ✅ Status updates (replied)

---

## 🔍 Testing

### **Using cURL**

```bash
curl -X POST https://team.orbicitybatumi.com/api/trpc/n8nWebhook.receiveGuestMessage \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Test User",
    "guestEmail": "test@example.com",
    "message": "This is a test message from n8n",
    "source": "test"
  }'
```

### **Using Postman**

1. **Method:** POST
2. **URL:** `https://team.orbicitybatumi.com/api/trpc/n8nWebhook.receiveGuestMessage`
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "guestName": "Test User",
  "guestEmail": "test@example.com",
  "message": "Test message",
  "source": "postman"
}
```

---

## 🚀 Deployment Checklist

- [ ] n8n workflow created and tested
- [ ] Webhook endpoint configured
- [ ] Test message sent successfully
- [ ] Chat module displays messages correctly
- [ ] Reply functionality working
- [ ] Auto-refresh enabled (30s interval)

---

## 📞 Support

For issues or questions:
- **Dashboard:** https://team.orbicitybatumi.com/reservations/guests
- **Email:** info@orbicitybatumi.com
- **Documentation:** This file

---

## 🔐 Security Notes

1. **HTTPS Only:** Always use HTTPS in production
2. **Rate Limiting:** Consider adding rate limiting to prevent abuse
3. **Authentication:** Add API key authentication for production use
4. **Input Validation:** All inputs are validated server-side
5. **SQL Injection:** Protected by Drizzle ORM parameterized queries

---

## 📝 Changelog

### v1.0.0 (2024-12-02)
- ✅ Initial release
- ✅ Chat messages table
- ✅ n8n webhook endpoint
- ✅ Chat UI with reply functionality
- ✅ Auto-refresh every 30 seconds
- ✅ Guest management integration

---

**Happy Integrating! 🎉**
