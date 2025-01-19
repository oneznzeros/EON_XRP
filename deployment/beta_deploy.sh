#!/bin/bash

# EonXRP Beta Deployment Script
# Version: 1.0.0-beta

set -e

# Deployment Configuration
BETA_VERSION="1.0.0-beta"
DEPLOYMENT_ENV="beta"
XRPL_NETWORK="testnet"

# Color codes for logging
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check Node.js version
    if ! node --version | grep -q "v18"; then
        log_error "Node.js 18.x is required"
        exit 1
    fi

    # Check XRPL testnet connectivity
    if ! nc -z -w5 s.altnet.rippletest.net 51233; then
        log_error "XRPL Testnet is not reachable"
        exit 1
    }
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
}

# Build backend
build_backend() {
    log_info "Building backend..."
    cd core
    npm install
    npm run build
    cd ..
}

# Deploy to Firebase
deploy_to_firebase() {
    log_info "Deploying to Firebase..."
    firebase use $DEPLOYMENT_ENV
    firebase deploy --only hosting,functions
}

# Configure environment
configure_environment() {
    log_info "Configuring beta environment..."
    
    # Set environment variables
    export REACT_APP_XRPL_NETWORK=$XRPL_NETWORK
    export REACT_APP_BETA_VERSION=$BETA_VERSION
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    npx prisma migrate deploy
}

# Main deployment function
main() {
    log_info "Starting EonXRP Beta Deployment v${BETA_VERSION}"
    
    pre_deployment_checks
    configure_environment
    build_frontend
    build_backend
    run_migrations
    deploy_to_firebase

    log_info "Beta deployment completed successfully! 🚀"
}

# Error handling
trap 'log_error "Deployment failed at line $LINENO"' ERR

# Execute main deployment
main
