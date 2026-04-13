#!/usr/bin/env node

/**
 * Deployment Check Script
 * Verifies that the project is ready for GitHub Pages deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 ServicePro Management - Deployment Check\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'src/main.tsx',
  'index.html',
  '.github/workflows/deploy.yml'
];

let allFilesExist = true;

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json configuration
console.log('\n📦 Checking package.json configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.homepage) {
    console.log(`✅ Homepage: ${packageJson.homepage}`);
  } else {
    console.log('⚠️  Homepage not set - update with your GitHub Pages URL');
  }
  
  if (packageJson.scripts.deploy) {
    console.log('✅ Deploy script configured');
  } else {
    console.log('❌ Deploy script missing');
  }
  
  if (packageJson.scripts.predeploy) {
    console.log('✅ Predeploy script configured');
  } else {
    console.log('❌ Predeploy script missing');
  }
} catch (error) {
  console.log('❌ Error reading package.json');
  allFilesExist = false;
}

// Check vite.config.ts
console.log('\n⚙️  Checking Vite configuration...');
try {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  if (viteConfig.includes('base:')) {
    console.log('✅ Base path configured for GitHub Pages');
  } else {
    console.log('⚠️  Base path not configured - may cause routing issues');
  }
} catch (error) {
  console.log('❌ Error reading vite.config.ts');
}

// Summary
console.log('\n📋 Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('🚀 Project is ready for deployment!');
  console.log('\n📝 Next steps:');
  console.log('1. Create a GitHub repository');
  console.log('2. Update homepage in package.json with your repository URL');
  console.log('3. Push code to GitHub');
  console.log('4. Enable GitHub Pages in repository settings');
  console.log('5. Your site will be live at the homepage URL');
} else {
  console.log('❌ Some files are missing - please check the errors above');
}

console.log('\n📖 For detailed instructions, see DEPLOYMENT.md');