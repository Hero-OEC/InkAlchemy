#!/usr/bin/env node

// Build script for Cloudflare Workers deployment
// This script builds both the frontend and the worker

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔄 Building InkAlchemy for Cloudflare Workers...');

try {
  // Step 1: Build the frontend (React app)
  console.log('📦 Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Build the worker using Supabase-only approach (bundle everything for Workers runtime)
  console.log('🔧 Building worker...');
  execSync('npx esbuild server/worker-supabase.ts --bundle --format=esm --platform=browser --target=es2022 --outfile=dist/worker.js --define:global=globalThis --define:process="{env:{}}" --define:process.env.NODE_ENV=\\"production\\" --external:node:* --external:stream --external:http --external:https --external:url --external:zlib --external:punycode --external:fs --external:path --external:crypto --external:os --main-fields=browser,module,main --conditions=worker,browser,import', { stdio: 'inherit' });

  // Step 3: Verify the build output
  console.log('✅ Verifying build output...');
  if (!fs.existsSync('dist/worker.js')) {
    throw new Error('Worker build failed - output file not found');
  }
  
  const stats = fs.statSync('dist/worker.js');
  console.log(`📊 Worker bundle size: ${(stats.size / 1024).toFixed(2)} KB`);

  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  console.log('✅ Build completed successfully!');
  console.log('📤 Ready for deployment with: npx wrangler deploy');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}