import os
import uuid

def generate_secret():
    return str(uuid.uuid4()).replace('-', '')

def main():
    print("🔐 EonXRP Deployment Secrets Generator 🔐\n")
    
    secrets = {
        "RAILWAY_TOKEN": "Generate from Railway > Account Settings > Tokens",
        "RAILWAY_PROJECT_ID": "Find in Railway project URL",
        "VERCEL_TOKEN": "Generate from Vercel > Account > Tokens",
        "VERCEL_ORG_ID": "Find in Vercel account settings",
        "VERCEL_PROJECT_ID": "Find in Vercel project settings"
    }
    
    print("Instructions for each secret:\n")
    for secret, instructions in secrets.items():
        print(f"{secret}:")
        print(f"  {instructions}\n")
        input("  Press Enter after you've obtained this secret...")

    print("\n🎉 All secrets ready for GitHub repository!")

if __name__ == "__main__":
    main()
