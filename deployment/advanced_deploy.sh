#!/bin/bash

# Advanced XRP Token Deployment Script
# Cutting-edge, multi-environment deployment

set -euo pipefail

# Deployment Configuration
PROJECT_NAME="eon-xrp"
DEPLOY_ENV="${1:-staging}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Logging and Monitoring Setup
LOG_DIR="${ROOT_DIR}/logs/${DEPLOY_ENV}"
MONITORING_ENDPOINT="https://monitoring.eonxrp.com/deploy"

# Color Output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Comprehensive Logging Function
log() {
    local level="$1"
    local message="$2"
    echo -e "[${level}] $(date '+%Y-%m-%d %H:%M:%S') - ${message}"
    
    # Optional: Send log to centralized monitoring
    curl -X POST "${MONITORING_ENDPOINT}/logs" \
         -H "Content-Type: application/json" \
         -d "{\"project\":\"${PROJECT_NAME}\",\"env\":\"${DEPLOY_ENV}\",\"level\":\"${level}\",\"message\":\"${message}\"}" &> /dev/null
}

# Pre-Deployment Validation
validate_environment() {
    log "INFO" "Validating ${DEPLOY_ENV} deployment environment"
    
    # Check required tools
    command -v docker >/dev/null 2>&1 || { 
        log "ERROR" "Docker is not installed"; 
        exit 1; 
    }
    
    # Validate environment-specific configurations
    if [[ ! -f "${ROOT_DIR}/.env.${DEPLOY_ENV}" ]]; then
        log "ERROR" "Missing environment configuration file"
        exit 1
    fi
}

# Dependency Installation
install_dependencies() {
    log "INFO" "Installing project dependencies"
    
    # Frontend dependencies
    npm --prefix "${ROOT_DIR}/frontend" ci
    
    # Backend dependencies
    pip install -r "${ROOT_DIR}/backend/requirements.txt"
}

# Build Docker Containers
build_containers() {
    log "INFO" "Building Docker containers"
    
    docker-compose \
        -f "${ROOT_DIR}/docker-compose.yml" \
        -f "${ROOT_DIR}/docker-compose.${DEPLOY_ENV}.yml" \
        build
}

# Run Comprehensive Tests
run_tests() {
    log "INFO" "Running comprehensive test suite"
    
    # Frontend tests
    npm --prefix "${ROOT_DIR}/frontend" test
    
    # Backend tests
    pytest "${ROOT_DIR}/backend"
    
    # Blockchain integration tests
    npx hardhat test "${ROOT_DIR}/core/test"
}

# Deploy Containers
deploy_containers() {
    log "INFO" "Deploying containers to ${DEPLOY_ENV}"
    
    docker-compose \
        -f "${ROOT_DIR}/docker-compose.yml" \
        -f "${ROOT_DIR}/docker-compose.${DEPLOY_ENV}.yml" \
        up -d
}

# Health Check
health_check() {
    log "INFO" "Performing deployment health check"
    
    # Wait for services to start
    sleep 30
    
    # Comprehensive health checks
    docker-compose ps | grep -E "Exit|Restarting" && {
        log "ERROR" "Some containers failed to start"
        exit 1
    }
}

# Rollback Mechanism
rollback() {
    log "WARNING" "Initiating rollback for ${DEPLOY_ENV}"
    
    docker-compose \
        -f "${ROOT_DIR}/docker-compose.yml" \
        -f "${ROOT_DIR}/docker-compose.${DEPLOY_ENV}.yml" \
        down
    
    # Restore previous deployment snapshot
    git checkout HEAD~1
}

# Main Deployment Workflow
main() {
    validate_environment
    install_dependencies
    run_tests
    build_containers
    deploy_containers
    health_check
    
    log "SUCCESS" "Deployment to ${DEPLOY_ENV} completed successfully!"
}

# Error Handling
trap 'log "ERROR" "Deployment failed at line $LINENO"' ERR

# Execute Main Deployment
main

exit 0
