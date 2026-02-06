# iExec AI Donation Recommendation Setup Guide

This guide walks you through setting up the AI-powered donation recommendation system using iExec.

## Prerequisites

Before you begin, ensure you have:

- [x] Node.js 18+ installed
- [x] Docker Desktop installed and running
- [x] An OpenAI API key (get one at https://platform.openai.com/api-keys)
- [ ] iExec CLI installed globally
- [ ] Docker Hub account (for hosting worker image)
- [ ] Wallet with RLC tokens on iExec Bellecour testnet

## Step 1: Install iExec CLI

```bash
npm install -g iexec
```

Verify installation:
```bash
iexec --version
```

## Step 2: Initialize iExec Wallet

```bash
# Create a new wallet (or import existing)
iexec wallet create

# This will generate a wallet.json file - KEEP IT SAFE!
# Note down your wallet address
iexec wallet show
```

## Step 3: Get RLC Tokens (Testnet)

1. Visit the iExec faucet: https://faucet.bellecour.iex.ec/
2. Enter your wallet address
3. Request testnet RLC tokens
4. Wait for confirmation (1-2 minutes)

Verify balance:
```bash
iexec wallet show
```

## Step 4: Build and Deploy Worker

### 4.1 Build Docker Image

Navigate to the worker directory:
```bash
cd iexec-worker
```

Build the image (replace `yournamespace` with your Docker Hub username):
```bash
docker build -t yournamespace/ai-donation-recommender:1.0.0 .
```

### 4.2 Test Locally

Test the worker with sample data:
```bash
export IEXEC_SCRT_OPENAI_API_KEY="sk-your-test-api-key"
npm test
```

You should see AI recommendations in the output.

### 4.3 Push to Docker Hub

Login to Docker Hub:
```bash
docker login
```

Push the image:
```bash
docker push yournamespace/ai-donation-recommender:1.0.0
```

### 4.4 Update iExec Configuration

Edit `iexec-worker/iexec.json`:

1. Set `app.owner` to your wallet address (from Step 2)
2. Set `app.multiaddr` to `registry.hub.docker.com/yournamespace/ai-donation-recommender:1.0.0`
3. Calculate and set checksum:

```bash
docker image inspect yournamespace/ai-donation-recommender:1.0.0 --format='{{index .RepoDigests 0}}'
```

Copy the sha256 hash and paste into `app.checksum` field (prepend with `0x`).

### 4.5 Deploy to iExec

From the `iexec-worker` directory:

```bash
iexec app deploy --chain bellecour
```

Note down the deployed app address - you'll need it for the frontend!

## Step 5: Store OpenAI API Key in iExec SMS

Store your API key securely:

```bash
iexec secret push OPENAI_API_KEY "sk-your-actual-openai-key" --chain bellecour
```

Verify it's stored:
```bash
iexec secret check OPENAI_API_KEY --chain bellecour
```

## Step 6: Configure Frontend

Back in the project root, update `.env.local`:

```bash
NEXT_PUBLIC_IEXEC_APP_ADDRESS=<your-deployed-app-address>
NEXT_PUBLIC_IEXEC_NETWORK=bellecour
```

Replace `<your-deployed-app-address>` with the address from Step 4.5.

## Step 7: Install Frontend Dependencies

```bash
npm install
```

This installs the iExec SDK and other dependencies.

## Step 8: Test the Integration

Start the development server:
```bash
npm run dev
```

1. Open http://localhost:3000
2. Connect your wallet (should have RLC tokens)
3. Scroll to "AI Recommendations" section
4. Click "Get AI Recommendations"
5. Wait 30-90 seconds for iExec to process
6. View your personalized recommendations!

## Troubleshooting

### "Cannot find module 'iexec'"

Run `npm install` to install dependencies.

### "iExec app not configured"

Ensure `NEXT_PUBLIC_IEXEC_APP_ADDRESS` is set in `.env.local`and is not the default zero address.

### "Insufficient RLC balance"

Request more tokens from the faucet or check your wallet has enough RLC for computation.

### "Task timeout"

The default timeout is 5 minutes. This is usually enough, but if GPT is slow:
- Check OpenAI API status
- Consider upgrading to a faster model
- Reduce the number of NFTs being analyzed

### "API key not found in iExec secrets"

Verify the secret is properly stored:
```bash
iexec secret check OPENAI_API_KEY --chain bellecour
```

If not found, push it again (Step 5).

## Cost Estimation

Each recommendation request costs:
- **iExec computation**: ~0.1-0.5 RLC (~$0.02-0.10 USD)
- **GPT API**: ~$0.01-0.02 USD per request
- **Total**: <$0.15 per recommendation

For production, consider implementing caching to reduce costs.

## Security Checklist

- [x] GPT API key stored ONLY in iExec SMS
- [x] Worker runs in Scone TEE (hardware-protected)
- [x] No API calls to OpenAI from frontend
- [x] No permanent user data storage
- [x] All computation verifiable on-chain

## Next Steps

1. Test with real donation data
2. Fine-tune GPT prompts for better recommendations
3. Add caching layer for frequently requested recommendations
4. Monitor costs and optimize as needed
5. Deploy to mainnet when ready

## Support

- iExec Documentation: https://docs.iex.ec/
- iExec Discord: https://discord.gg/iExec
- OpenAI Documentation: https://platform.openai.com/docs
