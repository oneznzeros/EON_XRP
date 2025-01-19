import { TokenSafetyConfig } from '../tokens/token_factory';

// Creator Reputation Score Calculation
export class CreatorReputationSystem {
  // Reputation scoring criteria
  private static REPUTATION_WEIGHTS = {
    liquidityLock: 0.3,     // Percentage of tokens locked
    safetyCompliance: 0.25, // Adherence to safety protocols
    communityTrust: 0.2,    // Community feedback and ratings
    transparencyScore: 0.15,// Disclosure and communication
    historicalPerformance: 0.1 // Past token performance
  };

  // Reputation tiers
  static REPUTATION_TIERS = {
    'BRONZE': { min: 0, max: 25 },
    'SILVER': { min: 26, max: 50 },
    'GOLD': { min: 51, max: 75 },
    'PLATINUM': { min: 76, max: 100 }
  };

  // Calculate creator's reputation score
  static calculateReputationScore(
    tokenMetrics: {
      liquidityLocked: number;
      totalSupply: number;
      safetyConfig: TokenSafetyConfig;
      communityRatings: number[];
      transparencyLevel: number;
    }
  ): number {
    const {
      liquidityLocked,
      totalSupply,
      safetyConfig,
      communityRatings,
      transparencyLevel
    } = tokenMetrics;

    // Liquidity Lock Score (0-30 points)
    const liquidityScore = Math.min(
      (liquidityLocked / totalSupply) * 30, 
      30
    );

    // Safety Compliance Score (0-25 points)
    const safetyScore = this.calculateSafetyComplianceScore(safetyConfig);

    // Community Trust Score (0-20 points)
    const communityScore = this.calculateCommunityScore(communityRatings);

    // Transparency Score (0-15 points)
    const transparencyScore = transparencyLevel * 15;

    // Calculate total reputation score
    const totalScore = 
      liquidityScore + 
      safetyScore + 
      communityScore + 
      transparencyScore;

    return Math.min(Math.max(totalScore, 0), 100);
  }

  // Determine reputation tier
  static getReputationTier(score: number): string {
    for (const [tier, { min, max }] of Object.entries(this.REPUTATION_TIERS)) {
      if (score >= min && score <= max) {
        return tier;
      }
    }
    return 'UNRANKED';
  }

  // Calculate safety compliance subscore
  private static calculateSafetyComplianceScore(
    safetyConfig: TokenSafetyConfig
  ): number {
    let score = 0;

    // Reward lower wallet percentage
    switch(safetyConfig.riskTier) {
      case 'safe':
        score += 20;  // Maximum points
        break;
      case 'moderate':
        score += 15;
        break;
      case 'high':
        score += 5;
        break;
    }

    // Additional points for longer lockup periods
    if (safetyConfig.lockupPeriod >= 180) score += 5;
    else if (safetyConfig.lockupPeriod >= 90) score += 3;

    return score;
  }

  // Calculate community trust subscore
  private static calculateCommunityScore(ratings: number[]): number {
    if (ratings.length === 0) return 0;

    const averageRating = 
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
    return Math.min(averageRating * 4, 20);  // Scale to 0-20
  }

  // Generate verifiable reputation badge
  static generateReputationBadge(
    creatorAddress: string, 
    reputationScore: number
  ): string {
    const tier = this.getReputationTier(reputationScore);
    const badgeHash = this.createBadgeHash(creatorAddress, reputationScore);

    return `${tier}_${badgeHash}`;
  }

  // Create a cryptographic hash for the badge
  private static createBadgeHash(
    creatorAddress: string, 
    reputationScore: number
  ): string {
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(`${creatorAddress}:${reputationScore}:${Date.now()}`)
      .digest('hex')
      .slice(0, 12);
  }
}

// Reputation Tracking Service
export class ReputationTracker {
  private creatorReputations: Map<string, number> = new Map();

  // Track and update creator reputation
  updateCreatorReputation(
    creatorAddress: string, 
    tokenMetrics: Parameters<typeof CreatorReputationSystem.calculateReputationScore>[0]
  ): void {
    const reputationScore = CreatorReputationSystem.calculateReputationScore(tokenMetrics);
    this.creatorReputations.set(creatorAddress, reputationScore);
  }

  // Get creator's current reputation
  getCreatorReputation(creatorAddress: string): number {
    return this.creatorReputations.get(creatorAddress) || 0;
  }

  // Generate reputation badge for a creator
  generateCreatorBadge(creatorAddress: string): string | null {
    const reputation = this.getCreatorReputation(creatorAddress);
    return reputation > 0 
      ? CreatorReputationSystem.generateReputationBadge(creatorAddress, reputation)
      : null;
  }
}

// Export for use in token factory and other services
export const reputationTracker = new ReputationTracker();
