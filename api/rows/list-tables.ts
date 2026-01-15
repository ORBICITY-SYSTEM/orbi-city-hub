import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Utility endpoint to list pages and tables for a given Rows spreadsheet.
 * Usage: /api/rows/list-tables?spreadsheetId=XXXX
 * Returns minimal info: page name, table name, table_id.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ROWS_API_KEY = process.env.ROWS_API_KEY;
  const spreadsheetId = typeof req.query.spreadsheetId === "string" ? req.query.spreadsheetId : undefined;

  if (!ROWS_API_KEY) {
    return res.status(200).json({ error: "ROWS_API_KEY not configured" });
  }
  if (!spreadsheetId) {
    return res.status(200).json({ error: "spreadsheetId query param is required" });
  }

  try {
    const url = `https://api.rows.com/v1/spreadsheets/${spreadsheetId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ROWS_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res
        .status(200)
        .json({ error: `Rows API error ${response.status}: ${text.substring(0, 200)}` });
    }

    const json = await response.json();
    const pages = json.pages || [];
    const tables: Array<{ page: string; table: string; table_id: string }> = [];

    pages.forEach((page: any) => {
      const pageName = page.name || "Unnamed page";
      (page.tables || []).forEach((table: any) => {
        tables.push({
          page: pageName,
          table: table.name || "Unnamed table",
          table_id: table.id,
        });
      });
    });

    return res.status(200).json({ spreadsheetId, tables });
  } catch (err) {
    return res.status(200).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
