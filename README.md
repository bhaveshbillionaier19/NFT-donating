# NFT Donation Platform with AI Recommendations

A decentralized NFT donation platform on Ethereum Sepolia with AI-powered donation recommendations running on iExec.

## 🌟 Features

- **NFT Minting**: Create donation-backed NFTs with IPFS metadata
- **ETH Donations**: Direct peer-to-peer donations to NFT creators
- **AI Recommendations**: Get personalized NFT suggestions powered by GPT via iExec
- **Secure Computation**: GPT API runs in iExec's Trusted Execution Environment (TEE)
- **On-Chain Tracking**: Transparent donation history on Ethereum
- **Web3 Wallet**: Connect with MetaMask or other Web3 wallets

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │──────│   Ethereum   │──────│    IPFS     │
│  (Next.js)  │      │   Sepolia    │      │  (Pinata)   │
└──────┬──────┘      └──────────────┘      └─────────────┘
       │
       │ Trigger AI Task
       │
       ▼
┌──────────────┐
│     iExec    │
│  Bellecour   │
└──────┬───────┘
       │
       │ Run in TEE
       │
       ▼
┌──────────────┐
│  GPT Worker  │ ◄─── API Key (encrypted in SMS)
│  (Docker)    │
└──────────────┘
```

### Key Principles

- ✅ **Zero Trust**: GPT API key never exposed to frontend/backend
- ✅ **Confidential Computing**: All AI runs in hardware-protected TEE
- ✅ **Decentralized**: No centralized server for AI computation
- ✅ **Verifiable**: All computation verifiable on-chain

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.local` and update:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed NFT contract
- `NEXT_PUBLIC_IEXEC_APP_ADDRESS`: Your deployed iExec worker app (see setup guide)

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🤖 AI Setup (iExec)

To enable AI recommendations, you need to deploy the iExec worker. Follow the comprehensive guide:

📖 **[iExec Setup Guide](./docs/iexec-setup.md)**

Summary:
1. Install iExec CLI
2. Build and deploy Docker worker
3. Store GPT API key in iExec SMS
4. Configure frontend with app address

## 📁 Project Structure

```
nftdonation_sepolia/
├── contracts/              # Solidity smart contracts
│   └── NFTDonation.sol
├── iexec-worker/          # iExec AI worker application
│   ├── src/app.js         # Main worker logic
│   ├── Dockerfile         # Docker configuration
│   └── iexec.json         # iExec app configuration
├── src/
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   │   └── AIRecommendations.tsx  # AI UI component
│   ├── hooks/             # React hooks
│   │   └── useAIRecommendation.ts
│   └── lib/               # Utilities
│       └── iexec.ts       # iExec SDK utilities
├── docs/                  # Documentation
│   └── iexec-setup.md     # iExec setup guide
└── scripts/               # Deployment scripts
```

## 🔐 Security

- **Smart Contract**: Audited for reentrancy and access control
- **API Keys**: Stored encrypted in iExec SMS, never in code
- **TEE**: All AI computation runs in Scone Trusted Execution Environment
- **No Storage**: User data not stored permanently, only processed

## 🧪 Testing

```bash
# Test iExec worker locally
cd iexec-worker
export IEXEC_SCRT_OPENAI_API_KEY="sk-test-key"
npm test

# Run frontend tests
npm test
```

## 💰 Cost Estimation

Per AI recommendation request:
- **iExec computation**: ~0.1-0.5 RLC (~$0.02-0.10)
- **GPT API call**: ~$0.01-0.02
- **Total**: <$0.15 per request

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Blockchain**: Ethereum (Sepolia testnet), Solidity, Hardhat
- **Web3**: wagmi, viem, RainbowKit
- **Storage**: IPFS (Pinata)
- **AI**: OpenAI GPT-4o-mini
- **Off-Chain Compute**: iExec (Bellecour testnet)

## 📚 Documentation

- [iExec Setup Guide](./docs/iexec-setup.md)
- [Worker README](./iexec-worker/README.md)
- [Smart Contract docs](./contracts/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [iExec Documentation](https://docs.iex.ec/)
- [OpenAI API](https://platform.openai.com/docs)
- [Ethereum Sepolia](https://sepolia.etherscan.io/)

