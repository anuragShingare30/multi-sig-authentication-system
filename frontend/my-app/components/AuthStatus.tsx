'use client'

import { useAccount, useReadContract } from 'wagmi';
import { authWalletContract } from '@/lib/contract';

export function AuthStatus() {
  const { address } = useAccount();

  const { data: isAuthenticated, isLoading } = useReadContract({
    ...authWalletContract,
    functionName: 'isAuthenticated',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const { data: userData } = useReadContract({
    ...authWalletContract,
    functionName: 'getUserData',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  if (!address) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
        <p>Loading authentication status...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Authentication Status</h3>
      
      <div className="space-y-2 text-sm">
        <p>
          <strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded ${
            isAuthenticated 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </p>
        
                {userData && Array.isArray(userData) && userData[0] > 0n ? (
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Your Registration Data:</h4>
            <p><strong>Operation ID:</strong> {(userData[0] as bigint).toString()}</p>
            <p><strong>Approvals:</strong> {(userData[3] as bigint).toString()}</p>
            <p><strong>Rejections:</strong> {(userData[4] as bigint).toString()}</p>
            <p><strong>Authenticated:</strong> {(userData[5] as boolean) ? 'Yes' : 'No'}</p>
            <p><strong>Rejected:</strong> {(userData[6] as boolean) ? 'Yes' : 'No'}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}