import { Contract, TransactionResponse } from 'ethers';
import type { TokenInfo, BigNumber } from '../types';
import type { TokenService } from './TokenService';
import { LukasSDKError, LukasSDKErrorCode } from '../errors/LukasSDKError';

/**
 * Implementation of TokenService for LUKAS token operations
 */
export class TokenServiceImpl implements TokenService {
  private contract: Contract;
  private contractAddress: string;

  constructor(contract: Contract, contractAddress: string) {
    this.contract = contract;
    this.contractAddress = contractAddress;
  }

  /**
   * Get token information (name, symbol, decimals)
   */
  async getTokenInfo(): Promise<TokenInfo> {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply(),
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        address: this.contractAddress,
        totalSupply: totalSupply.toString(),
      };
    } catch (error) {
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
      const balance = await this.contract.balanceOf(address);
      return balance.toString();
    } catch (error) {
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
      const allowance = await this.contract.allowance(owner, spender);
      return allowance.toString();
    } catch (error) {
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
      const totalSupply = await this.contract.totalSupply();
      return totalSupply.toString();
    } catch (error) {
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
      const tx = await this.contract.transfer(to, amount);
      return tx;
    } catch (error) {
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
      const tx = await this.contract.approve(spender, amount);
      return tx;
    } catch (error) {
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
      const tx = await this.contract.transferFrom(from, to, amount);
      return tx;
    } catch (error) {
      throw new LukasSDKError(
        LukasSDKErrorCode.TRANSACTION_FAILED,
        `Failed to transfer ${amount} tokens from ${from} to ${to}`,
        error
      );
    }
  }
}
