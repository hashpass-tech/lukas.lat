import { Contract, TransactionResponse, isAddress, BigNumberish } from 'ethers';
import type { TokenInfo, BigNumber, TransferEvent, ApprovalEvent } from '../types';
import type { TokenService } from './TokenService';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Implementation of TokenService for LUKAS token operations
 */
export class TokenServiceImpl implements TokenService {
  private contract: Contract;
  private contractAddress: string;
  private transferListeners: Map<string, (event: TransferEvent) => void> = new Map();
  private approvalListeners: Map<string, (event: ApprovalEvent) => void> = new Map();
  private listenerCounter = 0;

  constructor(contract: Contract, contractAddress: string) {
    if (!contract) {
      throw new Error('Contract instance is required');
    }
    if (!contractAddress || !isAddress(contractAddress)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_ADDRESS,
        `Invalid contract address: ${contractAddress}`
      );
    }
    this.contract = contract;
    this.contractAddress = contractAddress;
  }

  /**
   * Validate an Ethereum address
   */
  private validateAddress(address: string, fieldName: string = 'address'): void {
    if (!address || !isAddress(address)) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_ADDRESS,
        `Invalid ${fieldName}: ${address}`
      );
    }
  }

  /**
   * Validate an amount is a valid positive number
   */
  private validateAmount(amount: BigNumberish, fieldName: string = 'amount'): void {
    if (amount === null || amount === undefined) {
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_AMOUNT,
        `${fieldName} is required`
      );
    }
    
    try {
      const amountBN = typeof amount === 'string' ? BigInt(amount) : BigInt(amount.toString());
      if (amountBN < 0n) {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_AMOUNT,
          `${fieldName} must be non-negative`
        );
      }
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.INVALID_AMOUNT,
        `Invalid ${fieldName}: ${amount}`
      );
    }
  }

  /**
   * Get token information (name, symbol, decimals)
   */
  async getTokenInfo(): Promise<TokenInfo> {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        (this.contract as any).name(),
        (this.contract as any).symbol(),
        (this.contract as any).decimals(),
        (this.contract as any).totalSupply(),
      ]);

      // Validate response data
      if (!name || typeof name !== 'string') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid token name returned from contract'
        );
      }
      if (!symbol || typeof symbol !== 'string') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid token symbol returned from contract'
        );
      }
      if (typeof decimals !== 'number' && typeof decimals !== 'bigint') {
        throw new LukasSDKError(
          LukasSDKErrorCode.INVALID_RESPONSE,
          'Invalid token decimals returned from contract'
        );
      }

      return {
        name,
        symbol,
        decimals: Number(decimals),
        address: this.contractAddress,
        totalSupply: totalSupply.toString(),
      };
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get token info',
        error
      );
    }
  }

  /**
   * Get token balance for an address
   */
  async getBalance(address: string): Promise<BigNumber> {
    try {
      this.validateAddress(address, 'address');
      const balance = await (this.contract as any).balanceOf(address);
      return balance.toString();
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        `Failed to get balance for ${address}`,
        error
      );
    }
  }

  /**
   * Get allowance for a spender
   */
  async getAllowance(owner: string, spender: string): Promise<BigNumber> {
    try {
      this.validateAddress(owner, 'owner');
      this.validateAddress(spender, 'spender');
      const allowance = await (this.contract as any).allowance(owner, spender);
      return allowance.toString();
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        `Failed to get allowance for owner ${owner} and spender ${spender}`,
        error
      );
    }
  }

  /**
   * Get total supply of tokens
   */
  async getTotalSupply(): Promise<BigNumber> {
    try {
      const totalSupply = await (this.contract as any).totalSupply();
      return totalSupply.toString();
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.CONTRACT_CALL_FAILED,
        'Failed to get total supply',
        error
      );
    }
  }

  /**
   * Transfer tokens to another address
   */
  async transfer(to: string, amount: BigNumber): Promise<TransactionResponse> {
    try {
      this.validateAddress(to, 'recipient address');
      this.validateAmount(amount, 'transfer amount');
      const tx = await (this.contract as any).transfer(to, amount);
      return tx;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.TRANSACTION_FAILED,
        `Failed to transfer ${amount} tokens to ${to}`,
        error
      );
    }
  }

  /**
   * Approve spender to use tokens
   */
  async approve(spender: string, amount: BigNumber): Promise<TransactionResponse> {
    try {
      this.validateAddress(spender, 'spender address');
      this.validateAmount(amount, 'approval amount');
      const tx = await (this.contract as any).approve(spender, amount);
      return tx;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.TRANSACTION_FAILED,
        `Failed to approve ${spender} for ${amount} tokens`,
        error
      );
    }
  }

  /**
   * Transfer tokens from one address to another (requires allowance)
   */
  async transferFrom(from: string, to: string, amount: BigNumber): Promise<TransactionResponse> {
    try {
      this.validateAddress(from, 'from address');
      this.validateAddress(to, 'to address');
      this.validateAmount(amount, 'transfer amount');
      const tx = await (this.contract as any).transferFrom(from, to, amount);
      return tx;
    } catch (error) {
      if (error instanceof LukasSDKError) throw error;
      throw new LukasSDKError(
        LukasSDKErrorCode.TRANSACTION_FAILED,
        `Failed to transfer ${amount} tokens from ${from} to ${to}`,
        error
      );
    }
  }

  /**
   * Subscribe to Transfer events
   */
  onTransfer(callback: (event: TransferEvent) => void): () => void {
    const listenerId = `transfer_${this.listenerCounter++}`;
    this.transferListeners.set(listenerId, callback);

    // Set up the event listener on the contract
    const transferFilter = (this.contract as any).filters.Transfer?.();
    if (transferFilter) {
      const listener = (from: string, to: string, amount: BigNumberish, event: any) => {
        const transferEvent: TransferEvent = {
          from,
          to,
          amount: amount.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: Date.now(),
        };
        callback(transferEvent);
      };

      (this.contract as any).on(transferFilter, listener);

      // Return unsubscribe function
      return () => {
        this.transferListeners.delete(listenerId);
        (this.contract as any).off(transferFilter, listener);
      };
    }

    // Fallback: return unsubscribe function that just removes from map
    return () => {
      this.transferListeners.delete(listenerId);
    };
  }

  /**
   * Subscribe to Approval events
   */
  onApproval(callback: (event: ApprovalEvent) => void): () => void {
    const listenerId = `approval_${this.listenerCounter++}`;
    this.approvalListeners.set(listenerId, callback);

    // Set up the event listener on the contract
    const approvalFilter = (this.contract as any).filters.Approval?.();
    if (approvalFilter) {
      const listener = (owner: string, spender: string, amount: BigNumberish, event: any) => {
        const approvalEvent: ApprovalEvent = {
          owner,
          spender,
          amount: amount.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: Date.now(),
        };
        callback(approvalEvent);
      };

      (this.contract as any).on(approvalFilter, listener);

      // Return unsubscribe function
      return () => {
        this.approvalListeners.delete(listenerId);
        (this.contract as any).off(approvalFilter, listener);
      };
    }

    // Fallback: return unsubscribe function that just removes from map
    return () => {
      this.approvalListeners.delete(listenerId);
    };
  }
}
