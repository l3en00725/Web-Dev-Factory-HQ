#!/usr/bin/env node

/**
 * Zapier Webhook Test Script
 * Tests the pool lead webhook integration
 * 
 * Usage:
 *   bun run integrations/zapier/testWebhook.js
 * 
 * Or with custom webhook URL:
 *   ZAPIER_WEBHOOK_URL_POOL="https://hooks.zapier.com/..." bun run integrations/zapier/testWebhook.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '../../.env');
  
  if (!fs.existsSync(envPath)) {
    log('⚠️  No .env file found. Creating from template...', 'yellow');
    
    const templatePath = path.join(__dirname, '../../.env.template');
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, envPath);
      log('✓ Created .env file from template', 'green');
      log('\n📝 Please edit .env and add your ZAPIER_WEBHOOK_URL_POOL', 'cyan');
      log('   Then run this script again.\n', 'cyan');
      process.exit(1);
    } else {
      log('❌ .env.template not found. Cannot proceed.', 'red');
      process.exit(1);
    }
  }

  // Parse .env file
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

// Generate test payload
function generateTestPayload() {
  return {
    // Customer Information
    name: 'Test User',
    email: 'test@example.com',
    phone: '609-555-0123',
    city: 'Cape May',
    service_type: 'Weekly Pool Cleaning',
    message: 'This is a test submission from the Blue Lawns pool service form. Please ignore.',
    
    // Hidden Tracking Fields
    lead_source: 'Blue Lawns',
    lead_type: 'Pool Lead',
    service_interest: 'Pool Maintenance',
    referral_url: 'https://www.bluelawns.com/pools',
    timestamp: new Date().toISOString(),
    
    // Test Metadata
    test_mode: true,
    test_timestamp: new Date().toISOString(),
    test_id: `TEST-${Date.now()}`,
  };
}

// Test webhook connection
async function testWebhook(webhookUrl, payload) {
  logSection('Testing Webhook Connection');
  
  log(`Webhook URL: ${webhookUrl}`, 'cyan');
  log(`Payload:`, 'cyan');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

  try {
    log('Sending test request...', 'yellow');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Blue-Lawns-Webhook-Test/1.0',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log('');
    log('Response Details:', 'bright');
    log(`Status: ${response.status} ${response.statusText}`, 'cyan');
    log(`Response:`, 'cyan');
    console.log(typeof responseData === 'object' 
      ? JSON.stringify(responseData, null, 2) 
      : responseData
    );
    console.log('');

    if (response.ok) {
      log('✓ Webhook test successful!', 'green');
      log('\n📊 Next Steps:', 'cyan');
      log('1. Check your Zapier dashboard for the test data', 'cyan');
      log('2. Verify the data appears correctly in Zapier', 'cyan');
      log('3. Complete the Zap setup following SETUP-GUIDE.md', 'cyan');
      log('4. Run this test again after Zap is configured', 'cyan');
      return true;
    } else {
      log('❌ Webhook test failed!', 'red');
      log('\n🔍 Troubleshooting:', 'yellow');
      log('1. Verify the webhook URL is correct in .env', 'yellow');
      log('2. Check that the Zap is turned ON in Zapier', 'yellow');
      log('3. Review Zapier Task History for error details', 'yellow');
      log('4. Ensure your Zapier account is active', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Connection error!', 'red');
    log(`Error: ${error.message}`, 'red');
    log('\n🔍 Possible issues:', 'yellow');
    log('1. Invalid webhook URL format', 'yellow');
    log('2. Network connectivity issues', 'yellow');
    log('3. Zapier service temporarily unavailable', 'yellow');
    return false;
  }
}

// Main execution
async function main() {
  console.clear();
  
  logSection('🔗 Zapier Webhook Integration Test');
  
  log('This script tests the connection between Blue Lawns and Zapier', 'cyan');
  log('It will send a test payload to your configured webhook URL\n', 'cyan');

  // Load environment variables
  const env = loadEnv();
  
  // Get webhook URL (prioritize environment variable, then .env file)
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL_POOL || env.ZAPIER_WEBHOOK_URL_POOL;

  if (!webhookUrl || webhookUrl.trim() === '') {
    log('❌ ZAPIER_WEBHOOK_URL_POOL not configured!', 'red');
    log('\n📝 To fix this:', 'yellow');
    log('1. Open .env file in your project root', 'yellow');
    log('2. Add your Zapier webhook URL:', 'yellow');
    log('   ZAPIER_WEBHOOK_URL_POOL=https://hooks.zapier.com/hooks/catch/...', 'yellow');
    log('3. Get the webhook URL from: https://zapier.com/app/editor', 'yellow');
    log('4. Follow the SETUP-GUIDE.md for detailed instructions', 'yellow');
    log('\nSee: integrations/zapier/SETUP-GUIDE.md\n', 'cyan');
    process.exit(1);
  }

  // Validate webhook URL format
  if (!webhookUrl.startsWith('https://hooks.zapier.com/')) {
    log('⚠️  Warning: Webhook URL doesn\'t look like a Zapier webhook', 'yellow');
    log(`   Expected: https://hooks.zapier.com/hooks/catch/...`, 'yellow');
    log(`   Got: ${webhookUrl}\n`, 'yellow');
  }

  // Generate test payload
  const payload = generateTestPayload();

  // Test the webhook
  const success = await testWebhook(webhookUrl, payload);

  // Log results to file
  logSection('Logging Test Results');
  
  const logDir = path.join(__dirname, '../../output/blue-lawns');
  const logFile = path.join(logDir, 'webhook-test-log.json');
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    webhook_url: webhookUrl.substring(0, 50) + '...', // Truncate for security
    success,
    payload,
    test_id: payload.test_id,
  };

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Append to log file
  let logHistory = [];
  if (fs.existsSync(logFile)) {
    try {
      logHistory = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    } catch {
      logHistory = [];
    }
  }
  
  logHistory.push(logEntry);
  
  // Keep only last 50 entries
  if (logHistory.length > 50) {
    logHistory = logHistory.slice(-50);
  }
  
  fs.writeFileSync(logFile, JSON.stringify(logHistory, null, 2));
  
  log(`Test results logged to: ${logFile}`, 'cyan');

  // Update tracking-map.md
  const trackingMapPath = path.join(logDir, 'tracking-map.md');
  if (fs.existsSync(trackingMapPath)) {
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    
    const testResult = `\n\n---\n\n## Webhook Test Results\n\n**Last Test:** ${timestamp}\n**Status:** ${success ? '✅ PASSED' : '❌ FAILED'}\n**Test ID:** ${payload.test_id}\n\n${success 
      ? '✓ Webhook is responding correctly. Proceed with Zap configuration.\n✓ Check Zapier Task History to verify data was received.' 
      : '✗ Webhook test failed. Check the error details above.\n✗ Verify webhook URL in .env file and ensure Zap is turned ON.'}\n`;
    
    fs.appendFileSync(trackingMapPath, testResult);
    log(`Updated tracking documentation: ${trackingMapPath}`, 'cyan');
  }

  // Exit with appropriate code
  console.log('');
  process.exit(success ? 0 : 1);
}

// Run the script
main().catch(error => {
  log('\n❌ Unexpected error:', 'red');
  console.error(error);
  process.exit(1);
});

