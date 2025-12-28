#!/usr/bin/env node

const http = require('http');
const https = require('https');

const [, , url, maxRetries = 30] = process.argv;

if (!url) {
  console.error('Usage: node wait-server.js <url> [maxRetries]');
  process.exit(1);
}

let retries = 0;
const retryLimit = parseInt(maxRetries);

function checkServer() {
  const client = url.startsWith('https') ? https : http;
  
  client.get(url, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 500) {
      console.log(`✓ Server is ready at ${url}`);
      process.exit(0);
    } else {
      retry();
    }
  }).on('error', retry);
}

function retry() {
  retries++;
  if (retries > retryLimit) {
    console.error(`✗ Server did not become ready after ${retryLimit} retries`);
    process.exit(1);
  }
  console.log(`Attempt ${retries}/${retryLimit}: waiting for server...`);
  setTimeout(checkServer, 1000);
}

checkServer();
