/**
 * Axiom API Connection Test Script
 * 
 * Tests the connection to Axiom AI API using the configured token
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '.env') });

const AXIOM_API_TOKEN = process.env.AXIOM_API_TOKEN;
const AXIOM_API_BASE_URL = process.env.AXIOM_API_BASE_URL || 'https://api.axiom.ai/v1';

async function testAxiomConnection() {
  console.log('🔍 Testing Axiom API Connection...\n');

  // Check if token is configured
  if (!AXIOM_API_TOKEN) {
    console.error('❌ ERROR: AXIOM_API_TOKEN is not configured!');
    console.error('   Please add AXIOM_API_TOKEN to your .env file');
    process.exit(1);
  }

  console.log(`✅ AXIOM_API_TOKEN found: ${AXIOM_API_TOKEN.substring(0, 10)}...`);
  console.log(`✅ AXIOM_API_BASE_URL: ${AXIOM_API_BASE_URL}\n`);

  try {
    // Test 1: Try health check endpoint (if available)
    console.log('📡 Test 1: Health Check...');
    try {
      // AXIOM_API_BASE_URL already includes /v1
      const healthUrl = `${AXIOM_API_BASE_URL}/health`;
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AXIOM_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`   Status: ${healthResponse.status}`);
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.log('   ✅ Health check passed:', data);
      } else {
        console.log('   ⚠️  Health endpoint returned non-OK status (may not exist)');
      }
    } catch (error) {
      console.log('   ⚠️  Health endpoint not available (this is OK)');
    }

    // Test 2: Try trigger endpoint with test payload
    console.log('\n📡 Test 2: Trigger Endpoint Test...');
    // AXIOM_API_BASE_URL already includes /v1
    const triggerUrl = `${AXIOM_API_BASE_URL}/trigger`;
    
    const testPayload = {
      bot_id: 'test-bot-id',
      test: true,
    };

    console.log(`   URL: ${triggerUrl}`);
    console.log(`   Payload: ${JSON.stringify(testPayload, null, 2)}`);

    const triggerResponse = await fetch(triggerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AXIOM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await triggerResponse.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log(`   Status: ${triggerResponse.status}`);
    console.log(`   Response: ${JSON.stringify(responseData, null, 2)}`);

    if (triggerResponse.ok) {
      console.log('\n✅ SUCCESS: Axiom API connection is working!');
      console.log('   The token is valid and the API is accessible.');
    } else if (triggerResponse.status === 401 || triggerResponse.status === 403) {
      console.log('\n❌ ERROR: Authentication failed!');
      console.log('   Please check your AXIOM_API_TOKEN');
    } else if (triggerResponse.status === 404) {
      console.log('\n⚠️  WARNING: Endpoint not found (404)');
      console.log('   This might mean:');
      console.log('   - The API endpoint URL is incorrect');
      console.log('   - The API version has changed');
      console.log('   - The endpoint path is different');
    } else {
      console.log('\n⚠️  WARNING: Unexpected response');
      console.log('   The connection works, but the endpoint returned an error.');
      console.log('   This might be expected if the test bot_id is invalid.');
    }

  } catch (error) {
    console.error('\n❌ ERROR: Connection test failed');
    console.error('   Error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

// Run the test
testAxiomConnection()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
