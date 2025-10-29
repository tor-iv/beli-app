#!/usr/bin/env node

/**
 * Image Generation Script using Google Gemini API
 *
 * This script generates images for the Beli app using Google's Imagen model.
 * It can generate:
 * - Restaurant exterior/interior photos
 * - Food dish images
 * - User profile pictures
 *
 * Usage:
 *   node scripts/generate-images.js --type=restaurant --prompt="Cozy Italian restaurant exterior"
 *   node scripts/generate-images.js --type=food --prompt="Margherita pizza on wooden table"
 *   node scripts/generate-images.js --type=profile --prompt="Portrait of a food blogger"
 *
 * Requirements:
 *   npm install @google/generative-ai
 *   Set GEMINI_API_KEY environment variable
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value;
  return acc;
}, {});

const VALID_TYPES = ['restaurant', 'food', 'profile', 'custom'];

// Configuration
const config = {
  type: args.type || 'custom',
  prompt: args.prompt || '',
  output: args.output || null,
  count: parseInt(args.count) || 1,
  apiKey: process.env.GEMINI_API_KEY,
};

// Validate inputs
function validateInputs() {
  if (!config.apiKey) {
    console.error('❌ Error: GEMINI_API_KEY environment variable not set');
    console.log('\nSet it by running:');
    console.log('  export GEMINI_API_KEY="your-api-key-here"');
    console.log('\nGet your API key at: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  if (!VALID_TYPES.includes(config.type)) {
    console.error(`❌ Error: Invalid type "${config.type}"`);
    console.log(`Valid types: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }

  if (!config.prompt) {
    console.error('❌ Error: --prompt is required');
    console.log('\nExample:');
    console.log('  node scripts/generate-images.js --type=food --prompt="Delicious ramen bowl"');
    process.exit(1);
  }
}

// Enhance prompt based on type
function enhancePrompt(type, userPrompt) {
  const enhancements = {
    restaurant: `Professional photograph of ${userPrompt}, well-lit, high quality, architectural photography style, inviting atmosphere`,
    food: `Professional food photography of ${userPrompt}, appetizing, well-lit, shallow depth of field, high resolution, restaurant quality`,
    profile: `Professional portrait photo of ${userPrompt}, natural lighting, friendly expression, high quality headshot style`,
    custom: userPrompt,
  };

  return enhancements[type] || userPrompt;
}

// Generate filename
function generateFilename(type, index = 0) {
  const timestamp = Date.now();
  const typePrefix = type === 'custom' ? 'generated' : type;
  const suffix = config.count > 1 ? `-${index + 1}` : '';
  return `${typePrefix}-${timestamp}${suffix}.png`;
}

// Determine output directory
function getOutputDir(type) {
  if (config.output) {
    return config.output;
  }

  const baseDir = path.join(__dirname, '..', 'beli-native', 'assets', 'generated');
  const typeDir = path.join(baseDir, type);

  // Create directory if it doesn't exist
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
  }

  return typeDir;
}

// Main function to generate images
async function generateImages() {
  try {
    // Note: As of Jan 2025, Gemini's Imagen API integration is still limited
    // This is a placeholder for when the API becomes available

    console.log('🎨 Image Generation Configuration:');
    console.log(`   Type: ${config.type}`);
    console.log(`   Prompt: "${config.prompt}"`);
    console.log(`   Count: ${config.count}`);
    console.log(`   Enhanced: "${enhancePrompt(config.type, config.prompt)}"`);
    console.log('');

    // Check if @google/generative-ai is installed
    let genAI;
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      genAI = new GoogleGenerativeAI(config.apiKey);
    } catch (err) {
      console.error('❌ Error: @google/generative-ai package not installed');
      console.log('\nInstall it by running:');
      console.log('  npm install @google/generative-ai');
      process.exit(1);
    }

    console.log('⚠️  Note: As of January 2025, Google Gemini API does not yet support image generation.');
    console.log('');
    console.log('Alternative options:');
    console.log('  1. Use OpenAI DALL-E 3: https://platform.openai.com/docs/guides/images');
    console.log('  2. Use Stability AI (Stable Diffusion): https://platform.stability.ai/');
    console.log('  3. Use Replicate API: https://replicate.com/');
    console.log('  4. Use Unsplash API for real photos: https://unsplash.com/developers');
    console.log('');
    console.log('Would you like me to create a script using one of these alternatives instead?');

    // Placeholder for future implementation
    const outputDir = getOutputDir(config.type);
    console.log(`Output directory: ${outputDir}`);

  } catch (error) {
    console.error('❌ Error generating images:', error.message);
    process.exit(1);
  }
}

// Show help
function showHelp() {
  console.log(`
Image Generation Script for Beli App

Usage:
  node scripts/generate-images.js [options]

Options:
  --type=TYPE        Type of image to generate (restaurant|food|profile|custom)
  --prompt=PROMPT    Description of the image to generate (required)
  --output=PATH      Output directory (optional, defaults to assets/generated/[type])
  --count=N          Number of images to generate (default: 1)
  --help            Show this help message

Examples:
  # Generate a restaurant image
  node scripts/generate-images.js --type=restaurant --prompt="Cozy Italian restaurant"

  # Generate multiple food images
  node scripts/generate-images.js --type=food --prompt="Ramen bowl" --count=3

  # Generate custom image with specific output
  node scripts/generate-images.js --type=custom --prompt="Modern cafe interior" --output=./custom

Environment Variables:
  GEMINI_API_KEY     Your Google Gemini API key (required)
                     Get one at: https://makersuite.google.com/app/apikey
`);
}

// Run the script
if (args.help) {
  showHelp();
} else {
  validateInputs();
  generateImages();
}
