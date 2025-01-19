import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectContributor {
  walletAddress: string;
  contributionAmount: number;
  skills: string[];
  role: 'founder' | 'developer' | 'designer' | 'marketer' | 'advisor';
}

export interface CollaborativeProject {
  id: string;
  name: string;
  description: string;
  type: 'meme_coin' | 'nft_collection' | 'dapp' | 'token' | 'other';
  contributors: ProjectContributor[];
  totalFunding: number;
  fundingGoal: number;
  status: 'draft' | 'funding' | 'in_progress' | 'launched' | 'completed';
  createdAt: number;
  launchDetails?: {
    tokenSymbol?: string;
    initialSupply?: number;
    contractAddress?: string;
  };
}

export class CollaborativeProjectPool {
  private projects: Map<string, CollaborativeProject> = new Map();

  createProject(
    name: string, 
    description: string, 
    type: CollaborativeProject['type'], 
    fundingGoal: number,
    initialContributor: ProjectContributor
  ): string {
    const newProject: CollaborativeProject = {
      id: uuidv4(),
      name,
      description,
      type,
      contributors: [initialContributor],
      totalFunding: initialContributor.contributionAmount,
      fundingGoal,
      status: 'draft',
      createdAt: Date.now()
    };

    this.projects.set(newProject.id, newProject);
    return newProject.id;
  }

  contributeToProject(
    projectId: string, 
    contributor: ProjectContributor
  ): boolean {
    const project = this.projects.get(projectId);
    if (!project || project.status !== 'funding') {
      return false;
    }

    // Check if contributor already exists
    const existingContributor = project.contributors.find(
      c => c.walletAddress === contributor.walletAddress
    );

    if (existingContributor) {
      existingContributor.contributionAmount += contributor.contributionAmount;
    } else {
      project.contributors.push(contributor);
    }

    project.totalFunding += contributor.contributionAmount;

    // Check if funding goal is reached
    if (project.totalFunding >= project.fundingGoal) {
      project.status = 'in_progress';
    }

    this.projects.set(projectId, project);
    return true;
  }

  launchProject(
    projectId: string, 
    launchDetails: NonNullable<CollaborativeProject['launchDetails']>
  ): boolean {
    const project = this.projects.get(projectId);
    if (!project || project.status !== 'in_progress') {
      return false;
    }

    project.status = 'launched';
    project.launchDetails = launchDetails;

    this.projects.set(projectId, project);
    return true;
  }

  getProjectsByType(type: CollaborativeProject['type']): CollaborativeProject[] {
    return Array.from(this.projects.values())
      .filter(project => project.type === type);
  }

  findProjectContributors(
    skills: string[], 
    projectType?: CollaborativeProject['type']
  ): ProjectContributor[] {
    const allContributors = Array.from(this.projects.values())
      .flatMap(project => 
        projectType 
          ? project.type === projectType ? project.contributors : [] 
          : project.contributors
      );

    return allContributors.filter(contributor => 
      contributor.skills.some(skill => skills.includes(skill))
    );
  }

  calculateCollectiveEarnings(walletAddress: string): number {
    let totalEarnings = 0;
    
    this.projects.forEach(project => {
      const contribution = project.contributors.find(
        c => c.walletAddress === walletAddress
      );
      
      if (contribution && project.status === 'launched') {
        // Implement logic to calculate earnings based on contribution
        // This is a placeholder and would need actual tokenomics logic
        totalEarnings += contribution.contributionAmount * 1.5;
      }
    });

    return totalEarnings;
  }
}

// Singleton instance for global access
export const collaborativeProjectPool = new CollaborativeProjectPool();
