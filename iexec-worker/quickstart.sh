#!/bin/bash

# Quick Start Script for iExec Worker Development
# This script helps you build, test, and prepare the worker for deployment

set -e  # Exit on error

echo "🚀 iExec AI Worker Quick Start"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Navigate to worker directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check for API key
if [ -z "$IEXEC_SCRT_OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: IEXEC_SCRT_OPENAI_API_KEY not set"
    echo "   For local testing, set your OpenAI API key:"
    echo "   export IEXEC_SCRT_OPENAI_API_KEY='sk-your-key'"
    echo ""
    read -p "Do you want to set it now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your OpenAI API key: " api_key
        export IEXEC_SCRT_OPENAI_API_KEY="$api_key"
        echo "✅ API key set for this session"
        echo ""
    else
        echo "⏭️  Skipping API key setup"
        echo ""
    fi
fi

# Test locally
echo "🧪 Testing worker locally..."
if npm test; then
    echo "✅ Local test passed!"
    echo ""
else
    echo "❌ Local test failed. Please check the error above."
    exit 1
fi

# Ask about Docker build
read -p "Build Docker image now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Ask for Docker Hub username
    read -p "Enter your Docker Hub username: " docker_username
    
    IMAGE_NAME="$docker_username/ai-donation-recommender:1.0.0"
    
    echo "🔨 Building Docker image: $IMAGE_NAME"
    docker build -t "$IMAGE_NAME" .
    echo "✅ Docker image built"
    echo ""
    
    # Update iexec.json
    echo "📝 Updating iexec.json with image name..."
    # Use a simple sed replacement (works on Linux/Mac, may need adjustment for Windows)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|yournamespace/ai-donation-recommender:1.0.0|$IMAGE_NAME|g" iexec.json
    else
        sed -i "s|yournamespace/ai-donation-recommender:1.0.0|$IMAGE_NAME|g" iexec.json
    fi
    echo "✅ iexec.json updated"
    echo ""
    
    # Ask about pushing
    read -p "Push image to Docker Hub? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Pushing to Docker Hub..."
        docker push "$IMAGE_NAME"
        echo "✅ Image pushed successfully"
        echo ""
        
        # Get image digest
        echo "📋 Getting image digest..."
        DIGEST=$(docker image inspect "$IMAGE_NAME" --format='{{index .RepoDigests 0}}' | cut -d'@' -f2)
        echo "Image digest: $DIGEST"
        echo ""
        echo "⚠️  Manual step required:"
        echo "   Update 'app.checksum' in iexec.json with: 0x${DIGEST#sha256:}"
        echo ""
    fi
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Install iExec CLI: npm install -g iexec"
echo "2. Create iExec wallet: iexec wallet create"
echo "3. Get testnet RLC: https://faucet.bellecour.iex.ec/"
echo "4. Deploy app: iexec app deploy --chain bellecour"
echo "5. Store API key: iexec secret push OPENAI_API_KEY 'sk-your-key' --chain bellecour"
echo ""
echo "📖 For detailed instructions, see: ../docs/iexec-setup.md"
