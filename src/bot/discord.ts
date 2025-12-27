import { Client, Events, GatewayIntentBits } from 'discord.js'
import { handleMessageCreate } from '../services/botEvents'
import { ThumbBotLogger } from '../utils/logger'
import { updateGuildCount, incrementBotReady, updateActiveConnections } from '../utils/metrics'

const logger = new ThumbBotLogger('discord');

// discord client dev token
const discordToken = process.env.DISCORD_TOKEN

if (!discordToken) {
    logger.error('❌ DISCORD_TOKEN environment variable is required');
    process.exit(1);
}

// initialize client(bot) and listen to on ready event bot intents included
export const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.on(Events.ClientReady, readyClient => {
    const guildCount = readyClient.guilds.cache.size;
    
    logger.logBotReady(readyClient.user.tag, guildCount);
    logger.logSystemInfo({
        guilds: guildCount,
        users: readyClient.users.cache.size,
        channels: readyClient.channels.cache.size
    });
    
    // Update metrics
    incrementBotReady();
    updateGuildCount(guildCount);
    updateActiveConnections(1);
});

// event listener to when a message is created in the server
client.on(Events.MessageCreate, handleMessageCreate);

// Error handling
client.on(Events.Error, error => {
    logger.error('Discord client error:', { error: error.message });
});

client.on(Events.Warn, warning => {
    logger.warn('Discord client warning:', { warning });
});

// Guild events for metrics
client.on(Events.GuildCreate, guild => {
    logger.success(`✅ Joined new guild: ${guild.name} (${guild.memberCount} members)`);
    updateGuildCount(client.guilds.cache.size);
});

client.on(Events.GuildDelete, guild => {
    logger.info(`Left guild: ${guild.name}`);
    updateGuildCount(client.guilds.cache.size);
});

// login after event listeners are initialized
logger.info('🔐 Connecting to Discord...');
client.login(discordToken).catch(error => {
    logger.error('Failed to login to Discord:', { error: error.message });
    process.exit(1);
});

