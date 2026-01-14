import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ROWS_API_KEY = Deno.env.get('ROWS_API_KEY');
const SPREADSHEET_ID = Deno.env.get('ROWS_SPREADSHEET_ID');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if secrets are configured
    if (!ROWS_API_KEY) {
      console.error('Missing ROWS_API_KEY');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ROWS_API_KEY is not configured' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SPREADSHEET_ID) {
      console.error('Missing ROWS_SPREADSHEET_ID');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ROWS_SPREADSHEET_ID is not configured' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Testing connection to spreadsheet: ${SPREADSHEET_ID}`);

    // Make a lightweight request to get spreadsheet info
    const url = `https://api.rows.com/v1/spreadsheets/${SPREADSHEET_ID}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ROWS_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Rows API response status:', response.status);
    console.log('Rows API response:', responseText.substring(0, 500));

    if (!response.ok) {
      let errorMessage = `Rows API error: ${response.status}`;
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Provide user-friendly error messages
        if (response.status === 401) {
          errorMessage = 'ROWS_API_KEY is invalid or expired';
        } else if (response.status === 403) {
          errorMessage = 'API Key does not have access to this spreadsheet';
        } else if (response.status === 404) {
          errorMessage = 'Spreadsheet not found. Please check ROWS_SPREADSHEET_ID';
        } else if (errorData.message?.includes('spreadsheet_id is invalid')) {
          errorMessage = 'ROWS_SPREADSHEET_ID format is incorrect. Use spreadsheet ID (e.g., 5HGcWJFcQVVAv4mNTYb2RS) and not URL';
        }
      } catch {
        // Keep default error message
      }

      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          details: `Status: ${response.status}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse successful response
    let spreadsheetInfo;
    try {
      spreadsheetInfo = JSON.parse(responseText);
    } catch {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid response from Rows API'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const spreadsheetName = spreadsheetInfo.name || 'Unknown';
    const pagesCount = spreadsheetInfo.pages?.length || 0;
    const tablesCount = spreadsheetInfo.pages?.reduce(
      (sum: number, page: { tables?: unknown[] }) => sum + (page.tables?.length || 0),
      0
    ) || 0;

    console.log(`Connection successful! Spreadsheet: ${spreadsheetName}, Pages: ${pagesCount}, Tables: ${tablesCount}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Connection successful! Spreadsheet: "${spreadsheetName}" (${tablesCount} tables)`,
        spreadsheet: {
          id: SPREADSHEET_ID,
          name: spreadsheetName,
          pages: pagesCount,
          tables: tablesCount,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in instagram-test-connection:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Connection error: ${errorMessage}`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
