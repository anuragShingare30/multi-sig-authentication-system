'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function WalletConnection() {
  const { address, isConnected } = useAccount();

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        
        <div className="text-sm text-gray-600">
          Address: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-gray-600 font-semibold">
        Connect your wallet to continue
      </div>
      <ConnectButton />
    </div>
  );
}