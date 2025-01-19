import os
import sys
import uuid
import subprocess

def get_user_input(prompt):
    return input(prompt)

def run_command(command):
    try:
        result = subprocess.run(command, capture_output=True, text=True, shell=True)
        return result.stdout.strip()
    except Exception as e:
        print(f"Error running command: {e}")
        return None

def main():
    print(" EonXRP Deployment Secrets Generator \n")
    
    secrets = {
        "RAILWAY_TOKEN": "Go to Railway > Account > Tokens and generate a new token",
        "RAILWAY_PROJECT_ID": "Open your Railway project and copy the project ID from the URL",
        "VERCEL_TOKEN": "Go to Vercel > Account > Tokens and generate a new token",
        "VERCEL_ORG_ID": "Find in Vercel account settings under Organization",
        "VERCEL_PROJECT_ID": "Open your Vercel project and find the Project ID"
    }
    
    generated_secrets = {}
    
    print("Instructions for each secret:\n")
    for secret, instructions in secrets.items():
        print(f"{secret}:")
        print(f"  {instructions}\n")
        
        if secret.endswith("TOKEN"):
            generated_secrets[secret] = str(uuid.uuid4()).replace('-', '')
        
        user_input = get_user_input(f"  Enter {secret} (or press Enter to use generated value): ").strip()
        
        if user_input:
            generated_secrets[secret] = user_input
    
    # Save secrets to .env file
    with open('.env', 'w') as f:
        for key, value in generated_secrets.items():
            f.write(f"{key}={value}\n")
    
    print("\n Secrets saved to .env file!")
    print("\nNext steps:")
    print("1. Review .env file")
    print("2. Add these secrets to GitHub repository settings")
    print("3. Configure Railway and Vercel projects")

if __name__ == "__main__":
    main()
