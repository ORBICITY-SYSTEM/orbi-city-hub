/**
 * Axiom AI Automation API Client
 * 
 * This service provides integration with Axiom AI automation platform
 * to trigger bots and run automation workflows.
 * 
 * API Documentation: https://docs.axiom.ai
 */

const AXIOM_API_TOKEN = process.env.AXIOM_API_TOKEN;
const AXIOM_API_BASE_URL = process.env.AXIOM_API_BASE_URL || 'https://api.axiom.ai/v1';

export interface AxiomTriggerBotPayload {
  bot_id: string;
  [key: string]: any; // Allow additional payload fields
}

export interface AxiomTriggerResponse {
  success: boolean;
  run_id?: string;
  status?: string;
  message?: string;
  error?: string;
}

/**
 * Trigger an Axiom bot with the given bot ID and payload
 * 
 * @param botId - The ID of the bot to trigger
 * @param payload - Additional data to pass to the bot
 * @returns Promise with the trigger response
 */
export async function triggerBot(
  botId: string,
  payload: Record<string, any> = {}
): Promise<AxiomTriggerResponse> {
  if (!AXIOM_API_TOKEN) {
    throw new Error('AXIOM_API_TOKEN is not configured. Please set it in your .env file.');
  }

  try {
    // AXIOM_API_BASE_URL already includes /v1, so just add /trigger
    const url = `${AXIOM_API_BASE_URL}/trigger`;
    
    const requestBody = {
      bot_id: botId,
      ...payload,
    };

    console.log(`[Axiom] Triggering bot: ${botId}`);
    console.log(`[Axiom] URL: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AXIOM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let responseData: any;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error(`[Axiom] API error (${response.status}):`, responseData);
      return {
        success: false,
        error: responseData.message || responseData.error || `HTTP ${response.status}`,
        status: 'error',
      };
    }

    console.log(`[Axiom] Bot triggered successfully:`, responseData);

    return {
      success: true,
      run_id: responseData.run_id || responseData.id,
      status: responseData.status || 'triggered',
      message: responseData.message || 'Bot triggered successfully',
    };
  } catch (error) {
    console.error('[Axiom] Error triggering bot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error',
    };
  }
}

/**
 * Test the Axiom API connection
 * 
 * @returns Promise with connection test result
 */
export async function testAxiomConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  if (!AXIOM_API_TOKEN) {
    return {
      success: false,
      message: 'AXIOM_API_TOKEN is not configured',
      error: 'Token not found in environment variables',
    };
  }

  try {
    // Try to access a simple endpoint (like health check or datasets)
    // AXIOM_API_BASE_URL already includes /v1, so just add /health
    const testUrl = `${AXIOM_API_BASE_URL}/health`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AXIOM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok || response.status === 404) {
      // 404 might be expected if health endpoint doesn't exist, but auth works
      return {
        success: true,
        message: 'Axiom API connection successful (token is valid)',
      };
    }

    return {
      success: false,
      message: `Connection test failed with status ${response.status}`,
      error: await response.text().catch(() => 'Unknown error'),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
