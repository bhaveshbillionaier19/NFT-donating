"use client";

import * as React from "react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, http } from "wagmi";
import { type Chain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qie = {
  id: 1983,
  name: 'QIE Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QIE',
    symbol: 'QIE',
  },
  
  
  rpcUrls: {
    default: { http: ['https://rpc1testnet.qie.digital/'] },
    public: { http: ['https://rpc1testnet.qie.digital/'] },
  },
  blockExplorers: {
    default: { name: 'QIE Scan', url: 'https://testnet.qie.digital' },
  },
} as const satisfies Chain;

const config = getDefaultConfig({
  appName: "NFT Donation Platform",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [qie],
  wallets: [
    {
      groupName: "Preferred",
      wallets: [metaMaskWallet],
    },
  ],
  transports: {
    [qie.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://testnetqierpc1.digital/"),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
