#!/usr/bin/env node

/**
 * SEO Generator Setup Script
 * Helps set up the environment and provides guided configuration
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function setupEnvironment() {
  console.log('🎯 SEO Page Generator Setup\n');
  
  try {
    // Check if .env file exists
    const envExists = await fs.access('.env').then(() => true).catch(() => false);
    
    if (!envExists) {
      console.log('📝 Creating .env file...');
      
      const unsplashKey = await question('Enter your Unsplash Access Key (optional, press Enter to skip): ');
      const pexelsKey = await question('Enter your Pexels API Key (optional, press Enter to skip): ');
      
      const envContent = `# SEO Page Generator API Keys
UNSPLASH_ACCESS_KEY=${unsplashKey}
PEXELS_API_KEY=${pexelsKey}

# Site Configuration
SITE_URL=https://bid.nyelizabeth.com
COMPANY_NAME="NY Elizabeth Auctions"
`;

      await fs.writeFile('.env', envContent);
      console.log('✅ .env file created');
    } else {
      console.log('✅ .env file already exists');
    }
    
    // Check for keywords.xlsx
    const keywordsExists = await fs.access('keywords.xlsx').then(() => true).catch(() => false);
    
    if (!keywordsExists) {
      console.log('\n📋 Creating sample keywords.xlsx file...');
      
      // Create a sample Excel file with sample keywords
      const sampleKeywords = [
        'antique paintings for sale',
        'vintage art collection',
        'oil paintings online',
        'contemporary art pieces',
        'sculpture art gallery',
        'fine art auction',
        'collectible artwork',
        'modern paintings',
        'abstract art for sale',
        'portrait paintings',
        'landscape artwork',
        'art investment pieces',
        'rare art collections',
        'authentic paintings',
        'premium art gallery'
      ];
      
      // Since we already have XLSX installed, we can create a sample file
      const XLSX = require('xlsx');
      const ws = XLSX.utils.aoa_to_sheet([
        ['Keywords'], // Header
        ...sampleKeywords.map(k => [k])
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Keywords');
      XLSX.writeFile(wb, 'keywords.xlsx');
      
      console.log('✅ Sample keywords.xlsx created with 15 sample keywords');
      console.log('📝 Replace the sample keywords with your own keywords before running the generator');
    } else {
      console.log('✅ keywords.xlsx file found');
    }
    
    // Create output directory
    const outputDir = 'src/app/(seo-pages)';
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`✅ Output directory created: ${outputDir}`);
    
    // Create placeholder image
    console.log('\n🖼️  Setting up placeholder images...');
    const placeholderDir = 'public';
    const placeholderExists = await fs.access(path.join(placeholderDir, 'placeholder-artwork.jpg'))
      .then(() => true).catch(() => false);
      
    if (!placeholderExists) {
      console.log('ℹ️  Add a placeholder-artwork.jpg image to your public/ directory');
      console.log('   This will be used as fallback when API images are unavailable');
    } else {
      console.log('✅ Placeholder image found');
    }
    
    console.log('\n🎉 Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Add your keywords to keywords.xlsx (replace the sample keywords)');
    console.log('2. Get API keys from Unsplash and/or Pexels (optional but recommended)');
    console.log('3. Update your .env file with the API keys');
    console.log('4. Run: npm run generate-seo');
    console.log('\n💡 Pro Tips:');
    console.log('- Use "npm run generate-seo-dry" to test without creating files');
    console.log('- The script will create pages in src/app/(seo-pages)/');
    console.log('- Each keyword becomes a separate page with unique content');
    console.log('- Internal linking between related pages is automatic');
    console.log('- Schema markup is included for better SEO');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// API Key helpers
async function getApiKeys() {
  console.log('\n🔑 API Key Information:');
  console.log('\n📷 Unsplash (Free tier: 50 requests/hour)');
  console.log('1. Go to https://unsplash.com/developers');
  console.log('2. Create an account and new application');
  console.log('3. Copy your Access Key');
  
  console.log('\n📸 Pexels (Free tier: 200 requests/hour)');
  console.log('1. Go to https://www.pexels.com/api/');
  console.log('2. Create an account');
  console.log('3. Copy your API Key');
  
  console.log('\n💡 Both APIs are optional but recommended for high-quality images');
  console.log('Without API keys, placeholder images will be used');
}

// Check system requirements
async function checkRequirements() {
  console.log('🔍 Checking system requirements...\n');
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`✅ Node.js: ${nodeVersion}`);
  
  // Check if we're in the right directory
  const packageExists = await fs.access('package.json').then(() => true).catch(() => false);
  if (!packageExists) {
    console.log('❌ package.json not found. Make sure you\'re in the project root directory.');
    process.exit(1);
  }
  console.log('✅ Package.json found');
  
  // Check required dependencies
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
  const requiredDeps = ['xlsx', 'axios', 'next'];
  const missing = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missing.length > 0) {
    console.log(`❌ Missing dependencies: ${missing.join(', ')}`);
    console.log('Run: npm install');
    process.exit(1);
  }
  console.log('✅ Required dependencies found');
  
  console.log('\n🎯 System ready for SEO generation!\n');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--api-keys')) {
    await getApiKeys();
  } else if (args.includes('--check')) {
    await checkRequirements();
  } else {
    await checkRequirements();
    await setupEnvironment();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupEnvironment, getApiKeys, checkRequirements };