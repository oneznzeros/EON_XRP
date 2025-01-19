import { v4 as uuidv4 } from 'uuid';
import { CreatorRatingSystem } from '../marketplace/creator_ratings';
import { BrandMarketplaceManager } from '../marketplace/brand_marketplace';

// Creator Achievement and Progression System
export class CreatorLaunchpad {
  // Achievement Categories
  private static ACHIEVEMENTS = {
    FIRST_TOKEN: {
      title: '🚀 Token Pioneer',
      points: 50,
      description: 'Created your first token'
    },
    COMMUNITY_BUILDER: {
      title: '🤝 Community Champion',
      points: 100,
      description: 'Reached 100+ token holders'
    },
    TRANSPARENCY_MASTER: {
      title: '📊 Transparency Leader',
      points: 75,
      description: 'Maintained high transparency score'
    },
    SAFETY_INNOVATOR: {
      title: '🛡️ Safety Architect',
      points: 90,
      description: 'Implemented advanced safety measures'
    },
    VIRAL_TOKEN: {
      title: '🌐 Viral Visionary',
      points: 150,
      description: 'Token gained significant market traction'
    }
  };

  // Creator Profile with Progression Mechanics
  private creatorProfiles: Map<string, CreatorProfile> = new Map();

  // Track and award creator achievements
  trackAchievement(
    creatorAddress: string, 
    achievementKey: keyof typeof CreatorLaunchpad.ACHIEVEMENTS
  ): void {
    const achievement = CreatorLaunchpad.ACHIEVEMENTS[achievementKey];
    
    let creatorProfile = this.creatorProfiles.get(creatorAddress);
    if (!creatorProfile) {
      creatorProfile = {
        address: creatorAddress,
        totalPoints: 0,
        achievements: [],
        level: 1
      };
    }

    // Prevent duplicate achievements
    if (!creatorProfile.achievements.some(a => a.title === achievement.title)) {
      creatorProfile.achievements.push({
        ...achievement,
        earnedAt: new Date()
      });
      
      creatorProfile.totalPoints += achievement.points;
      creatorProfile.level = this.calculateLevel(creatorProfile.totalPoints);
    }

    this.creatorProfiles.set(creatorAddress, creatorProfile);
  }

  // Calculate creator level based on points
  private calculateLevel(points: number): number {
    return Math.floor(points / 100) + 1;
  }

  // Generate personalized creator dashboard
  generateCreatorDashboard(creatorAddress: string): CreatorDashboard {
    const profile = this.creatorProfiles.get(creatorAddress);
    const ratingProfile = CreatorRatingSystem.getCreatorRating(creatorAddress);
    const brandPage = BrandMarketplaceManager.getCreatorBrandPages(creatorAddress)[0];

    if (!profile) {
      return {
        status: 'NEW_CREATOR',
        nextSteps: [
          'Create your first token',
          'Set up brand marketplace page',
          'Engage with community'
        ]
      };
    }

    return {
      profile: {
        address: creatorAddress,
        level: profile.level,
        totalPoints: profile.totalPoints,
        achievements: profile.achievements
      },
      rating: ratingProfile,
      brandPage: brandPage,
      recommendations: this.generatePersonalizedRecommendations(profile)
    };
  }

  // Generate personalized growth recommendations
  private generatePersonalizedRecommendations(profile: CreatorProfile): string[] {
    const recommendations: string[] = [];

    if (profile.level <= 2) {
      recommendations.push('Complete your first token creation');
      recommendations.push('Set up a detailed brand page');
    }

    if (profile.achievements.length < 3) {
      recommendations.push('Earn your first achievement badges');
    }

    recommendations.push('Increase transparency in token details');
    recommendations.push('Engage with potential token holders');

    return recommendations;
  }

  // Leaderboard functionality
  getCreatorLeaderboard(limit: number = 10): CreatorLeaderboardEntry[] {
    return Array.from(this.creatorProfiles.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map(profile => ({
        address: profile.address,
        level: profile.level,
        totalPoints: profile.totalPoints,
        topAchievement: profile.achievements[profile.achievements.length - 1]
      }));
  }
}

// Type Definitions
interface CreatorProfile {
  address: string;
  totalPoints: number;
  achievements: CreatorAchievement[];
  level: number;
}

interface CreatorAchievement {
  title: string;
  points: number;
  description: string;
  earnedAt: Date;
}

interface CreatorDashboard {
  status?: 'NEW_CREATOR';
  nextSteps?: string[];
  profile?: {
    address: string;
    level: number;
    totalPoints: number;
    achievements: CreatorAchievement[];
  };
  rating?: any;
  brandPage?: any;
  recommendations?: string[];
}

interface CreatorLeaderboardEntry {
  address: string;
  level: number;
  totalPoints: number;
  topAchievement?: CreatorAchievement;
}

// Singleton instance for global access
export const creatorLaunchpad = new CreatorLaunchpad();
