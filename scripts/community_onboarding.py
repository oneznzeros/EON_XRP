import os
import uuid
from typing import Dict, List
from dataclasses import dataclass, asdict
import json

@dataclass
class CommunityMember:
    id: str
    wallet_address: str
    skills: List[str]
    interests: List[str]
    contribution_score: float = 0.0
    joined_at: str = None

class CommunityOnboardingEngine:
    def __init__(self, initial_leader_wallet: str):
        """
        Initialize the community onboarding system with the founding leader
        
        :param initial_leader_wallet: Wallet address of the project founder
        """
        self.members: Dict[str, CommunityMember] = {}
        self.leader_wallet = initial_leader_wallet
        
        # Create initial leader profile
        self.add_member(
            wallet_address=initial_leader_wallet,
            skills=['blockchain', 'community_building', 'strategic_planning'],
            interests=['crypto_innovation', 'dao_governance', 'collaborative_projects']
        )
    
    def add_member(
        self, 
        wallet_address: str, 
        skills: List[str], 
        interests: List[str]
    ) -> CommunityMember:
        """
        Add a new community member
        
        :param wallet_address: Unique wallet address of the member
        :param skills: List of skills the member possesses
        :param interests: List of crypto/blockchain interests
        :return: Created community member profile
        """
        if wallet_address in self.members:
            raise ValueError("Member already exists")
        
        member = CommunityMember(
            id=str(uuid.uuid4()),
            wallet_address=wallet_address,
            skills=skills,
            interests=interests,
            joined_at=str(datetime.now())
        )
        
        self.members[wallet_address] = member
        return member
    
    def match_potential_collaborators(
        self, 
        project_skills: List[str], 
        project_interests: List[str]
    ) -> List[CommunityMember]:
        """
        Find potential collaborators based on skills and interests
        
        :param project_skills: Required skills for the project
        :param project_interests: Project domain interests
        :return: List of matching community members
        """
        matching_members = [
            member for member in self.members.values()
            if any(skill in project_skills for skill in member.skills) or
               any(interest in project_interests for interest in member.interests)
        ]
        
        return sorted(
            matching_members, 
            key=lambda m: len(set(m.skills) & set(project_skills)), 
            reverse=True
        )
    
    def calculate_contribution_score(self, wallet_address: str) -> float:
        """
        Calculate a member's contribution score based on various factors
        
        :param wallet_address: Wallet address of the member
        :return: Contribution score
        """
        member = self.members.get(wallet_address)
        if not member:
            return 0.0
        
        # Placeholder scoring mechanism
        skill_diversity_score = len(member.skills) * 0.5
        interest_alignment_score = len(member.interests) * 0.3
        
        return skill_diversity_score + interest_alignment_score
    
    def export_community_data(self, output_path: str):
        """
        Export community data to a JSON file
        
        :param output_path: Path to save the community data
        """
        community_data = {
            'total_members': len(self.members),
            'leader_wallet': self.leader_wallet,
            'members': [asdict(member) for member in self.members.values()]
        }
        
        with open(output_path, 'w') as f:
            json.dump(community_data, f, indent=2)

def initialize_eon_xrp_community(leader_wallet: str):
    """
    Initialize the EON XRP community onboarding system
    
    :param leader_wallet: Wallet address of the project founder
    :return: Initialized community onboarding engine
    """
    community = CommunityOnboardingEngine(leader_wallet)
    
    # Export initial community state
    os.makedirs('community_data', exist_ok=True)
    community.export_community_data('community_data/initial_community.json')
    
    return community

# Example usage
if __name__ == "__main__":
    # Replace with your actual wallet address
    LEADER_WALLET = "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    
    community_engine = initialize_eon_xrp_community(LEADER_WALLET)
    
    # Simulate adding first community members
    community_engine.add_member(
        wallet_address="rMemberWallet1",
        skills=['frontend_development', 'ui_ux_design'],
        interests=['nft_creation', 'web3']
    )
    
    community_engine.add_member(
        wallet_address="rMemberWallet2",
        skills=['blockchain_development', 'smart_contracts'],
        interests=['defi', 'token_economics']
    )
    
    # Find potential collaborators for a meme coin project
    potential_collaborators = community_engine.match_potential_collaborators(
        project_skills=['blockchain_development', 'marketing'],
        project_interests=['meme_coins', 'crypto_community']
    )
    
    print("Potential Collaborators:", potential_collaborators)
