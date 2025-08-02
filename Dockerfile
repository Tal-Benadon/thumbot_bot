FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Set environment variables
ENV PORT=3000
ENV METRICS_PORT=3001
ENV NODE_ENV=production

# Expose ports for the bot's HTTP server and metrics
EXPOSE 3000 3001

# Start the bot
ENTRYPOINT ["node", "dist/index.js"] 