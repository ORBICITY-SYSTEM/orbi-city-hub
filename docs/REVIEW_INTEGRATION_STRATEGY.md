# ORBI City Batumi - Review Integration Strategy

## შენი 15 არხის კატეგორიზაცია

---

## ✅ კატეგორია 1: უფასო ოფიციალური API (FREE)

| არხი | მეთოდი | სირთულე | რეკომენდაცია |
|------|--------|---------|--------------|
| **Google Business** | Google Business Profile API | საშუალო | ✅ გამოვიყენოთ! უფასო, ოფიციალური |
| **Facebook** | Graph API | საშუალო | ✅ გამოვიყენოთ! უფასო, ოფიციალური |
| **TripAdvisor** | Content API (ლიცენზირებული) | რთული | ⚠️ საჭიროებს პარტნიორობას |

**რა გავაკეთო:** Google და Facebook API-ები პირდაპირ ORBI Hub-ს დავუკავშირო.

---

## 📧 კატეგორია 2: Email Parsing (უფასო)

| არხი | როგორ მუშაობს | რეკომენდაცია |
|------|---------------|--------------|
| **Booking.com** | ყოველი რევიუ მოდის email-ზე | ✅ N8N + Gmail = უფასო! |
| **Expedia** | Review notification emails | ✅ N8N + Gmail = უფასო! |
| **Agoda** | Review notification emails | ✅ N8N + Gmail = უფასო! |
| **Airbnb** | Review notification emails | ✅ N8N + Gmail = უფასო! |
| **Hostelworld** | Review notification emails | ✅ N8N + Gmail = უფასო! |

**როგორ მუშაობს:**
1. OTA აგზავნის email-ს როცა ახალი რევიუ მოდის
2. N8N უყურებს Gmail-ს (Gmail Trigger)
3. N8N პარსავს email-ს და ამოიღებს რევიუს
4. N8N აგზავნის ORBI Hub-ში

**ფასი:** $0 (N8N self-hosted უფასოა)

---

## 💰 კატეგორია 3: Outscraper (ფასიანი - მხოლოდ საჭიროების შემთხვევაში)

| არხი | რატომ Outscraper? | ფასი/თვე |
|------|-------------------|----------|
| **Ostrovok.ru** | რუსული პლატფორმა, API არ აქვს | ~$5 |
| **Sutochno.com** | რუსული პლატფორმა, API არ აქვს | ~$5 |
| **Bronevik.com** | რუსული პლატფორმა, API არ აქვს | ~$5 |
| **Tvil.ru** | რუსული პლატფორმა, API არ აქვს | ~$5 |

**შენიშვნა:** რუსულ პლატფორმებს ჩვეულებრივ არ აქვთ API. Outscraper ან N8N scraping საჭიროა.

---

## 🚫 კატეგორია 4: რევიუები არ აქვს (Social/Video)

| არხი | ტიპი | რევიუები? |
|------|------|-----------|
| **Instagram** | Social Media | ❌ კომენტარები, არა რევიუები |
| **TikTok** | Video | ❌ კომენტარები, არა რევიუები |
| **YouTube** | Video | ❌ კომენტარები, არა რევიუები |
| **orbicitybatumi.com** | Own Website | ❌ საკუთარი საიტი |

---

## 🎯 რეკომენდებული სტრატეგია

### პრიორიტეტი 1: უფასო გადაწყვეტილებები (დაუყოვნებლივ)

```
Google Reviews ──► Google API ──► ORBI Hub (უფასო)
Facebook Reviews ──► Graph API ──► ORBI Hub (უფასო)
```

### პრიორიტეტი 2: Email Parsing N8N-ით (1-2 კვირა)

```
Booking.com Email ──► Gmail ──► N8N ──► ORBI Hub (უფასო)
Expedia Email ──► Gmail ──► N8N ──► ORBI Hub (უფასო)
Agoda Email ──► Gmail ──► N8N ──► ORBI Hub (უფასო)
Airbnb Email ──► Gmail ──► N8N ──► ORBI Hub (უფასო)
```

### პრიორიტეტი 3: რუსული პლატფორმები (თუ საჭიროა)

```
Ostrovok ──► Outscraper ──► N8N ──► ORBI Hub (~$20/თვე ყველასთვის)
Sutochno ──► Outscraper ──► N8N ──► ORBI Hub
Bronevik ──► Outscraper ──► N8N ──► ORBI Hub
Tvil.ru ──► Outscraper ──► N8N ──► ORBI Hub
```

---

## 💵 ხარჯების შედარება

| მეთოდი | თვიური ხარჯი | არხების რაოდენობა |
|--------|--------------|-------------------|
| **მხოლოდ Outscraper** | ~$80-100/თვე | ყველა |
| **API + Email + Outscraper** | ~$20/თვე | ყველა |
| **მხოლოდ API + Email** | $0/თვე | 9 არხი (რუსულის გარეშე) |

---

## ✅ დასკვნა

**Outscraper ჩამოშალე:**
- Google Reviews - გამოიყენე Google API (უფასო)
- Facebook Reviews - გამოიყენე Graph API (უფასო)
- Booking/Expedia/Agoda/Airbnb - გამოიყენე Email Parsing (უფასო)

**Outscraper დატოვე მხოლოდ:**
- რუსული პლატფორმებისთვის (Ostrovok, Sutochno, Bronevik, Tvil)
- ან საერთოდ გამორთე თუ რუსული ბაზარი არ გაინტერესებს

---

## შემდეგი ნაბიჯები

1. [ ] Google Business Profile API დაკავშირება
2. [ ] Facebook Graph API დაკავშირება  
3. [ ] N8N Gmail Trigger workflow-ების შექმნა
4. [ ] Outscraper-ის გამორთვა Google/Facebook-ისთვის
5. [ ] ORBI Hub endpoint-ების განახლება
