"use client";

import * as React from "react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "NFT Donation Platform",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [sepolia],
  wallets: [
    {
      groupName: "Preferred",
      wallets: [metaMaskWallet],
    },
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.org"),
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
