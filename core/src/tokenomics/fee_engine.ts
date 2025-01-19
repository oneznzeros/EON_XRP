import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

export interface FeeStructure {
  tokenCreationFee: number;
  tradingFeePercent: number;
  platformRevenueShare: number;
  communityRewardPool: number;
}

export interface TokenTransaction {
  id: string;
  tokenSymbol: string;
  amount: number;
  feesPaid: {
    platformFee: number;
    communityReward: number;
  };
  timestamp: number;
}

export class EONXRPFeeEngine {
  private defaultFeeStructure: FeeStructure = {
    tokenCreationFee: 5, // 5 XRP to create a token
    tradingFeePercent: 0.5, // 0.5% trading fee
    platformRevenueShare: 0.3, // 30% of fees go to platform
    communityRewardPool: 0.2 // 20% of fees go to community rewards
  };

  private transactionHistory: TokenTransaction[] = [];

  calculateTokenCreationFee(): number {
    return this.defaultFeeStructure.tokenCreationFee;
  }

  calculateTradingFees(transactionAmount: number): {
    platformFee: number;
    communityReward: number;
    totalFee: number;
  } {
    const tradingFeePercent = this.defaultFeeStructure.tradingFeePercent / 100;
    const totalFee = transactionAmount * tradingFeePercent;
    
    const platformFee = totalFee * this.defaultFeeStructure.platformRevenueShare;
    const communityReward = totalFee * this.defaultFeeStructure.communityRewardPool;

    return {
      platformFee,
      communityReward,
      totalFee
    };
  }

  recordTokenTransaction(
    tokenSymbol: string, 
    amount: number
  ): TokenTransaction {
    const feeBreakdown = this.calculateTradingFees(amount);

    const transaction: TokenTransaction = {
      id: uuidv4(),
      tokenSymbol,
      amount,
      feesPaid: {
        platformFee: feeBreakdown.platformFee,
        communityReward: feeBreakdown.communityReward
      },
      timestamp: Date.now()
    };

    this.transactionHistory.push(transaction);
    return transaction;
  }

  getTotalPlatformRevenue(): number {
    return this.transactionHistory.reduce(
      (total, tx) => total + tx.feesPaid.platformFee, 
      0
    );
  }

  getCommunityRewardPoolTotal(): number {
    return this.transactionHistory.reduce(
      (total, tx) => total + tx.feesPaid.communityReward, 
      0
    );
  }

  getTransactionHistory(
    limit: number = 50
  ): TokenTransaction[] {
    return this.transactionHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  adjustFeeStructure(newFeeStructure: Partial<FeeStructure>) {
    this.defaultFeeStructure = {
      ...this.defaultFeeStructure,
      ...newFeeStructure
    };
  }
}

// Singleton instance for global access
export const feeEngine = new EONXRPFeeEngine();
