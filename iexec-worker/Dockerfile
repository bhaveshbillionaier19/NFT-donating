FROM node:18-alpine

# Install dependencies for building
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/

# iExec requires specific input/output paths
RUN mkdir -p /iexec_in /iexec_out

# Set environment to production
ENV NODE_ENV=production

# Run the application
CMD ["node", "src/app.js"]
