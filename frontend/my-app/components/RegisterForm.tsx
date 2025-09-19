'use client'

import { useForm } from 'react-hook-form';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { authWalletContract } from '@/lib/contract';
import { useState, useEffect } from 'react';

interface RegisterFormData {
  authWallet1: string;
  authWallet2: string;
  authWallet3: string;
}

export function RegisterForm() {
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterFormData>();
  
  // Check if user already has authentication data
  const { data: userData, isLoading: isLoadingUserData, refetch: refetchUserData } = useReadContract({
    ...authWalletContract,
    functionName: 'getUserData',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });
  
  const { writeContract, data: hash, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      
      // Convert to address array format required by contract
      const authWallets = [data.authWallet1, data.authWallet2, data.authWallet3] as [string, string, string];
      
      writeContract({
        ...authWalletContract,
        functionName: 'register',
        args: ['0x0000000000000000000000000000000000000000', authWallets], // First param is ignored in contract
      });
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form on successful transaction
  useEffect(() => {
    if (isConfirmed) {
      reset();
      // Refetch user data to update status
      refetchUserData();
    }
  }, [isConfirmed, reset, refetchUserData]);

  // Check user authentication status
  const getUserStatus = () => {
    if (!userData || !Array.isArray(userData)) return null;
    
    const [opId, , , , , isAuthenticated, isRejected] = userData;
    
    // User has no operation
    if (!opId || opId === 0n) return null;
    
    // User is already authenticated
    if (isAuthenticated) return 'authenticated';
    
    // User operation was rejected
    if (isRejected) return 'rejected';
    
    // User has pending operation
    if (opId > 0n) return 'pending';
    
    return null;
  };

  const userStatus = getUserStatus();

  // Don't show form if user already has authentication or pending request
  if (!address) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Register for Authentication</h2>
        <p className="text-gray-600">Please connect your wallet to register for authentication.</p>
      </div>
    );
  }

  if (isLoadingUserData) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Register for Authentication</h2>
        <p>Checking your authentication status...</p>
      </div>
    );
  }

    // Show status if user already has authentication or pending request
  if (userStatus === 'authenticated') {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Authentication Status</h2>
          <button 
            onClick={() => refetchUserData()}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            Refresh
          </button>
        </div>
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-medium mb-2">✅ You are already authenticated!</h3>
          <p className="text-sm">Your wallet has been successfully authenticated by the auth wallets.</p>
        </div>
      </div>
    );
  }

  if (userStatus === 'pending') {
    const [opId, , , approvalCount, rejectionCount] = userData as readonly [bigint, string, readonly [string, string, string], bigint, bigint, boolean, boolean];
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Authentication Status</h2>
          <button 
            onClick={() => refetchUserData()}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            Refresh
          </button>
        </div>
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <h3 className="font-medium mb-2">⏳ Authentication Pending</h3>
          <p className="text-sm mb-3">You have already submitted an authentication request.</p>
          <div className="text-sm space-y-1">
            <p><strong>Operation ID:</strong> {opId.toString()}</p>
            <p><strong>Approvals:</strong> {approvalCount.toString()}</p>
            <p><strong>Rejections:</strong> {rejectionCount.toString()}</p>
          </div>
          <p className="text-xs mt-2">Please wait for the auth wallets to review your request.</p>
        </div>
      </div>
    );
  }

  if (userStatus === 'rejected') {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Register for Authentication</h2>
          <button 
            onClick={() => refetchUserData()}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            Refresh
          </button>
        </div>
        
        {/* Show rejection notice but allow re-registration */}
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
          <h3 className="font-medium mb-1">❌ Previous Request Rejected</h3>
          <p className="text-sm">Your previous authentication request was rejected. You can submit a new request below.</p>
        </div>

        {/* Show the registration form again */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="authWallet1" className="block text-sm font-medium mb-1">
              Auth Wallet 1
            </label>
            <input
              {...register('authWallet1', { 
                required: 'Auth wallet 1 is required',
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: 'Invalid Ethereum address'
                }
              })}
              type="text"
              placeholder="0x..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.authWallet1 && (
              <p className="text-red-500 text-sm mt-1">{errors.authWallet1.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="authWallet2" className="block text-sm font-medium mb-1">
              Auth Wallet 2
            </label>
            <input
              {...register('authWallet2', { 
                required: 'Auth wallet 2 is required',
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: 'Invalid Ethereum address'
                }
              })}
              type="text"
              placeholder="0x..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.authWallet2 && (
              <p className="text-red-500 text-sm mt-1">{errors.authWallet2.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="authWallet3" className="block text-sm font-medium mb-1">
              Auth Wallet 3
            </label>
            <input
              {...register('authWallet3', { 
                required: 'Auth wallet 3 is required',
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: 'Invalid Ethereum address'
                }
              })}
              type="text"
              placeholder="0x..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.authWallet3 && (
              <p className="text-red-500 text-sm mt-1">{errors.authWallet3.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isConfirming}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConfirming ? 'Confirming...' : isSubmitting ? 'Submitting...' : 'Register Again'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="text-sm">Error: {error.message}</p>
          </div>
        )}

        {isConfirmed && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="text-sm">Registration successful!</p>
          </div>
        )}
      </div>
    );
  }

  // Default case: show registration form for new users
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Register for Authentication</h2>
        <button 
          onClick={() => refetchUserData()}
          className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="authWallet1" className="block text-sm font-medium mb-1">
            Auth Wallet 1
          </label>
          <input
            {...register('authWallet1', { 
              required: 'Auth wallet 1 is required',
              pattern: {
                value: /^0x[a-fA-F0-9]{40}$/,
                message: 'Invalid Ethereum address'
              }
            })}
            type="text"
            placeholder="0x..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.authWallet1 && (
            <p className="text-red-500 text-sm mt-1">{errors.authWallet1.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="authWallet2" className="block text-sm font-medium mb-1">
            Auth Wallet 2
          </label>
          <input
            {...register('authWallet2', { 
              required: 'Auth wallet 2 is required',
              pattern: {
                value: /^0x[a-fA-F0-9]{40}$/,
                message: 'Invalid Ethereum address'
              }
            })}
            type="text"
            placeholder="0x..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.authWallet2 && (
            <p className="text-red-500 text-sm mt-1">{errors.authWallet2.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="authWallet3" className="block text-sm font-medium mb-1">
            Auth Wallet 3
          </label>
          <input
            {...register('authWallet3', { 
              required: 'Auth wallet 3 is required',
              pattern: {
                value: /^0x[a-fA-F0-9]{40}$/,
                message: 'Invalid Ethereum address'
              }
            })}
            type="text"
            placeholder="0x..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.authWallet3 && (
            <p className="text-red-500 text-sm mt-1">{errors.authWallet3.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isConfirming}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConfirming ? 'Confirming...' : isSubmitting ? 'Submitting...' : 'Register'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm">Error: {error.message}</p>
        </div>
      )}

      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="text-sm">Registration successful!</p>
        </div>
      )}
    </div>
  );
}