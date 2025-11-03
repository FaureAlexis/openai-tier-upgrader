#!/usr/bin/env node

import OpenAI from 'openai';
import 'dotenv/config';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const MODELS = {
  'gpt-5': 'gpt-5-2025-08-07',
  'gpt-5-mini': 'gpt-5-mini-2025-08-07',
  'gpt-5-nano': 'gpt-5-nano-2025-08-07',
};

const IMAGE_MODELS = {
  'gpt-image-1': 'gpt-image-1',
};

// Parse command line arguments
const args = process.argv.slice(2);
const modelArg = args.find(arg => arg.startsWith('--model='))?.split('=')[1] || 'mixed';
const iterationsArg = parseInt(args.find(arg => arg.startsWith('--iterations='))?.split('=')[1] || '10', 10);
const delayArg = parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1] || '1000', 10);
const verboseArg = args.includes('--verbose');
const mixRatioArg = args.find(arg => arg.startsWith('--mix-ratio='))?.split('=')[1] || '70:30'; // text:image ratio

const selectedModel = MODELS[modelArg] || IMAGE_MODELS[modelArg] || 'mixed';
const isMixedMode = modelArg === 'mixed' || !MODELS[modelArg] && !IMAGE_MODELS[modelArg];

// Parse mix ratio
const [textRatio, imageRatio] = mixRatioArg.split(':').map(Number);
const totalRatio = textRatio + imageRatio;

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           OpenAI Token Burner - Tier Upgrader                ║
╚══════════════════════════════════════════════════════════════╝

Configuration:
  - Model: ${modelArg}${isMixedMode ? ` (Mixed Mode - ${mixRatioArg})` : ` (${selectedModel})`}
  - Iterations: ${iterationsArg}
  - Delay: ${delayArg}ms
  - Verbose: ${verboseArg}

Starting token burning session...
`);

// Generate a long prompt to maximize token usage
function generateLongPrompt(iteration) {
  return `You are a helpful assistant. This is request #${iteration}.

Please analyze and provide detailed insights on the following topics:
1. Explain the concept of artificial intelligence and machine learning in detail
2. Discuss the history of computing from the 1940s to present day
3. Describe various programming paradigms including functional, object-oriented, and procedural
4. Analyze the evolution of web technologies from HTML1 to modern frameworks
5. Explain database design principles and normalization
6. Discuss network protocols and the OSI model
7. Describe cloud computing architectures and microservices
8. Analyze cybersecurity best practices and common vulnerabilities
9. Discuss data structures and algorithms complexity analysis
10. Explain distributed systems and CAP theorem

Please provide comprehensive answers with examples for each topic. Make your response as detailed and thorough as possible, including code examples, diagrams descriptions, and real-world use cases.`;
}

// Generate creative image prompts
function generateImagePrompt(iteration) {
  const themes = [
    'A futuristic cityscape with flying cars and neon lights',
    'An abstract representation of artificial intelligence and neural networks',
    'A serene landscape with mountains, lakes, and colorful sunset',
    'A cyberpunk street scene with holograms and robots',
    'An underwater scene with bioluminescent creatures',
    'A fantasy castle floating in the clouds',
    'A surreal dreamscape with impossible geometry',
    'A steampunk laboratory filled with brass machinery',
    'A cosmic scene with nebulas, galaxies and stars',
    'A post-apocalyptic cityscape being reclaimed by nature',
  ];

  const styles = [
    'digital art, highly detailed, 4k',
    'oil painting, impressionist style',
    'photorealistic, ultra HD',
    'concept art, cinematic lighting',
    'watercolor, ethereal and dreamy',
    'vector art, vibrant colors',
    'pencil sketch, detailed shading',
    '3D render, ray tracing',
  ];

  const theme = themes[iteration % themes.length];
  const style = styles[iteration % styles.length];

  return `${theme}, ${style}`;
}

// Stats tracking
let totalTokensUsed = 0;
let totalCost = 0;
let successfulRequests = 0;
let failedRequests = 0;
let textRequests = 0;
let imageRequests = 0;

// Rough cost estimates (per 1M tokens) - adjust based on actual pricing
const COST_PER_MILLION_TOKENS = {
  'gpt-5-2025-08-07': { input: 15, output: 60 },
  'gpt-5-mini-2025-08-07': { input: 1.5, output: 6 },
  'gpt-5-nano-2025-08-07': { input: 0.4, output: 1.6 },
};

// Image costs (per image) based on quality/size
// GPT-Image-1 with 'high' quality costs more
const IMAGE_COSTS = {
  'gpt-image-1': {
    'low': { '1024x1024': 0.02, '1536x1536': 0.07, '2048x2048': 0.19 },
    'medium': { '1024x1024': 0.07, '1536x1536': 0.13, '2048x2048': 0.38 },
    'high': { '1024x1024': 0.19, '1536x1536': 0.38, '2048x2048': 0.75 },
  },
};

function calculateCost(usage, model) {
  const costs = COST_PER_MILLION_TOKENS[model];
  if (!costs) return 0;

  const inputCost = (usage.prompt_tokens / 1000000) * costs.input;
  const outputCost = (usage.completion_tokens / 1000000) * costs.output;
  return inputCost + outputCost;
}

function calculateImageCost(model, size, quality = 'high') {
  const modelCosts = IMAGE_COSTS[model];
  if (!modelCosts) return 0.19; // Default estimate for high quality
  const qualityCosts = modelCosts[quality];
  if (!qualityCosts) return 0.19;
  return qualityCosts[size] || 0.19;
}

// Determine if this iteration should generate an image
function shouldGenerateImage(iteration) {
  if (!isMixedMode) {
    return IMAGE_MODELS[modelArg] !== undefined;
  }

  // In mixed mode, use a repeating pattern based on the ratio
  // For 70:30 (textRatio=70, imageRatio=30):
  // Every 10 iterations: 7 text, 3 images
  const cycleLength = 10;
  const cyclePosition = (iteration - 1) % cycleLength;
  const textPerCycle = Math.floor(textRatio / 10);
  return cyclePosition >= textPerCycle;
}

// Select a random model from the available options
function selectRandomModel(isImage) {
  if (isImage) {
    const imageModelKeys = Object.keys(IMAGE_MODELS);
    const randomKey = imageModelKeys[Math.floor(Math.random() * imageModelKeys.length)];
    return IMAGE_MODELS[randomKey];
  } else {
    const textModelKeys = Object.keys(MODELS);
    const randomKey = textModelKeys[Math.floor(Math.random() * textModelKeys.length)];
    return MODELS[randomKey];
  }
}

async function burnTokensWithText(iteration, model) {
  const startTime = Date.now();

  // GPT-5 models don't support temperature parameter (only default value 1 is supported)
  // They also have new parameters: verbosity and reasoning_effort
  const requestParams = {
    model: model,
    messages: [
      {
        role: 'user',
        content: generateLongPrompt(iteration),
      },
    ],
    max_completion_tokens: 4000,
  };

  // Add verbosity for GPT-5 models to maximize output length
  if (model.includes('gpt-5')) {
    requestParams.verbosity = 'high'; // high = longest/most detailed output
  }

  const completion = await client.chat.completions.create(requestParams);

  const endTime = Date.now();
  const duration = endTime - startTime;

  const usage = completion.usage;
  const tokens = usage.total_tokens;
  const cost = calculateCost(usage, model);

  totalTokensUsed += tokens;
  totalCost += cost;
  successfulRequests++;
  textRequests++;

  console.log(`[${iteration}/${iterationsArg}] ✓ Text | Model: ${model.split('-')[0]}-${model.split('-')[1]} | Tokens: ${tokens.toLocaleString()} | Cost: $${cost.toFixed(4)} | Time: ${duration}ms`);

  if (verboseArg) {
    console.log(`  - Input tokens: ${usage.prompt_tokens.toLocaleString()}`);
    console.log(`  - Output tokens: ${usage.completion_tokens.toLocaleString()}`);
    console.log(`  - Response preview: ${completion.choices[0].message.content.substring(0, 100)}...`);
  }
}

async function burnTokensWithImage(iteration, model) {
  const startTime = Date.now();

  const imageSize = '1024x1024';
  const prompt = generateImagePrompt(iteration);

  const response = await client.images.generate({
    model: model,
    prompt: prompt,
    n: 1,
    size: imageSize,
    quality: 'high', // high quality for maximum cost/usage
  });

  const endTime = Date.now();
  const duration = endTime - startTime;

  const cost = calculateImageCost(model, imageSize, 'high');
  totalCost += cost;
  successfulRequests++;
  imageRequests++;

  console.log(`[${iteration}/${iterationsArg}] ✓ Image | Model: ${model} | Size: ${imageSize} | Quality: high | Cost: $${cost.toFixed(4)} | Time: ${duration}ms`);

  if (verboseArg) {
    console.log(`  - Prompt: ${prompt}`);
    console.log(`  - Image URL: ${response.data[0].url}`);
  }
}

async function burnTokens(iteration) {
  try {
    const useImage = shouldGenerateImage(iteration);

    let model;
    if (isMixedMode) {
      model = selectRandomModel(useImage);
    } else {
      model = selectedModel;
    }

    if (useImage) {
      await burnTokensWithImage(iteration, model);
    } else {
      await burnTokensWithText(iteration, model);
    }

  } catch (error) {
    failedRequests++;
    console.error(`[${iteration}/${iterationsArg}] ✗ Failed | Error: ${error.message}`);

    if (error.status === 429) {
      console.log('  Rate limit hit. Consider increasing delay or reducing iterations.');
    }

    if (verboseArg) {
      console.log(`  - Status: ${error.status}`);
      if (error.response?.data) {
        console.log(`  - Details: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
}

async function main() {
  const startTime = Date.now();

  for (let i = 1; i <= iterationsArg; i++) {
    await burnTokens(i);

    // Don't delay after the last iteration
    if (i < iterationsArg) {
      await new Promise(resolve => setTimeout(resolve, delayArg));
    }
  }

  const endTime = Date.now();
  const totalDuration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                     Session Summary                          ║
╚══════════════════════════════════════════════════════════════╝

Total Tokens Used: ${totalTokensUsed.toLocaleString()}
Estimated Cost: $${totalCost.toFixed(4)}
Successful Requests: ${successfulRequests} (${textRequests} text, ${imageRequests} images)
Failed Requests: ${failedRequests}
Total Duration: ${totalDuration}s
${totalTokensUsed > 0 ? `Average Tokens/Text Request: ${(totalTokensUsed / (textRequests || 1)).toFixed(0)}` : ''}

Tier Upgrade Info:
- Check your usage tier at: https://platform.openai.com/settings/organization/limits
- Higher tiers unlock better rate limits (TPM/RPM)
- Tier advancement is based on payment history and usage over time

Next Steps:
1. Monitor your account for tier upgrades
2. Run this script regularly to maintain usage
3. Try mixed mode for balanced token consumption: --model=mixed --mix-ratio=70:30
`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  console.log(`Tokens used so far: ${totalTokensUsed.toLocaleString()}`);
  console.log(`Estimated cost: $${totalCost.toFixed(4)}`);
  process.exit(0);
});

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
