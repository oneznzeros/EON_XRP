# Multi-stage build for EonXRP Platform

# Base Stage
FROM node:18-alpine AS base
LABEL maintainer="EonXRP Engineering Team"
WORKDIR /app
RUN apk add --no-cache python3 make gcc g++

# Dependencies Stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build Stage
FROM base AS builder
COPY . .
RUN npm ci
RUN npm run build

# Production Stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy necessary files
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Environment Configuration
ENV NODE_ENV=production
ENV XRPL_NETWORK=mainnet
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Run command
CMD ["npm", "start"]
