#!/usr/bin/env node

/**
 * Server wrapper for Next.js standalone mode
 * This script generates a runtime config file from environment variables
 * and injects them before starting the Next.js server.
 */

const fs = require('fs');
const path = require('path');

// Read all NEXT_PUBLIC_* environment variables from the environment
const env = process.env;

// Collect all NEXT_PUBLIC_* variables from the environment
const runtimeConfig = {};

// Additional non-NEXT_PUBLIC vars that need client-side access
const EXTRA_CLIENT_VARS = ['INT42H_PLATFORM_URL'];

Object.keys(env).forEach((key) => {
  if (key.startsWith('NEXT_PUBLIC_') || EXTRA_CLIENT_VARS.includes(key)) {
    runtimeConfig[key] = env[key];
    process.env[key] = env[key];
  }
});

// When running behind a reverse proxy (e.g., host Nginx doing SSL termination),
// the container's server-side rendering must fetch via the local HTTP endpoint
// (http://localhost/) instead of the external HTTPS URL, which would loop back
// and fail with ECONNREFUSED on port 443.
//
// INT42H_EXTERNAL_URL (e.g., "https://int42h.uz") tells us what the
// *browser* should use. The server-side runtime-config.json is patched to use
// internal URLs, while the browser's runtime-config.js keeps the external ones.
const externalUrl = env.INT42H_EXTERNAL_URL;
const serverConfig = { ...runtimeConfig };

if (externalUrl) {
  const extNormalized = externalUrl.replace(/\/+$/, '');
  // Server-side: route through local Nginx inside the container
  serverConfig['NEXT_PUBLIC_INT42H_BACKEND_URL'] = 'http://localhost/';
  serverConfig['NEXT_PUBLIC_INT42H_API_URL'] = 'http://localhost/api/v1/';
  // Also override process.env so that any direct process.env reads get the internal URL
  process.env['NEXT_PUBLIC_INT42H_BACKEND_URL'] = 'http://localhost/';
  process.env['NEXT_PUBLIC_INT42H_API_URL'] = 'http://localhost/api/v1/';

  // Browser-side: use the real external URL
  runtimeConfig['NEXT_PUBLIC_INT42H_BACKEND_URL'] = extNormalized + '/';
  runtimeConfig['NEXT_PUBLIC_INT42H_API_URL'] = extNormalized + '/api/v1/';
}

// Write runtime config JSON file (used by server-side rendering)
const configPath = path.join(__dirname, 'runtime-config.json');
fs.writeFileSync(configPath, JSON.stringify(serverConfig, null, 2), 'utf8');

// Create client-side runtime config script for browser access
// In Next.js standalone, public files are served from the public directory
const publicDir = path.join(__dirname, 'public');
try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const scriptPath = path.join(publicDir, 'runtime-config.js');
  fs.writeFileSync(
    scriptPath,
    `window.__RUNTIME_CONFIG__ = ${JSON.stringify(runtimeConfig)};`,
    'utf8'
  );
} catch {
  // Ignore if can't create (non-critical for server-side rendering)
  // Client-side config is optional if runtime-config.json is available
}

// Set default HOSTNAME if not provided
if (!process.env.HOSTNAME) {
  process.env.HOSTNAME = '0.0.0.0';
}

// Set PORT from environment or default
if (!process.env.PORT) {
  process.env.PORT = '3000';
}

// Now require and run the actual Next.js server
// The server.js is in the same directory (standalone output)
require('./server.js');

