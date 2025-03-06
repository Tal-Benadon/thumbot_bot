# ThumbBot - Discord Bot Service

This is the Discord bot component of the ThumbBot microservices architecture. ThumbBot automatically downloads and shares videos from various social media platforms when links are posted in Discord channels.

## About This Repository

This repository contains the Discord bot service written in TypeScript/Node.js. It's responsible for:

- Monitoring Discord channels for links to supported video platforms
- Detecting links from supported providers (Reddit, Instagram, Facebook, etc.)
- Forwarding video download requests to the ThumbBot Downloader Service
- Handling Discord interactions and communication

## Microservices Architecture

ThumbBot is available in two versions:

1. **Monolithic Version**: A single application combining bot and downloader functionality
   - [ThumbBot Monolithic Repository](https://github.com/Tal-Benadon/Thumbot)

2. **Microservices Version** (this repository): Two separate services that work together
   - **Bot Service** (this repository): Written in Node.js, handles Discord interactions
   - **Downloader Service**: Written in Python, handles video downloading and processing
     - [ThumbBot Downloader Service Repository](https://github.com/Tal-Benadon/thumbot_downloader)

The microservices architecture provides several advantages:
- Independent scaling of each component
- Ability to update components separately
- Improved resilience and fault isolation

## Features

- Monitors Discord channels for links to supported video platforms
- Automatically detects links from providers defined in providers.json
- Communicates with the downloader service via REST API
- Handles Discord message events and responses

## Getting Started

### Prerequisites

- Node.js 16 or higher
- Discord Bot Token
- Discord server with appropriate permissions
- ThumbBot Downloader Service running (see the [downloader repository](https://github.com/Tal-Benadon/thumbot_downloader))

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Tal-Benadon/thumbot_bot.git
   cd thumbot_bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Discord bot token:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   ```

4. Configure the downloader service URL (if needed) in `src/services/api.ts`

### Alternative Token Configuration

Instead of using a `.env` file, you can directly set the bot token:

1. Direct environment variable (for development):
   ```
   export DISCORD_TOKEN=your_discord_bot_token_here
   npm run start
   ```

2. In docker-compose.yml:
   ```yaml
   services:
     bot:
       build: ./thumbot_bot
       environment:
         - DISCORD_TOKEN=your_actual_token_here  # Directly paste your token here

     downloader:
       build: ./thumbot_downloader
       environment:
         - DISCORD_TOKEN=your_actual_token_here  # Directly paste your token here
   ```

3. In Docker run command:
   ```
   docker run -d --name thumbot-bot \
     -e DISCORD_TOKEN=your_actual_token_here \
     thumbot-bot
   ```

### Running the Bot

1. Build and start the bot:
   ```
   npm run start
   ```

   Or for development with automatic reloading:
   ```
   npm run watch
   ```

2. Make sure the ThumbBot Downloader Service is running as well

### Docker Support

You can also run the bot using Docker:

1. Build the Docker image:
   ```
   docker build -t thumbot-bot .
   ```

2. Run the container with your Discord token:
   ```
   docker run -d --name thumbot-bot \
     -e DISCORD_TOKEN=your_discord_bot_token_here \
     thumbot-bot
   ```

#### Docker Compose (with Downloader Service)

For a complete setup with both services, create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  bot:
    build: ./thumbot_bot
    environment:
      - DISCORD_TOKEN=${DISCORD_TOKEN}
    depends_on:
      - downloader
    restart: unless-stopped

  downloader:
    build: ./thumbot_downloader
    environment:
      - DISCORD_TOKEN=${DISCORD_TOKEN}
    ports:
      - "8000:8000"
    restart: unless-stopped
    volumes:
      - video_temp:/app/temp_videos

volumes:
  video_temp:
```

Then run both services with:
```
docker-compose up -d
```

Important: For Docker Compose to work properly, you need to:
1. Clone both repositories (thumbot_bot and thumbot_downloader) into the same parent directory
2. Place the docker-compose.yml file in that parent directory

For example:
```
parent-directory/
├── docker-compose.yml
├── thumbot_bot/
└── thumbot_downloader/
```

## Configuration

You can customize which video providers are supported by editing the `providers.json` file.

## Troubleshooting

- Ensure your bot has the "Message Content Intent" enabled in the Discord Developer Portal
- Check that the downloader service is running and accessible
- Verify network connectivity between the bot and downloader services
- For Docker setups, ensure container networking is properly configured

## Service Communication

The bot and downloader services communicate through a REST API:

1. The bot service makes HTTP requests to the downloader service at `http://downloader:8000/videos` when running in Docker (or the configured URL in non-Docker environments).

2. Both services require access to the same Discord bot token:
   - The bot service uses it to connect to Discord and monitor messages
   - The downloader service uses it to upload processed videos directly to Discord

3. If you experience communication issues:
   - Check that the services can resolve each other's hostnames/IPs
   - Verify that the DISCORD_TOKEN is correctly passed to both services
   - Ensure the API URL in `src/services/api.ts` is correctly configured

## License

See the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 