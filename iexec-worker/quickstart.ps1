# iExec AI Worker Quick Start (Windows)
# PowerShell script for Windows users

Write-Host "🚀 iExec AI Worker Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Navigate to worker directory
Set-Location $PSScriptRoot

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check for API key
if (-not $env:IEXEC_SCRT_OPENAI_API_KEY) {
    Write-Host "⚠️  Warning: IEXEC_SCRT_OPENAI_API_KEY not set" -ForegroundColor Yellow
    Write-Host "   For local testing, set your OpenAI API key:"
    Write-Host "   `$env:IEXEC_SCRT_OPENAI_API_KEY='sk-your-key'"
    Write-Host ""
    
    $response = Read-Host "Do you want to set it now? (y/n)"
    if ($response -eq 'y') {
        $apiKey = Read-Host "Enter your OpenAI API key"
        $env:IEXEC_SCRT_OPENAI_API_KEY = $apiKey
        Write-Host "✅ API key set for this session" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⏭️  Skipping API key setup" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Test locally
Write-Host "🧪 Testing worker locally..." -ForegroundColor Yellow
$testResult = npm test
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Local test passed!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Local test failed. Please check the error above." -ForegroundColor Red
    exit 1
}

# Ask about Docker build
$buildDocker = Read-Host "Build Docker image now? (y/n)"
if ($buildDocker -eq 'y') {
    $dockerUsername = Read-Host "Enter your Docker Hub username"
    
    $imageName = "$dockerUsername/ai-donation-recommender:1.0.0"
    
    Write-Host "🔨 Building Docker image: $imageName" -ForegroundColor Yellow
    docker build -t $imageName .
    Write-Host "✅ Docker image built" -ForegroundColor Green
    Write-Host ""
    
    # Update iexec.json
    Write-Host "📝 Updating iexec.json with image name..." -ForegroundColor Yellow
    $iexecConfig = Get-Content iexec.json -Raw
    $iexecConfig = $iexecConfig -replace 'yournamespace/ai-donation-recommender:1.0.0', $imageName
    Set-Content iexec.json $iexecConfig
    Write-Host "✅ iexec.json updated" -ForegroundColor Green
    Write-Host ""
    
    # Ask about pushing
    $pushImage = Read-Host "Push image to Docker Hub? (y/n)"
    if ($pushImage -eq 'y') {
        Write-Host "🚀 Pushing to Docker Hub..." -ForegroundColor Yellow
        docker push $imageName
        Write-Host "✅ Image pushed successfully" -ForegroundColor Green
        Write-Host ""
        
        # Get image digest
        Write-Host "📋 Getting image digest..." -ForegroundColor Yellow
        $digest = docker image inspect $imageName --format='{{index .RepoDigests 0}}'
        $digest = $digest.Split('@')[1]
        Write-Host "Image digest: $digest" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  Manual step required:" -ForegroundColor Yellow
        Write-Host "   Update 'app.checksum' in iexec.json with: 0x$($digest.Replace('sha256:', ''))"
        Write-Host ""
    }
}

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Install iExec CLI: npm install -g iexec"
Write-Host "2. Create iExec wallet: iexec wallet create"
Write-Host "3. Get testnet RLC: https://faucet.bellecour.iex.ec/"
Write-Host "4. Deploy app: iexec app deploy --chain bellecour"
Write-Host "5. Store API key: iexec secret push OPENAI_API_KEY 'sk-your-key' --chain bellecour"
Write-Host ""
Write-Host "📖 For detailed instructions, see: ../docs/iexec-setup.md"
