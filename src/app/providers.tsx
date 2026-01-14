"use client";

import * as React from "react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, http } from "wagmi";
import { defineChain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Define Cronos Testnet chain
const cronosTestnet = defineChain({
  id: 338,
  name: "Cronos Testnet",
  network: "cronos-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "TCRO",
    symbol: "TCRO",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://evm-t3.cronos.org"],
    },
    public: {
      http: ["https://evm-t3.cronos.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Cronos Testnet Explorer",
      url: "https://explorer.cronos.org/testnet",
    },
  },
  testnet: true,
});

const config = getDefaultConfig({
  appName: "NFT Donation Platform",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [cronosTestnet],
  wallets: [
    {
      groupName: "Preferred",
      wallets: [metaMaskWallet],
    },
  ],
  transports: {
    [cronosTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://evm-t3.cronos.org"),
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
