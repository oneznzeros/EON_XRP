import { v4 as uuidv4 } from 'uuid';
import { CreatorReputationSystem } from '../reputation/creator_reputation';

// Brand Marketplace Subscription Tiers
export enum SubscriptionTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

// Brand Page Configuration
interface BrandPageConfig {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
}

// Subscription Features
const SUBSCRIPTION_FEATURES = {
  [SubscriptionTier.BASIC]: {
    monthlyFee: 50,  // XRP
    features: [
      'Basic Brand Page',
      'List Up to 3 Tokens',
      'Basic Analytics',
      'Community Forum Access'
    ]
  },
  [SubscriptionTier.PREMIUM]: {
    monthlyFee: 250,  // XRP
    features: [
      'Advanced Brand Page',
      'List Up to 10 Tokens',
      'Detailed Analytics',
      'Priority Support',
      'Marketing Boost',
      'Community Verification Badge'
    ]
  },
  [SubscriptionTier.ENTERPRISE]: {
    monthlyFee: 1000,  // XRP
    features: [
      'Fully Customized Brand Page',
      'Unlimited Token Listings',
      'Advanced Analytics Dashboard',
      'Dedicated Support Manager',
      'Global Marketing Campaign',
      'Enterprise Verification Badge',
      'API Access',
      'Compliance Consulting'
    ]
  }
};

export class BrandMarketplaceManager {
  private brandPages: Map<string, BrandPageConfig> = new Map();
  private brandSubscriptions: Map<string, {
    tier: SubscriptionTier;
    expiresAt: Date;
  }> = new Map();

  // Create a new brand marketplace page
  createBrandPage(
    creatorAddress: string, 
    config: Omit<BrandPageConfig, 'id'>,
    subscriptionTier: SubscriptionTier
  ): BrandPageConfig {
    // Validate creator's reputation
    const creatorReputation = CreatorReputationSystem.calculateReputationScore({
      liquidityLocked: 0,  // Placeholder
      totalSupply: 0,      // Placeholder
      safetyConfig: {
        maxWalletPercentage: 5,
        lockupPeriod: 180,
        riskTier: 'safe',
        vestingSchedule: []
      },
      communityRatings: [],
      transparencyLevel: 0.8
    });

    // Reputation gate for higher tiers
    if (
      (subscriptionTier === SubscriptionTier.PREMIUM && creatorReputation < 50) ||
      (subscriptionTier === SubscriptionTier.ENTERPRISE && creatorReputation < 75)
    ) {
      throw new Error('Insufficient creator reputation for selected tier');
    }

    const brandPage: BrandPageConfig = {
      id: uuidv4(),
      ...config
    };

    this.brandPages.set(brandPage.id, brandPage);
    this.subscribeToBrandMarketplace(creatorAddress, brandPage.id, subscriptionTier);

    return brandPage;
  }

  // Subscribe to brand marketplace
  subscribeToBrandMarketplace(
    creatorAddress: string, 
    brandPageId: string,
    tier: SubscriptionTier
  ): void {
    const subscriptionFee = SUBSCRIPTION_FEATURES[tier].monthlyFee;
    
    // In a real implementation, process XRP payment
    // This would interact with XRPL payment system

    this.brandSubscriptions.set(creatorAddress, {
      tier,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30 days
    });
  }

  // Get brand page details
  getBrandPage(brandPageId: string): BrandPageConfig | undefined {
    return this.brandPages.get(brandPageId);
  }

  // List all brand pages for a creator
  getCreatorBrandPages(creatorAddress: string): BrandPageConfig[] {
    return Array.from(this.brandPages.values())
      .filter(page => page.id.startsWith(creatorAddress));
  }

  // Check subscription status
  isSubscriptionActive(creatorAddress: string): boolean {
    const subscription = this.brandSubscriptions.get(creatorAddress);
    return subscription ? subscription.expiresAt > new Date() : false;
  }

  // Get subscription tier
  getSubscriptionTier(creatorAddress: string): SubscriptionTier | null {
    const subscription = this.brandSubscriptions.get(creatorAddress);
    return subscription ? subscription.tier : null;
  }

  // Get subscription features
  getSubscriptionFeatures(tier: SubscriptionTier) {
    return SUBSCRIPTION_FEATURES[tier];
  }
}

// Singleton instance for global access
export const brandMarketplaceManager = new BrandMarketplaceManager();
