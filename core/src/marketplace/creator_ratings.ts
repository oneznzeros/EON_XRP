import { v4 as uuidv4 } from 'uuid';

// Comprehensive Creator Rating System
export class CreatorRatingSystem {
  // Rating categories mirroring e-commerce platforms
  private ratings: Map<string, CreatorRatings> = new Map();

  // Rate a creator across multiple dimensions
  rateCreator(
    creatorAddress: string, 
    rating: {
      tokenPerformance: number;  // 1-5 stars
      transparencyScore: number; // 1-5 stars
      communityTrust: number;    // 1-5 stars
      safetyCompliance: number;  // 1-5 stars
    }
  ): void {
    const overallRating = this.calculateOverallRating(rating);
    
    const existingRatings = this.ratings.get(creatorAddress) || {
      ratings: [],
      warnings: 0,
      suspensions: 0
    };

    existingRatings.ratings.push({
      id: uuidv4(),
      timestamp: new Date(),
      ...rating,
      overallRating
    });

    this.ratings.set(creatorAddress, existingRatings);
  }

  // Calculate creator's overall rating
  private calculateOverallRating(rating: {
    tokenPerformance: number;
    transparencyScore: number;
    communityTrust: number;
    safetyCompliance: number;
  }): number {
    const { 
      tokenPerformance, 
      transparencyScore, 
      communityTrust, 
      safetyCompliance 
    } = rating;

    // Weighted average calculation
    return (
      (tokenPerformance * 0.3) +
      (transparencyScore * 0.25) +
      (communityTrust * 0.25) +
      (safetyCompliance * 0.2)
    );
  }

  // Get creator's current rating profile
  getCreatorRating(creatorAddress: string): CreatorRatingProfile | null {
    const creatorRatings = this.ratings.get(creatorAddress);
    if (!creatorRatings) return null;

    // Calculate average ratings
    const averageRatings = this.calculateAverageRatings(creatorRatings.ratings);

    return {
      creatorAddress,
      ...averageRatings,
      warnings: creatorRatings.warnings,
      suspensions: creatorRatings.suspensions,
      ratingStatus: this.determineRatingStatus(averageRatings.overallRating)
    };
  }

  // Calculate average ratings
  private calculateAverageRatings(ratings: CreatorRating[]): {
    tokenPerformance: number;
    transparencyScore: number;
    communityTrust: number;
    safetyCompliance: number;
    overallRating: number;
  } {
    if (ratings.length === 0) {
      return {
        tokenPerformance: 0,
        transparencyScore: 0,
        communityTrust: 0,
        safetyCompliance: 0,
        overallRating: 0
      };
    }

    const sum = ratings.reduce((acc, rating) => ({
      tokenPerformance: acc.tokenPerformance + rating.tokenPerformance,
      transparencyScore: acc.transparencyScore + rating.transparencyScore,
      communityTrust: acc.communityTrust + rating.communityTrust,
      safetyCompliance: acc.safetyCompliance + rating.safetyCompliance,
      overallRating: acc.overallRating + rating.overallRating
    }), {
      tokenPerformance: 0,
      transparencyScore: 0,
      communityTrust: 0,
      safetyCompliance: 0,
      overallRating: 0
    });

    return {
      tokenPerformance: sum.tokenPerformance / ratings.length,
      transparencyScore: sum.transparencyScore / ratings.length,
      communityTrust: sum.communityTrust / ratings.length,
      safetyCompliance: sum.safetyCompliance / ratings.length,
      overallRating: sum.overallRating / ratings.length
    };
  }

  // Determine rating status (like eBay's seller status)
  private determineRatingStatus(overallRating: number): RatingStatus {
    if (overallRating >= 4.5) return 'top_rated';
    if (overallRating >= 4.0) return 'highly_trusted';
    if (overallRating >= 3.5) return 'trusted';
    if (overallRating >= 3.0) return 'standard';
    if (overallRating >= 2.5) return 'caution';
    return 'high_risk';
  }

  // Add a warning to a creator's profile
  addWarning(creatorAddress: string, reason: string): void {
    const creatorRatings = this.ratings.get(creatorAddress);
    if (creatorRatings) {
      creatorRatings.warnings++;
      
      // Automatic suspension after multiple warnings
      if (creatorRatings.warnings >= 3) {
        this.suspendCreator(creatorAddress);
      }
    }
  }

  // Suspend a creator's account
  private suspendCreator(creatorAddress: string): void {
    const creatorRatings = this.ratings.get(creatorAddress);
    if (creatorRatings) {
      creatorRatings.suspensions++;
    }
  }
}

// Type definitions for rating system
interface CreatorRating {
  id: string;
  timestamp: Date;
  tokenPerformance: number;
  transparencyScore: number;
  communityTrust: number;
  safetyCompliance: number;
  overallRating: number;
}

interface CreatorRatings {
  ratings: CreatorRating[];
  warnings: number;
  suspensions: number;
}

interface CreatorRatingProfile {
  creatorAddress: string;
  tokenPerformance: number;
  transparencyScore: number;
  communityTrust: number;
  safetyCompliance: number;
  overallRating: number;
  warnings: number;
  suspensions: number;
  ratingStatus: RatingStatus;
}

type RatingStatus = 
  | 'top_rated' 
  | 'highly_trusted' 
  | 'trusted' 
  | 'standard' 
  | 'caution' 
  | 'high_risk';

// Singleton instance for global access
export const creatorRatingSystem = new CreatorRatingSystem();
