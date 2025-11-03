# 🔥 OpenAI Token Burner - Tier Upgrader

> Automated OpenAI token consumption tool to help upgrade your API usage tier

A high-performance Node.js script powered by **Bun** that consumes OpenAI tokens through text generation (GPT-5 models) and image generation (GPT-Image-1) to help you systematically increase your API usage and unlock higher tier limits.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)

## Why this script?

OpenAI automatically assigns users to usage tiers based on payment history and API usage patterns. Higher tiers offer:
- Higher rate limits (TPM/RPM)
- Priority access to new models
- Better availability and SLA

This script generates API requests with long prompts and responses to maximize token consumption in a controlled manner. It supports **image generation** with GPT-Image-1 (high quality) and a **mixed mode** that intelligently alternates between text and image models.

## Installation

This script uses **Bun** for better performance. Install dependencies with:

```bash
bun install
```

If you don't have Bun installed, get it at [bun.sh](https://bun.sh) or install with:
```bash
curl -fsSL https://bun.sh/install | bash
```

## Configuration

1. Create a `.env` file from the example:
```bash
cp .env.example .env
```

2. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-...
```

## Usage

### Predefined NPM Scripts

#### Text models only

```bash
# Use GPT-5 Mini (100 iterations - recommended to start)
bun run burn:mini

# Use GPT-5 Nano (100 iterations - most economical)
bun run burn:nano

# Use GPT-5 (50 iterations - more expensive, more tokens)
bun run burn:gpt5
```

#### Image generation

```bash
# Image generation with GPT-Image-1 (50 iterations, high quality)
bun run burn:image
```

#### Mixed mode (RECOMMENDED)

```bash
# Balanced mixed mode: 70% text, 30% images (100 iterations)
bun run burn:mixed

# Aggressive mixed mode: 60% text, 40% images (200 iterations)
bun run burn:aggressive

# Basic usage (mixed mode by default)
bun start
```

### Advanced usage with options

```bash
bun burn-tokens.js [options]
```

#### Available options

- `--model=<model>` : Model to use (default: `mixed`)
  - **Text models:**
    - `gpt-5` : Most advanced model
    - `gpt-5-mini` : Good cost/performance balance
    - `gpt-5-nano` : Most economical
  - **Image model:**
    - `gpt-image-1` : GPT-4o image generation (high quality)
  - **Mixed mode:**
    - `mixed` : Alternates between text and image models (default)

- `--iterations=<number>` : Number of requests to perform (default: 10)

- `--concurrency=<number>` : Number of parallel requests (default: 10)
  - Higher values = faster execution
  - Be careful with rate limits (adjust based on your tier)
  - Recommended: 10-20 for most tiers

- `--delay=<ms>` : Delay between batches in milliseconds (default: 0)
  - Only needed if you hit rate limits
  - Applies between batches, not individual requests

- `--mix-ratio=<text:image>` : Text:image ratio in mixed mode (default: `70:30`)
  - Ex: `70:30` = 70% text, 30% images
  - Ex: `50:50` = half and half
  - Ex: `80:20` = mostly text

- `--verbose` : Display more details on each request

#### Examples

```bash
# Custom mixed mode with 50-50 text/images and high concurrency
bun burn-tokens.js --model=mixed --iterations=30 --mix-ratio=50:50 --concurrency=15

# Image generation only with GPT-Image-1
bun burn-tokens.js --model=gpt-image-1 --iterations=15 --concurrency=10 --verbose

# Text only mode with GPT-5 Mini, maximum speed
bun burn-tokens.js --model=gpt-5-mini --iterations=100 --concurrency=20

# Aggressive mode to burn tokens quickly with high parallelization
bun burn-tokens.js --model=mixed --iterations=200 --concurrency=20 --mix-ratio=60:40
```

## Features

- **Multi-model support:**
  - Text models: GPT-5, GPT-5 Mini, GPT-5 Nano
  - Image generation: GPT-Image-1 (high quality)
  - Mixed mode with customizable ratio
- **Smart selection:**
  - Automatic rotation between different models in mixed mode
  - Balanced distribution according to configured ratio
- **High performance:**
  - Parallel request processing with configurable concurrency
  - Batch processing for optimal throughput
  - Significantly faster than sequential execution
- **Tracking and statistics:**
  - Real-time consumption tracking (tokens + images)
  - Cost estimation by request type
  - Detailed session statistics (text vs images)
- **Robustness:**
  - Error and rate limit handling
  - Verbose mode for debugging
  - Graceful shutdown with Ctrl+C
- **Flexibility:**
  - Command line configuration
  - Predefined NPM scripts for common use cases

## Example output

### Mixed mode

```
╔══════════════════════════════════════════════════════════════╗
║           OpenAI Token Burner - Tier Upgrader                ║
╚══════════════════════════════════════════════════════════════╝

Configuration:
  - Model: mixed (Mixed Mode - 70:30)
  - Iterations: 20
  - Delay: 1500ms
  - Verbose: false

Starting token burning session...

[1/20] ✓ Text | Model: gpt-5-mini | Tokens: 5,234 | Cost: $0.0394 | Time: 3421ms
[2/20] ✓ Text | Model: gpt-5-nano | Tokens: 4,891 | Cost: $0.0123 | Time: 2854ms
[3/20] ✓ Text | Model: gpt-5 | Tokens: 6,234 | Cost: $0.1234 | Time: 4521ms
[4/20] ✓ Image | Model: gpt-image-1 | Size: 1024x1024 | Cost: $0.0200 | Time: 8234ms
[5/20] ✓ Text | Model: gpt-5-mini | Tokens: 5,891 | Cost: $0.0443 | Time: 3654ms
[6/20] ✓ Image | Model: dall-e-3 | Size: 1024x1024 | Cost: $0.0400 | Time: 9102ms
...

╔══════════════════════════════════════════════════════════════╗
║                     Session Summary                          ║
╚══════════════════════════════════════════════════════════════╝

Total Tokens Used: 72,431
Estimated Cost: $0.8245
Successful Requests: 20 (14 text, 6 images)
Failed Requests: 0
Total Duration: 94.23s
Average Tokens/Text Request: 5174

Tier Upgrade Info:
- Check your usage tier at: https://platform.openai.com/settings/organization/limits
- Higher tiers unlock better rate limits (TPM/RPM)
- Tier advancement is based on payment history and usage over time

Next Steps:
1. Monitor your account for tier upgrades
2. Run this script regularly to maintain usage
3. Try mixed mode for balanced token consumption: --model=mixed --mix-ratio=70:30
```

## Tracking your tier

1. Check your current tier: [OpenAI Platform - Limits](https://platform.openai.com/settings/organization/limits)
2. Tiers are automatically updated based on your usage
3. Tier upgrades can take a few days to a few weeks

## OpenAI Tiers (2025)

| Tier | TPM (GPT-5) | RPM | Requirements |
|------|-------------|-----|-----------|
| Tier 1 | 500,000 | 1,000 | Initial usage |
| Tier 2 | 1,000,000 | 2,000 | Regular usage |
| Tier 3+ | Higher | Higher | Sustained usage and payments |

## Usage tips

1. **Start with mixed mode**: `npm run burn:mixed` offers the best balance
2. **Vary models**: Mixed mode automatically uses different models (text + images)
3. **Respect rate limits**: Increase delay if you encounter 429 errors
4. **Monitor costs**: The script displays estimates, but check your OpenAI dashboard
5. **Regular usage**: Better to use regularly than burn massively at once
6. **Optimize your ratio**: Adjust `--mix-ratio` based on your budget (images more expensive than text)
7. **Patience**: Tier upgrades take time, continue progressive usage

## Recommended strategies

### Limited budget
```bash
# Favor economical models and more text
bun run burn:nano
# or in mixed mode
bun burn-tokens.js --model=mixed --mix-ratio=90:10 --iterations=50
```

### Medium budget
```bash
# Balanced mixed mode (recommended)
bun run burn:mixed
```

### High budget
```bash
# Aggressive mode with more images
bun run burn:aggressive
# or custom
bun burn-tokens.js --model=mixed --mix-ratio=50:50 --iterations=100
```

## Estimated costs

### Text models (per 1M tokens)

| Model | Input | Output |
|--------|-------|--------|
| GPT-5 | $15 | $60 |
| GPT-5 Mini | $1.50 | $6 |
| GPT-5 Nano | $0.40 | $1.60 |

### Image models (per image, high quality)

| Model | 1024x1024 | 1536x1536 | 2048x2048 |
|--------|-----------|-----------|-----------|
| GPT-Image-1 | $0.19 | $0.38 | $0.75 |

Actual costs may vary. Check [OpenAI Pricing](https://openai.com/pricing) for current rates.

### Cost estimate per session

**Mixed mode (70:30) - 100 iterations:**
- ~70 text requests (GPT-5 Mini): ~350k tokens → ~$2.63
- ~30 images (GPT-Image-1, high quality): 30 images → ~$5.70
- **Total estimated: ~$8.33**

**Text only mode (GPT-5 Mini) - 100 iterations:**
- ~100 text requests: ~500k tokens → ~$3.75

**Image only mode (GPT-Image-1, high quality) - 50 iterations:**
- ~50 images: → ~$9.50

## Security

- Never commit your `.env` file
- Keep your API key secret
- Monitor your usage in the OpenAI dashboard
- Configure spending limits if necessary

## Emergency stop

Press `Ctrl+C` to stop the script at any time. A summary of tokens used will be displayed.

## Limitations and notes

- Cost estimates are approximate
- Tier upgrades depend on multiple factors (history, payments, etc.)
- Image generation is slower than text requests
- Generated images are not saved locally (temporary URLs)
- In mixed mode, models are randomly selected within their category

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

⚠️ **Use this script responsibly.** You are responsible for all costs incurred by using the OpenAI API.

- Always monitor your usage in the OpenAI dashboard
- Configure spending limits to avoid unexpected charges
- This tool is for legitimate tier upgrade purposes only
- Ensure compliance with OpenAI's Terms of Service

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the OpenAI API documentation

---

**Star ⭐ this repository if you find it helpful!**
