'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { authWalletContract } from '@/lib/contract';
import { useState, useEffect, useMemo } from 'react';

interface OperationData {
  opId: bigint;
  mainWallet: string;
  authWallets: [string, string, string];
  approvalCount: bigint;
  rejectionCount: bigint;
  isAuthenticated: boolean;
  isRejected: boolean;
}

interface PendingOperation {
  operationId: bigint;
  operationData: OperationData;
}

export function ApprovalDashboard() {
  const { address } = useAccount();
  const [pendingOps, setPendingOps] = useState<PendingOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get pending operations for the connected wallet
  const { data: pendingOperationIds, refetch: refetchPending, error: pendingOpsError, isLoading: pendingOpsLoading } = useReadContract({
    ...authWalletContract,
    functionName: 'getPendingOperations',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchOnWindowFocus: true,
    },
  }) as { data: bigint[] | undefined; refetch: () => void; error: Error | null; isLoading: boolean };

  // Handle the case where the function exists but returns empty data
  const safePendingOperationIds = useMemo(() => pendingOperationIds || [], [pendingOperationIds]);

  // Debug logging
  useEffect(() => {
    console.log('Pending Operations Array Length:', safePendingOperationIds?.length || 0);
  }, [safePendingOperationIds]);

  // Contract write functions
  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: reject, data: rejectHash } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isRejectConfirming, isSuccess: isRejectSuccess } = useWaitForTransactionReceipt({
    hash: rejectHash,
  });

  // Fetch operation data for each pending operation
  useEffect(() => {
    if (!safePendingOperationIds || safePendingOperationIds.length === 0) {
      setPendingOps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Simply set the operation IDs - the OperationCard component will fetch detailed data
    const operations: PendingOperation[] = safePendingOperationIds.map(opId => ({
      operationId: opId,
      operationData: {
        opId: opId,
        mainWallet: '',
        authWallets: ['', '', ''],
        approvalCount: BigInt(0),
        rejectionCount: BigInt(0),
        isAuthenticated: false,
        isRejected: false,
      }
    }));

    setPendingOps(operations);
    setLoading(false);
  }, [safePendingOperationIds]);

  const handleApprove = (operationId: bigint) => {
    approve({
      ...authWalletContract,
      functionName: 'approve',
      args: [operationId],
    });
  };

  const handleReject = (operationId: bigint) => {
    reject({
      ...authWalletContract,
      functionName: 'notApprove',
      args: [operationId],
    });
  };

  // Refetch pending operations after transaction confirmation
  useEffect(() => {
    if (isApproveSuccess || isRejectSuccess) {
      const timer = setTimeout(() => {
        refetchPending();
        setRefreshTrigger(prev => prev + 1); // Trigger refresh of operation cards
      }, 2000); // Wait 2 seconds for blockchain to update
      
      return () => clearTimeout(timer);
    }
  }, [isApproveSuccess, isRejectSuccess, refetchPending]);

  const handleRefresh = () => {
    refetchPending();
    setRefreshTrigger(prev => prev + 1); // This will trigger refresh in OperationCard components
  };

  if (!address) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Approval Dashboard</h2>
        <p className="text-gray-600">Please connect your wallet to view pending operations.</p>
      </div>
    );
  }

  if (pendingOpsError) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Approval Dashboard</h2>
        <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="text-sm">Unable to load pending operations.</p>
          <p className="text-xs mt-1">This might be because you&apos;re not an auth wallet for any operations yet.</p>
          <button 
            onClick={() => refetchPending()}
            className="mt-2 text-sm bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading || pendingOpsLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Approval Dashboard</h2>
        <p>Loading pending operations...</p>
      </div>
    );
  }

  if (!safePendingOperationIds || safePendingOperationIds.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Approval Dashboard</h2>
          <button 
            onClick={handleRefresh}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
          >
            Refresh
          </button>
        </div>
        <p className="text-gray-600">No pending operations found for your wallet.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Approval Dashboard</h2>
        <button 
          onClick={handleRefresh}
          className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        You have {safePendingOperationIds?.length || 0} pending operation(s) to review
      </p>

      <div className="space-y-4">
        {pendingOps.map((op) => (
          <OperationCard
            key={op.operationId.toString()}
            operationId={op.operationId}
            onApprove={handleApprove}
            onReject={handleReject}
            isProcessing={isApproveConfirming || isRejectConfirming}
            refreshTrigger={refreshTrigger}
          />
        ))}
      </div>
    </div>
  );
}

// Individual operation card component
function OperationCard({ 
  operationId, 
  onApprove, 
  onReject, 
  isProcessing,
  refreshTrigger 
}: { 
  operationId: bigint;
  onApprove: (id: bigint) => void;
  onReject: (id: bigint) => void;
  isProcessing: boolean;
  refreshTrigger: number;
}) {
  // Fetch detailed operation data
  const { data: operationData, isLoading, refetch, error: operationError } = useReadContract({
    ...authWalletContract,
    functionName: 'getOperationData',
    args: [operationId],
    query: {
      refetchInterval: 5000,
      enabled: true,
    },
  });

  // Debug logging for operation data
  useEffect(() => {
    console.log(`Operation ${operationId.toString()} data:`, operationData);
  }, [operationId, operationData]);

  // Handle refresh trigger from parent component
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  // Refetch operation data periodically to keep it updated
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Refetch every 10 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  if (operationError) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <p className="text-red-600">Error loading operation {operationId.toString()}</p>
        <p className="text-sm text-red-500">{operationError.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <p>Loading operation {operationId.toString()}...</p>
      </div>
    );
  }

  if (!operationData) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <p>No data found for operation {operationId.toString()}</p>
      </div>
    );
  }

  // Handle both array format and object format from the contract
  let opId, mainWallet, approvalCount, rejectionCount, isAuthenticated, isRejected;
  
  if (Array.isArray(operationData)) {
    [opId, mainWallet, , approvalCount, rejectionCount, isAuthenticated, isRejected] = operationData;
  } else if (typeof operationData === 'object') {
    // Handle object format - extract only the fields we need
    const data = operationData as Record<string, unknown>;
    opId = data.opId;
    mainWallet = data.mainWallet;
    approvalCount = data.approvalCount;
    rejectionCount = data.rejectionCount;
    isAuthenticated = data.isAuthenticated;
    isRejected = data.isRejected;
  } else {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <p>Invalid data format for operation {operationId.toString()}</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="font-medium">Operation #{opId?.toString() || operationId.toString()}</h3>
        <div className="text-sm text-gray-500">
          {(approvalCount as bigint)?.toString() || '0'}/{(rejectionCount as bigint)?.toString() || '0'} votes
        </div>
      </div>
      
      <div className="text-sm space-y-1">
        <p><strong>Main Wallet:</strong> {(mainWallet as string)?.slice(0, 6)}...{(mainWallet as string)?.slice(-4)}</p>
        <p><strong>Status:</strong> 
          {isAuthenticated ? (
            <span className="text-green-600 ml-1">Authenticated</span>
          ) : isRejected ? (
            <span className="text-red-600 ml-1">Rejected</span>
          ) : (
            <span className="text-yellow-600 ml-1">Pending</span>
          )}
        </p>
        <p><strong>Approvals:</strong> {(approvalCount as bigint)?.toString() || '0'}</p>
        <p><strong>Rejections:</strong> {(rejectionCount as bigint)?.toString() || '0'}</p>
      </div>

      {!isAuthenticated && !isRejected && (
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => onApprove(operationId)}
            disabled={isProcessing}
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => onReject(operationId)}
            disabled={isProcessing}
            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
}