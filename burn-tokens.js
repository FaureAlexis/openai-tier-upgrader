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

// Generate dynamic, varied prompts to avoid prompt caching
function generateLongPrompt(iteration) {
  const timestamp = Date.now();
  const randomSeed = Math.random().toString(36).substring(7);

  const topicCategories = [
    // Tech topics
    [
      'artificial intelligence and neural network architectures',
      'quantum computing and its practical applications',
      'blockchain technology and distributed ledger systems',
      'edge computing and IoT infrastructure',
      'serverless architecture and function-as-a-service platforms'
    ],
    // Science topics
    [
      'renewable energy sources and sustainability challenges',
      'genetic engineering and CRISPR technology ethics',
      'climate change mitigation strategies worldwide',
      'space exploration and colonization possibilities',
      'nanotechnology applications in medicine'
    ],
    // Business topics
    [
      'digital transformation strategies for enterprises',
      'startup ecosystems and venture capital trends',
      'remote work culture and productivity optimization',
      'agile methodologies and DevOps practices',
      'customer experience design and user journey mapping'
    ],
    // Philosophy topics
    [
      'ethics in artificial intelligence development',
      'digital privacy rights in modern society',
      'impact of social media on human behavior',
      'future of work and automation concerns',
      'sustainable development and circular economy models'
    ]
  ];

  // Randomly select a category and shuffle topics
  const categoryIndex = (iteration + timestamp) % topicCategories.length;
  const topics = [...topicCategories[categoryIndex]];

  // Shuffle topics using Fisher-Yates algorithm with timestamp as seed
  for (let i = topics.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(timestamp + i) + 1) * i / 2);
    [topics[i], topics[j]] = [topics[j], topics[i]];
  }

  const contextPrefixes = [
    `As an expert analyst with ${10 + (iteration % 20)} years of experience`,
    `From a ${['technical', 'strategic', 'academic', 'practical'][iteration % 4]} perspective`,
    `Considering recent developments in ${new Date().getFullYear()}`,
    `Drawing from both theoretical knowledge and real-world applications`,
    `With focus on innovation and future implications`
  ];

  const analysisStyles = [
    'detailed technical analysis with specific examples',
    'comprehensive overview with historical context',
    'in-depth exploration with case studies',
    'critical evaluation with pros and cons',
    'forward-looking analysis with predictions'
  ];

  const requestTypes = [
    'Provide a thorough explanation',
    'Analyze comprehensively',
    'Explore in detail',
    'Examine extensively',
    'Discuss at length'
  ];

  const prefix = contextPrefixes[iteration % contextPrefixes.length];
  const style = analysisStyles[iteration % analysisStyles.length];
  const requestType = requestTypes[iteration % requestTypes.length];

  return `${prefix}, session #${iteration}-${randomSeed} (timestamp: ${timestamp}):

${requestType} the following topics with ${style}:

1. ${topics[0]} - Include current trends, challenges, and emerging solutions
2. ${topics[1]} - Discuss implementation strategies and best practices
3. ${topics[2]} - Analyze impact on industry and society
4. ${topics[3]} - Explore technical requirements and limitations
5. ${topics[4]} - Consider future developments and potential innovations

Additional requirements:
- Include ${3 + (iteration % 5)} specific real-world examples
- Reference ${2 + (iteration % 4)} recent studies or developments
- Provide ${4 + (iteration % 6)} actionable recommendations
- Address ${3 + (iteration % 3)} potential challenges or concerns
- Suggest ${2 + (iteration % 5)} areas for further research

Please ensure your response is comprehensive, detailed, and includes concrete examples, data points where relevant, and practical insights. Aim for depth over breadth, providing nuanced analysis rather than surface-level overview.

Random validation code: ${randomSeed}-${Math.floor(Math.random() * 10000)}`;
}

// Generate creative, varied image prompts to avoid caching
function generateImagePrompt(iteration) {
  const timestamp = Date.now();
  const randomValue = Math.random();

  const subjects = [
    'futuristic cityscape', 'alien planet landscape', 'underwater civilization',
    'floating islands', 'crystal cave system', 'ancient temple ruins',
    'cyberpunk street market', 'bio-luminescent forest', 'steampunk airship',
    'quantum realm visualization', 'neural network architecture', 'fractal dimension',
    'robot workshop', 'space station interior', 'magical library'
  ];

  const atmospheres = [
    'at golden hour with dramatic lighting', 'during a thunderstorm with lightning',
    'in bioluminescent glow', 'with volumetric fog and rays of light',
    'at midnight under starlit sky', 'during sunrise with warm colors',
    'in misty atmosphere', 'with aurora borealis overhead',
    'under neon lights', 'in ethereal dreamlike ambiance'
  ];

  const styles = [
    'hyper-realistic digital art, 8k resolution', 'concept art with cinematic composition',
    'oil painting in romantic style', 'watercolor with soft gradients',
    '3D render with ray tracing', 'isometric low-poly design',
    'cyberpunk aesthetic with neon accents', 'fantasy art with magical elements',
    'surrealist style with impossible architecture', 'minimalist design with bold colors'
  ];

  const details = [
    'intricate mechanical details', 'organic flowing patterns',
    'geometric sacred geometry', 'dynamic particle effects',
    'reflective metallic surfaces', 'translucent crystalline structures',
    'weathered textures', 'holographic overlays'
  ];

  const colors = [
    'vibrant purple and teal palette', 'warm orange and gold tones',
    'cool blue and silver scheme', 'emerald green and copper accents',
    'crimson red and black contrast', 'pastel rainbow gradients',
    'monochromatic with dramatic shadows', 'iridescent color shifts'
  ];

  // Generate unique combinations based on iteration and timestamp
  const subjectIdx = (iteration + Math.floor(timestamp / 1000)) % subjects.length;
  const atmosphereIdx = Math.floor(randomValue * atmospheres.length);
  const styleIdx = (iteration * 3 + Math.floor(timestamp / 2000)) % styles.length;
  const detailIdx = (iteration * 7) % details.length;
  const colorIdx = Math.floor((randomValue + iteration / 100) * colors.length) % colors.length;

  // Add unique identifiers to ensure no caching
  const uniqueId = `${iteration}-${Math.floor(timestamp / 1000)}-${Math.floor(randomValue * 1000)}`;

  return `${subjects[subjectIdx]} ${atmospheres[atmosphereIdx]}, ${styles[styleIdx]}, featuring ${details[detailIdx]}, ${colors[colorIdx]}, highly detailed, professional composition, trending on artstation, unique piece ${uniqueId}`;
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
