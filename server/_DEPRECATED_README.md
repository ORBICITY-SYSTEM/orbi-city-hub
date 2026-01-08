# ⚠️ DEPRECATED: Server Directory

This directory contains the legacy Node.js/Express backend code that has been **deprecated** in the PowerStack 2025 architecture.

---

## Why is this deprecated?

According to the **[POWERSTACK_MANIFESTO.md](../POWERSTACK_MANIFESTO.md)**, all backend logic must run on **Google AppScript**, not Node.js servers. This ensures:

1. **Zero Server Costs:** No VPS or cloud compute bills.
2. **Google Integration:** Seamless connection to Sheets, Gmail, and Gemini.
3. **Simplicity:** One codebase (AppScript) instead of two (Node + AppScript).

---

## What should I use instead?

| Old (Deprecated) | New (PowerStack) |
|---|---|
| `server/routers/*.ts` | Google AppScript Functions |
| `server/db.ts` (Drizzle/SQL) | Google Sheets API |
| `server/utils/excelParser.ts` | Google Sheets (direct data entry) |
| `server/gmailBookingParser.ts` | Manual data bridge via Sheets |

---

## Can I delete this folder?

**Not yet.** Some files are still referenced by the build process. They have been replaced with **stubs** that return empty data and log deprecation warnings.

Once all frontend components are migrated to fetch data from AppScript, this folder can be safely removed.

---

## Migration Guide

1. Identify the data the component needs.
2. Ensure that data exists in the `OtelMS_Master_Data` Google Sheet.
3. Create or use an existing AppScript function to fetch and return that data as JSON.
4. Update the React component to call the AppScript URL instead of the tRPC endpoint.

---

**Last Updated:** December 2024
