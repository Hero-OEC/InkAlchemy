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

  // Step 2: Build the worker using Supabase-only approach
  console.log('🔧 Building worker...');
  execSync('npx esbuild server/worker-supabase.ts --bundle --format=esm --platform=neutral --outfile=dist/worker.js --external:@supabase/supabase-js', { stdio: 'inherit' });

  // Step 3: Copy necessary files
  console.log('📋 Copying configuration files...');
  
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