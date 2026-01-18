#!/usr/bin/env node
/**
 * Smoke test script for dispatch loop
 * Tests health endpoint and manual dispatch endpoint
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Test payload
const testPayload = {
  callData: {
    callerPhone: '+15551234567',
    twilioToNumber: '+15559876543',
    issueSummary: 'Smoke test call - pipe leak in basement',
    transcript: 'This is a smoke test transcript. Customer reported water leak.',
    emergencyLevel: 'Medium',
  },
};

async function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runSmokeTest() {
  console.log('🧪 Running smoke tests...\n');

  // Test 1: Health check
  console.log('1. Testing /health endpoint...');
  try {
    const healthResult = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/health',
      method: 'GET',
    });

    if (healthResult.status === 200 && healthResult.data.status === 'ok') {
      console.log('   ✅ Health check passed\n');
    } else {
      console.error('   ❌ Health check failed:', healthResult);
      process.exit(1);
    }
  } catch (error) {
    console.error('   ❌ Health check failed:', error.message);
    process.exit(1);
  }

  // Test 2: Manual dispatch
  console.log('2. Testing /api/dispatch/manual endpoint...');
  try {
    const dispatchResult = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/dispatch/manual',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      testPayload
    );

    console.log('   Response:', JSON.stringify(dispatchResult.data, null, 2));

    if (dispatchResult.status === 200 && dispatchResult.data.success === true) {
      console.log('   ✅ Dispatch endpoint passed\n');
      console.log('   Status:', dispatchResult.data.result?.status || 'unknown');
      console.log('   Call ID:', dispatchResult.data.result?.callId || 'none');
    } else {
      console.error('   ❌ Dispatch endpoint failed:', dispatchResult);
      process.exit(1);
    }
  } catch (error) {
    console.error('   ❌ Dispatch endpoint failed:', error.message);
    process.exit(1);
  }

  console.log('✅ All smoke tests passed!');
}

runSmokeTest().catch((error) => {
  console.error('Smoke test error:', error);
  process.exit(1);
});
