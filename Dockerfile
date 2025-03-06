FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Expose port for the bot's HTTP server
EXPOSE 3000

# Start the bot
ENTRYPOINT ["node", "dist/index.js"] 