# ORBI City Hub - Module Management Guide

## 📋 Overview

ORBI City Hub-ის ახალი არქიტექტურა აგებულია იერარქიული მოდულების სისტემაზე:

- **5 მთავარი მოდული** (CEO, Reservations, Finance, Marketing, Logistics)
- თითოეულ მთავარ მოდულს აქვს **5 ქვე-მოდული**
- თითოეულ მოდულს აქვს **დედიკირებული AI Agent**
- თითოეულ AI Agent-ს აქვს **Knowledge Base**
- **Main CEO Agent** აკონტროლებს ყველა სხვა აგენტს

---

## 🏗️ Module Structure

### 1. CEO Dashboard (Main Agent)
**Sub-Modules:**
- Overview - მიმოხილვა
- Analytics - ანალიტიკა
- Reports - რეპორტები
- Team - გუნდი
- Settings - პარამეტრები

**AI Agent:** Main CEO Agent
**Role:** Strategic Advisor & Multi-Agent Orchestrator
**Knowledge Base:** ყველა სხვა აგენტის ცოდნა + Business Strategy, Financial Analysis, Team Management

### 2. Reservations
**Sub-Modules:**
- Active Bookings - აქტიური ბრონირებები
- Calendar - კალენდარი
- Guest Profiles - სტუმრების პროფილები
- Channel Manager - არხების მენეჯერი
- Email Sync - ელფოსტის სინქრონიზაცია

**AI Agent:** Reservations AI Agent
**Role:** Booking Specialist & Guest Relations
**Knowledge Base:** Booking Platforms, Guest Communication, Pricing Strategies, etc.

### 3. Finance
**Sub-Modules:**
- P&L Dashboard - P&L დეშბორდი
- Revenue Analysis - შემოსავლის ანალიზი
- Expenses - ხარჯები
- Invoices - ინვოისები
- Reports - რეპორტები

**AI Agent:** Finance AI Agent
**Role:** Financial Analyst & Cost Optimizer
**Knowledge Base:** P&L Analysis, Revenue Optimization, Tax Compliance (Georgia), etc.

### 4. Marketing
**Sub-Modules:**
- Campaigns - კამპანიები
- Channels - არხები (15 distribution channels)
- Analytics - ანალიტიკა
- Content - კონტენტი
- ROI - ROI

**AI Agent:** Marketing AI Agent
**Role:** Marketing Strategist & Content Creator
**Knowledge Base:** Digital Marketing, Social Media, SEO/SEM, Content Strategy, etc.

### 5. Logistics
**Sub-Modules:**
- Inventory - ინვენტარი
- Housekeeping - დასუფთავება
- Maintenance - ტექნიკური მოვლა
- Supplies - მარაგები
- Staff - პერსონალი

**AI Agent:** Logistics AI Agent
**Role:** Operations Manager & Resource Optimizer
**Knowledge Base:** Inventory Management, Housekeeping Standards, Maintenance Scheduling, etc.

---

## 🔧 Management Functions

### 1. Rename Sub-Module

**Frontend Usage:**
```typescript
import { trpc } from "@/lib/trpc";

const renameMutation = trpc.modules.renameSubModule.useMutation();

// Example: Rename "Inventory" to "Stock Management"
await renameMutation.mutateAsync({
  moduleId: "logistics",
  subModuleId: "inventory",
  name: "Stock Management",
  nameGe: "მარაგის მართვა",
  description: "Advanced stock management and tracking",
  descriptionGe: "მოწინავე მარაგის მართვა და თვალყურის დევნება"
});
```

**Backend Usage:**
```typescript
import { renameSubModule } from "./server/moduleManagement";

const result = await renameSubModule({
  moduleId: "logistics",
  subModuleId: "inventory",
  name: "Stock Management",
  nameGe: "მარაგის მართვა"
});

console.log(result); // { success: true, message: "Sub-module inventory updated successfully" }
```

### 2. Add New Sub-Module

**Frontend Usage:**
```typescript
import { trpc } from "@/lib/trpc";

const addMutation = trpc.modules.addSubModule.useMutation();

// Example: Add "Quality Control" sub-module to Logistics
await addMutation.mutateAsync({
  moduleId: "logistics",
  id: "quality-control",
  name: "Quality Control",
  nameGe: "ხარისხის კონტროლი",
  icon: "CheckCircle",
  path: "/logistics/quality",
  description: "Quality assurance and inspections",
  descriptionGe: "ხარისხის უზრუნველყოფა და ინსპექციები"
});
```

**Backend Usage:**
```typescript
import { addSubModule } from "./server/moduleManagement";

const result = await addSubModule({
  moduleId: "logistics",
  id: "quality-control",
  name: "Quality Control",
  nameGe: "ხარისხის კონტროლი",
  icon: "CheckCircle",
  path: "/logistics/quality",
  description: "Quality assurance and inspections",
  descriptionGe: "ხარისხის უზრუნველყოფა და ინსპექციები"
});
```

### 3. Update Knowledge Base

**Frontend Usage:**
```typescript
import { trpc } from "@/lib/trpc";

const updateKBMutation = trpc.modules.updateKnowledgeBase.useMutation();

// Example: Update Logistics AI Agent knowledge base
await updateKBMutation.mutateAsync({
  moduleId: "logistics",
  topics: [
    "Inventory Management",
    "Quality Control",
    "Supply Chain Optimization",
    "Staff Training",
    "Preventive Maintenance",
    "Cost Reduction Strategies"
  ]
});
```

**Backend Usage:**
```typescript
import { updateKnowledgeBase } from "./server/moduleManagement";

const result = await updateKnowledgeBase({
  moduleId: "logistics",
  topics: [
    "Inventory Management",
    "Quality Control",
    "Supply Chain Optimization",
    "Staff Training"
  ]
});
```

### 4. Get Module Configuration

**Frontend Usage:**
```typescript
import { trpc } from "@/lib/trpc";

const { data: config } = trpc.modules.getConfiguration.useQuery();

// Access modules
console.log(config.modules); // Array of all modules

// Access specific module
const logisticsModule = config.modules.find(m => m.id === "logistics");
console.log(logisticsModule.subModules); // Array of 5 sub-modules
console.log(logisticsModule.aiAgent.knowledgeBase); // Array of knowledge topics
```

---

## 🤖 AI Agent Integration

### Main CEO Agent

Main CEO Agent-ს აქვს წვდომა **ყველა სხვა აგენტის knowledge base-ზე** და აკონტროლებს მათ მუშაობას.

**Example Prompt:**
```
User: "რა არის ჩემი ბიზნესის მთავარი პრობლემები?"

Main CEO Agent Response:
"ვანალიზებ ყველა მოდულიდან მონაცემებს:

1. **Reservations Agent რეპორტი:** 
   - Booking.com-ზე გაუქმებების მაჩვენებელი გაიზარდა 15%-ით
   - Airbnb-ზე საშუალო ფასი 12% დაბალია კონკურენტებთან შედარებით

2. **Finance Agent რეპორტი:**
   - ხარჯები გაიზარდა 8% ბოლო თვეში
   - Utilities ხარჯები 23% მაღალია ინდუსტრიის საშუალოზე

3. **Logistics Agent რეპორტი:**
   - 15 სტუდიოში დასუფთავების ხარისხი დაბალია სტანდარტზე
   - Inventory-ში 23 პოზიცია არის low stock status-ში

**რეკომენდაციები:**
1. გაზარდე ფასები Airbnb-ზე 10-12%-ით
2. შეამოწმე Utilities ხარჯები და მოძებნე ოპტიმიზაციის გზები
3. გაზარდე დასუფთავების პერსონალის ტრენინგი"
```

### Module-Specific Agents

თითოეული მოდულის AI Agent სპეციალიზირებულია თავის სფეროში:

**Reservations Agent Example:**
```
User: "როგორ გავზარდო bookings-ები Booking.com-ზე?"

Reservations Agent:
"ვანალიზებ Booking.com-ის performance-ს:

**მიმდინარე მეტრიკები:**
- Visibility Score: 7.2/10
- Review Score: 9.1/10
- Response Rate: 89%
- Response Time: 4.2 hours

**რეკომენდაციები:**
1. გააუმჯობესე Response Time-ი 1 საათამდე (ზრდის visibility-ს 15%-ით)
2. დაამატე 5+ ახალი ფოტო (professional photography)
3. გააქტიურე "Genius" პროგრამა (10% discount for Genius members)
4. შექმენი special offers სეზონგარეშე პერიოდებისთვის

**მოსალოდნელი შედეგი:** +25-30% bookings ზრდა 2 თვეში"
```

---

## 📊 Database Storage

Module configuration ინახება `systemConfig` table-ში:

```sql
SELECT * FROM systemConfig WHERE key = 'module_configuration';
```

**Structure:**
```json
{
  "modules": [
    {
      "id": "logistics",
      "name": "Logistics",
      "nameGe": "ლოგისტიკა",
      "subModules": [
        {
          "id": "inventory",
          "name": "Inventory",
          "nameGe": "ინვენტარი",
          ...
        }
      ],
      "aiAgent": {
        "name": "Logistics AI Agent",
        "role": "Operations Manager",
        "knowledgeBase": [...]
      }
    }
  ]
}
```

---

## 🎯 Use Cases

### Use Case 1: Add Custom Sub-Module

```typescript
// Add "Guest Feedback" sub-module to Reservations
await trpc.modules.addSubModule.mutateAsync({
  moduleId: "reservations",
  id: "guest-feedback",
  name: "Guest Feedback",
  nameGe: "სტუმრების გამოხმაურება",
  icon: "MessageSquare",
  path: "/reservations/feedback",
  description: "Collect and analyze guest feedback",
  descriptionGe: "სტუმრების გამოხმაურების შეგროვება და ანალიზი"
});
```

### Use Case 2: Customize Knowledge Base

```typescript
// Expand Finance AI Agent knowledge with Georgian tax laws
await trpc.modules.updateKnowledgeBase.mutateAsync({
  moduleId: "finance",
  topics: [
    "P&L Analysis",
    "Revenue Optimization",
    "Georgian Tax Code 2024",
    "VAT Compliance Georgia",
    "Tourism Industry Tax Benefits",
    "Financial Forecasting",
    "Budget Planning"
  ]
});
```

### Use Case 3: Rename for Branding

```typescript
// Rename "CEO Dashboard" to "Executive Command Center"
await trpc.modules.renameSubModule.mutateAsync({
  moduleId: "ceo",
  subModuleId: "overview",
  name: "Command Center",
  nameGe: "სამართავი ცენტრი",
  description: "Executive command and control center",
  descriptionGe: "აღმასრულებელი სამართავი ცენტრი"
});
```

---

## 🚀 Next Steps

1. **Implement Sub-Module Pages:** შექმენი რეალური კომპონენტები თითოეული ქვე-მოდულისთვის
2. **Connect AI Agents:** დააკავშირე AI agents რეალურ მონაცემებთან
3. **Add Multi-Agent Communication:** Main CEO Agent-მა უნდა დაუკავშირდეს სხვა agents-ს
4. **Create Knowledge Base System:** შექმენი vector database AI agents-ის knowledge-სთვის

---

## 📝 API Reference

### tRPC Endpoints

```typescript
trpc.modules.getConfiguration.useQuery()
// Returns: { modules: Module[] }

trpc.modules.renameSubModule.useMutation()
// Input: SubModuleUpdate
// Returns: { success: boolean, message: string }

trpc.modules.addSubModule.useMutation()
// Input: NewSubModule
// Returns: { success: boolean, message: string }

trpc.modules.updateKnowledgeBase.useMutation()
// Input: KnowledgeBaseUpdate
// Returns: { success: boolean, message: string }
```

### TypeScript Types

```typescript
interface Module {
  id: string;
  name: string;
  nameGe: string;
  icon: string;
  path: string;
  description: string;
  descriptionGe: string;
  subModules: SubModule[];
  aiAgent: {
    name: string;
    role: string;
    knowledgeBase: string[];
  };
}

interface SubModule {
  id: string;
  name: string;
  nameGe: string;
  icon: string;
  path: string;
  description: string;
  descriptionGe: string;
}
```

---

**Created by:** Manus AI Agent
**Date:** November 24, 2025
**Project:** ORBI City Hub
