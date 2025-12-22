# THE POWERSTACK PHILOSOPHY (2025)

This document is the constitution of the PowerStack HotelOS project. Every line of code, every architectural decision, and every feature must align with these principles.

---

## 1. IDENTITY

- **We are a Boutique Operator:** We manage **60 Apartments** in Batumi (Orbi City), not the entire complex. Our software is tailored for this specific, high-density, single-location operation.
- **Our Goal is Efficiency:** Fastest, Cheapest, Most Stable, Most Profitable. Every feature must directly contribute to one of these four pillars. We are not building a generic, feature-rich ERP; we are building a lean, profitable operating system.

---

## 2. THE BRAIN (Tech Stack Rules)

- **Gemini is the Director:** AI is not a feature; it is the core. Gemini makes decisions, writes text, analyzes data, and automates communication. All modules must be designed to either feed data to Gemini or execute actions based on its output.
- **Google Sheets is the Database:** We do **NOT** use SQL, Supabase, or any traditional database. Google Sheets is our "Single Source of Truth". It is free, infinitely scalable for our needs, and accessible to non-technical staff. All data must be structured and managed within Sheets.
- **AppScript is the Engine:** All backend logic (APIs, Triggers, Alerts, Integrations) runs on Google AppScript. It is serverless, free, and deeply integrated with our Google Workspace ecosystem.
- **React is the Face:** The UI is a stateless, responsive display and input layer. It fetches JSON from AppScript and renders it. The UI contains zero business logic.

---

## 3. ZERO OVERHEAD RULE

- **No Paid Servers:** If a feature requires a paid server (e.g., Node.js on a VPS, dedicated database hosting), we do not build it. All computation must be handled by Vercel (frontend) or Google AppScript (backend).
- **No Licensing Fees:** If a feature requires a monthly software license, we build a free alternative using the tools available in Google Workspace (Sheets, Docs, Forms, Gmail) and the Gemini API.

---

This manifesto is the single source of truth for our development strategy. Any deviation requires explicit approval from the project lead.

**Signed,**

**The PowerStack Team**
**December 2024**
