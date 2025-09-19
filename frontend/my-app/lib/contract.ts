import { contractAddress } from '@/contracts/address';
import { ABI } from '@/contracts/ABI';

export const authWalletContract = {
  address: contractAddress as `0x${string}`,
  abi: ABI,
} as const;