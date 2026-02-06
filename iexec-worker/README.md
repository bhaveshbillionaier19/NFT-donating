# iExec AI Donation Recommender Worker

This is an iExec worker application that provides AI-powered NFT donation recommendations using OpenAI's GPT models.

## Overview

The worker receives donation history and NFT data, analyzes it using GPT, and returns personalized recommendations with explanations and confidence scores.

## Architecture

- **Runtime**: Node.js 18 in Docker container
- **AI Model**: GPT-4o-mini (OpenAI)
- **Security**: Runs in iExec Scone TEE (Trusted Execution Environment)
- **Secrets**: GPT API key managed via iExec SMS

## Input Format

```json
{
  "userAddress": "0x...",
  "donationHistory": [
    {
      "nftId": "1",
      "nftName": "Project Name",
      "amount": "0.05",
      "category": "Environment"
    }
  ],
  "allNFTs": [
    {
      "tokenId": "1",
      "name": "NFT Name",
      "description": "Description",
      "category": "Category",
      "totalDonations": "0.5"
    }
  ]
}
```

## Output Format

```json
{
  "recommendations": [
    {
      "nftId": "2",
      "reason": "This NFT aligns with your environmental interests...",
      "confidence": 85
    }
  ]
}
```

## Local Testing

### Prerequisites

- Node.js 18+
- OpenAI API key (for testing)

### Steps

1. Install dependencies:
```bash
cd iexec-worker
npm install
```

2. Set your OpenAI API key (for local testing only):
```bash
export IEXEC_SCRT_OPENAI_API_KEY="sk-your-api-key"
```

3. Run with sample input:
```bash
npm test
```

Or test manually:
```bash
cat test/sample-input.json | node src/app.js
```

## Deployment to iExec

### Prerequisites

1. Install iExec SDK:
```bash
npm install -g iexec
```

2. Initialize iExec wallet:
```bash
iexec wallet create
# Fund wallet with RLC tokens on Bellecour testnet
```

3. Create Docker Hub account and login:
```bash
docker login
```

### Build and Push Docker Image

```bash
# Build the image
docker build -t yournamespace/ai-donation-recommender:1.0.0 .

# Test locally
docker run -i yournamespace/ai-donation-recommender:1.0.0 < test/sample-input.json

# Push to Docker Hub
docker push yournamespace/ai-donation-recommender:1.0.0
```

### Deploy to iExec

1. Update `iexec.json`:
   - Set `app.owner` to your iExec wallet address
   - Set `app.multiaddr` to your Docker image path
   - Calculate checksum:
   ```bash
   docker pull yournamespace/ai-donation-recommender:1.0.0
   docker inspect yournamespace/ai-donation-recommender:1.0.0 | grep -i sha256
   ```

2. Deploy the app:
```bash
iexec app deploy
```

3. Store your OpenAI API key in iExec SMS:
```bash
iexec secrets push OPENAI_API_KEY "sk-your-actual-api-key"
```

### Run a Task

```bash
# Prepare input file
echo '{"userAddress":"0x...","donationHistory":[],"allNFTs":[...]}' > input.json

# Submit task
iexec app run <app-address> \
  --dataset <input-dataset> \
  --secret OPENAI_API_KEY \
  --tag tee,scone \
  --watch

# View result
iexec task show <task-id> --download
```

## Security Notes

- ✅ GPT API key is **never** exposed in code or logs
- ✅ API key stored encrypted in iExec SMS
- ✅ Computation runs in Scone TEE (hardware-protected)
- ✅ User data is not stored permanently
- ✅ Only result hash is recorded on-chain

## Cost Estimation

- **iExec Computation**: ~0.1-0.5 RLC per task
- **GPT-4o-mini API**: ~$0.01-0.02 per recommendation
- **Total per request**: <$0.05 equivalent

## Troubleshooting

### "API key not found"
- Ensure API key is pushed to SMS: `iexec secrets check OPENAI_API_KEY`
- Verify `buyConf.params.SMSSecretId` in `iexec.json`

### "Invalid JSON response"
- GPT sometimes returns markdown. Check logs and adjust prompt if needed.
- Consider increasing `max_tokens` in `src/app.js`

### Task timeout
- Default timeout is 5 minutes
- Increase with `--max-duration` flag when running task
- Optimize prompt to reduce GPT response time

## Development

To modify the recommendation logic, edit `src/app.js`:

- `buildPrompt()`: Customize GPT prompt
- `getRecommendations()`: Adjust GPT parameters (model, temperature, etc.)
- `main()`: Add preprocessing or post-processing logic

After changes, rebuild and redeploy the Docker image.
