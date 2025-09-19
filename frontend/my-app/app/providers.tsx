'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  polygonMumbai,
  optimismGoerli,
  arbitrumGoerli,
  baseGoerli,
  localhost,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// Custom Anvil chain configuration
const anvil = {
  ...localhost,
  id: 31337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
};

const config = getDefaultConfig({
  appName: 'Auth Wallet Access',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '1c21a3bb757c23dd706c3d73c2f8452b',
  chains: [
    // Local development
    anvil,
    // Mainnets
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    // Test networks
    sepolia,
    polygonMumbai,
    optimismGoerli,
    arbitrumGoerli,
    baseGoerli,
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}