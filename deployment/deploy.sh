#!/bin/bash

# EON XRP Deployment Script

# Exit on any error
set -e

# Deployment Configuration
PROJECT_NAME="eon-xrp"
DEPLOY_ENV="${1:-staging}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Validate deployment environment
validate_environment() {
    if [[ "$DEPLOY_ENV" != "staging" && "$DEPLOY_ENV" != "production" ]]; then
        log "Invalid environment. Use 'staging' or 'production'."
        exit 1
    fi
}

# Prepare deployment environment
prepare_environment() {
    log "Preparing ${DEPLOY_ENV} environment"
    
    # Create necessary directories
    mkdir -p ./logs
    mkdir -p ./backups
    
    # Generate unique deployment identifier
    DEPLOY_ID="${PROJECT_NAME}_${DEPLOY_ENV}_${TIMESTAMP}"
    echo "$DEPLOY_ID" > ./logs/current_deployment.txt
}

# Install dependencies
install_dependencies() {
    log "Installing project dependencies"
    
    # Frontend dependencies
    cd frontend
    npm install
    npm run build
    
    # Backend dependencies
    cd ../backend
    pip install -r requirements.txt
    
    # Return to project root
    cd ..
}

# Run database migrations
run_migrations() {
    log "Running database migrations"
    # Add database migration commands here
    # Example: alembic upgrade head
}

# Start services
start_services() {
    log "Starting ${PROJECT_NAME} services"
    
    # Start backend
    uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
    
    # Start frontend
    cd frontend
    npm run start &
    
    cd ..
}

# Health check
health_check() {
    log "Running health checks"
    
    # Check backend
    if curl -f http://localhost:8000/health; then
        log "Backend is healthy"
    else
        log "Backend health check failed"
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000; then
        log "Frontend is healthy"
    else
        log "Frontend health check failed"
        exit 1
    fi
}

# Main deployment workflow
main() {
    validate_environment
    prepare_environment
    install_dependencies
    run_migrations
    start_services
    health_check
    
    log "Deployment of ${PROJECT_NAME} to ${DEPLOY_ENV} completed successfully"
}

# Execute main deployment function
main

# Optional: Cleanup old deployments
cleanup_old_deployments() {
    find ./logs -type f -mtime +30 -delete
    find ./backups -type f -mtime +60 -delete
}

trap cleanup_old_deployments EXIT
