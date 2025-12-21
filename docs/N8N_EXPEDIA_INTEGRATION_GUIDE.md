# N8N + Expedia Reviews Integration Guide
## ORBI City Hub - Real-Time Review Dashboard

**ავტორი:** Manus AI  
**თარიღი:** 2025 წლის 22 დეკემბერი  
**ვერსია:** 1.0

---

## შესავალი

ეს დოკუმენტი აღწერს დეტალურ გეგმას, თუ როგორ უნდა მოხდეს Expedia-ს რევიუების ავტომატური იმპორტი ORBI City Hub დეშბორდზე N8N workflow automation პლატფორმის გამოყენებით. გეგმა მოიცავს ორ მეთოდს: **Webhook-ზე დაფუძნებულ real-time სინქრონიზაციას** და **Email Parsing-ზე დაფუძნებულ ალტერნატივას**.

---

## არქიტექტურის მიმოხილვა

```
┌─────────────────┐     Webhook      ┌─────────────┐     HTTP POST     ┌─────────────────┐
│  Expedia API    │ ───────────────► │    N8N      │ ─────────────────► │  ORBI City Hub  │
│  (GraphQL)      │                  │  Workflow   │                    │  /api/reviews   │
└─────────────────┘                  └─────────────┘                    └─────────────────┘
        │                                   │
        │  ალტერნატივა                      │
        ▼                                   │
┌─────────────────┐     Email Trigger       │
│  Gmail Inbox    │ ────────────────────────┘
│  (Review Alert) │
└─────────────────┘
```

---

## მეთოდი 1: Expedia GraphQL API + N8N (რეკომენდებული)

### წინაპირობები

| კომპონენტი | აღწერა | სტატუსი |
|-----------|--------|---------|
| Expedia Partner Central | სასტუმროს ანგარიში Expedia-ზე | ✅ გაქვთ |
| Expedia API Credentials | Client ID და Client Secret | ⚠️ საჭიროა მოთხოვნა |
| N8N Instance | Self-hosted ან Cloud | ⚠️ საჭიროა დაყენება |
| ORBI Hub Endpoint | `/api/n8n/reviews` | ✅ შევქმნით |

### ნაბიჯი 1: Expedia API Credentials-ის მოპოვება

Expedia-ს GraphQL API-ზე წვდომისთვის საჭიროა Partner Central-ში API credentials-ის მოთხოვნა. პროცესი შემდეგია:

1. შედით [Expedia Partner Central](https://apps.expediapartnercentral.com/)-ში
2. გადადით **Account Settings** → **API Access**
3. მოითხოვეთ API credentials (Client ID, Client Secret)
4. მიიღებთ Property ID-ს (EID)

> **შენიშვნა:** Expedia-ს API credentials-ის მიღებას შეიძლება რამდენიმე დღე დასჭირდეს დამტკიცებისთვის. [1]

### ნაბიჯი 2: N8N Workflow-ის შექმნა

N8N-ში შექმენით ახალი workflow შემდეგი კომპონენტებით:

**Trigger Options:**

| Trigger Type | აღწერა | სიხშირე |
|-------------|--------|---------|
| **Webhook Trigger** | Expedia აგზავნის webhook-ს ახალი რევიუს დროს | Real-time |
| **Schedule Trigger** | N8N თვითონ იღებს რევიუებს დაგეგმილ დროს | ყოველ 6 საათში |

**რეკომენდებული: Schedule Trigger + GraphQL Query**

```
[Schedule Trigger] → [HTTP Request (GraphQL)] → [Transform Data] → [HTTP Request (ORBI Hub)]
     ↓                      ↓                         ↓                    ↓
  ყოველ 6 სთ          Expedia API              JSON Mapping         POST /api/n8n/reviews
```

### ნაბიჯი 3: GraphQL Query N8N-ში

N8N-ის HTTP Request node-ში გამოიყენეთ შემდეგი კონფიგურაცია:

| პარამეტრი | მნიშვნელობა |
|----------|-------------|
| Method | POST |
| URL | `https://api.expediagroup.com/supply/lodging/graphql` |
| Authentication | OAuth2 |
| Content-Type | application/json |

**GraphQL Query:**

```graphql
query GetReviews {
  property(id: "YOUR_PROPERTY_ID", idSource: EXPEDIA) {
    reviews(pageSize: 50) {
      totalCount
      cursor
      reviews {
        id
        status
        brandName
        createdDateTime
        title {
          value
          locale
        }
        body {
          value
          locale
        }
        starRatings {
          category
          value
        }
        reservation {
          primaryGuest {
            firstName
            lastName
          }
        }
        isEligibleForResponse
      }
    }
  }
}
```

### ნაბიჯი 4: მონაცემების ტრანსფორმაცია

N8N-ის Code node-ში გარდაქმენით Expedia-ს პასუხი ORBI Hub-ის ფორმატში:

```javascript
// N8N Code Node
const reviews = $input.all()[0].json.data.property.reviews.reviews;

return reviews.map(review => ({
  json: {
    platform: 'expedia',
    externalId: review.id,
    guestName: `${review.reservation?.primaryGuest?.firstName || ''} ${review.reservation?.primaryGuest?.lastName || ''}`.trim() || 'Anonymous',
    rating: review.starRatings.find(r => r.category === 'OVERALL')?.value || 0,
    title: review.title?.value || '',
    content: review.body?.value || '',
    reviewDate: review.createdDateTime,
    language: review.title?.locale || 'en',
    categories: review.starRatings.reduce((acc, r) => {
      acc[r.category.toLowerCase()] = r.value;
      return acc;
    }, {}),
    isEligibleForResponse: review.isEligibleForResponse,
    source: 'n8n_sync'
  }
}));
```

### ნაბიჯი 5: ORBI Hub-ში გაგზავნა

N8N-ის HTTP Request node-ით გაგზავნეთ მონაცემები ORBI Hub-ში:

| პარამეტრი | მნიშვნელობა |
|----------|-------------|
| Method | POST |
| URL | `https://hub.orbicitybatumi.com/api/n8n/reviews` |
| Authentication | API Key Header |
| Header Name | `X-N8N-API-Key` |
| Body | JSON (from previous node) |

---

## მეთოდი 2: Email Parsing (ალტერნატივა API-ს გარეშე)

თუ Expedia API credentials-ის მიღება რთულია, შეგიძლიათ გამოიყენოთ Email Parsing მეთოდი. Expedia აგზავნის email notification-ს ყოველი ახალი რევიუს დროს.

### როგორ მუშაობს

```
[Expedia] → [Email to Partner] → [Gmail] → [N8N Gmail Trigger] → [Parse Email] → [ORBI Hub]
```

### N8N Workflow Email Parsing-ისთვის

**Trigger:** Gmail Trigger
- Label: `expedia-reviews` (შექმენით Gmail-ში)
- Poll interval: 5 წუთი

**Filter:** 
- From: `*@expediagroup.com` ან `*@expedia.com`
- Subject contains: `review` ან `feedback`

**Code Node (Email Parsing):**

```javascript
// Parse Expedia review notification email
const emailBody = $input.first().json.text;
const emailSubject = $input.first().json.subject;

// Extract review details using regex
const ratingMatch = emailBody.match(/Rating:\s*(\d+(?:\.\d+)?)/i);
const guestMatch = emailBody.match(/Guest:\s*([^\n]+)/i);
const reviewMatch = emailBody.match(/Review:\s*"([^"]+)"/i);

return [{
  json: {
    platform: 'expedia',
    externalId: `email_${Date.now()}`,
    guestName: guestMatch ? guestMatch[1].trim() : 'Guest',
    rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
    content: reviewMatch ? reviewMatch[1] : emailBody.substring(0, 500),
    reviewDate: new Date().toISOString(),
    source: 'email_parsing'
  }
}];
```

---

## ORBI Hub API Endpoint

ORBI Hub-ში უნდა შევქმნათ უნივერსალური endpoint N8N-დან მონაცემების მისაღებად:

### Endpoint Specification

| პარამეტრი | მნიშვნელობა |
|----------|-------------|
| URL | `POST /api/n8n/reviews` |
| Authentication | API Key (`X-N8N-API-Key` header) |
| Content-Type | application/json |

### Request Body Schema

```typescript
interface N8NReviewPayload {
  platform: 'expedia' | 'booking' | 'airbnb' | 'google' | 'tripadvisor';
  externalId: string;
  guestName: string;
  rating: number; // 1-10 for Expedia, 1-5 for others
  title?: string;
  content: string;
  reviewDate: string; // ISO 8601
  language?: string;
  categories?: Record<string, number>;
  isEligibleForResponse?: boolean;
  source: 'n8n_sync' | 'email_parsing' | 'webhook';
}
```

### Response

```json
{
  "success": true,
  "reviewId": "uuid",
  "message": "Review imported successfully",
  "isDuplicate": false
}
```

---

## იმპლემენტაციის გეგმა

### ფაზა 1: ინფრასტრუქტურა (1-2 დღე)

| დავალება | პასუხისმგებელი | სტატუსი |
|---------|---------------|---------|
| N8N instance-ის დაყენება | თქვენ | ⏳ |
| ORBI Hub `/api/n8n/reviews` endpoint | Manus | 🔜 |
| API Key generation system | Manus | 🔜 |

### ფაზა 2: Expedia ინტეგრაცია (3-5 დღე)

| დავალება | პასუხისმგებელი | სტატუსი |
|---------|---------------|---------|
| Expedia API credentials მოთხოვნა | თქვენ | ⏳ |
| N8N workflow შექმნა | თქვენ + Manus | ⏳ |
| ტესტირება sandbox-ში | ერთად | ⏳ |

### ფაზა 3: სხვა პლატფორმები (1-2 კვირა)

| პლატფორმა | მეთოდი | პრიორიტეტი |
|----------|--------|-----------|
| Booking.com | Email Parsing | მაღალი |
| Airbnb | Email Parsing | მაღალი |
| Google | Official API | მაღალი |
| TripAdvisor | Email Parsing | საშუალო |

---

## რა გჭირდებათ ჩემგან

ამ გეგმის განსახორციელებლად მე შემიძლია გავაკეთო:

1. **ORBI Hub API Endpoint** - `/api/n8n/reviews` უნივერსალური endpoint ყველა პლატფორმისთვის
2. **API Key System** - უსაფრთხო ავთენტიფიკაცია N8N-ORBI Hub კავშირისთვის
3. **Duplicate Detection** - იგივე რევიუს ორჯერ არ შემოიტანს
4. **N8N Workflow Templates** - JSON ფაილები რომლებიც N8N-ში იმპორტირდება

---

## რა გჭირდებათ თქვენგან

1. **N8N Instance** - დააყენეთ N8N (self-hosted ან cloud)
   - Self-hosted: უფასო, საჭიროებს სერვერს
   - Cloud: $20/თვე, მარტივი setup

2. **Expedia API Access** - მოითხოვეთ Partner Central-ში

3. **Gmail App Password** - N8N-ისთვის Gmail-ზე წვდომისთვის (Email Parsing მეთოდისთვის)

---

## დასკვნა

Expedia-ს რევიუების ORBI Hub-ში ინტეგრაცია შესაძლებელია ორი გზით: **ოფიციალური GraphQL API** (რეკომენდებული) ან **Email Parsing** (ალტერნატივა). ორივე შემთხვევაში N8N მოქმედებს როგორც შუამავალი, რომელიც აგროვებს მონაცემებს და აგზავნის ORBI Hub-ში სტანდარტიზებული ფორმატით.

ეს მიდგომა საშუალებას იძლევა მომავალში მარტივად დაემატოს სხვა პლატფორმებიც (Booking, Airbnb, Google) იმავე ინფრასტრუქტურის გამოყენებით.

---

## References

[1] Expedia Group Developers. "Intro to Reviews - Lodging Supply GraphQL API." https://developers.expediagroup.com/supply/lodging/docs/property_mgmt_apis/reviews/getting_started/intro/

---

**შემდეგი ნაბიჯი:** გსურთ რომ შევქმნა ORBI Hub-ში `/api/n8n/reviews` endpoint?
