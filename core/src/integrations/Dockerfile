# Market Data Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy service files
COPY market_data_service.ts ./
COPY tsconfig.json ./

# Compile TypeScript
RUN npm run build

# Expose port
EXPOSE 5001

# Run command
CMD ["npm", "start"]
