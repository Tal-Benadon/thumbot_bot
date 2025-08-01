import { Message } from 'discord.js';
import providerList from '../../providers.json'
import { videoRequest } from './api'
import { ThumbBotLogger } from '../utils/logger'
import { trackMessage, trackLinkDetection } from '../utils/metrics'

const logger = new ThumbBotLogger('bot-events');
const providers = providerList.providers
const urlRegex = /(https?:\/\/[^\s]+)/i

async function handleMessageCreate(message: Message) {
    // Ignore bot messages
    if (message.author.bot) return;
    
    const content: string = message.content
    const channelId: string = message.channelId
    const guildName = message.guild?.name || 'DM'
    const channelName = message.channel && 'name' in message.channel ? (message.channel.name || 'unknown') : 'unknown'
    const authorName = message.author.username

    // Log message received
    logger.logMessageReceived(guildName, channelName, authorName);

    const matchUrl: string | null = isLink(content)
    const hasLink = matchUrl !== null;

    // Track message metrics
    trackMessage(guildName, channelName, hasLink);

    if (matchUrl) {
        logger.debug(`🔗 Found URL in message: ${matchUrl}`);
        
        const { supported, provider } = checkProviderSupport(matchUrl);
        
        // Track link detection metrics
        trackLinkDetection(provider, supported);
        
        if (supported) {
            logger.logLinkDetected(matchUrl, provider);
            
            try {
                await videoRequest(matchUrl, channelId);
            } catch (error) {
                logger.error(`Failed to process video request: ${error}`);
            }
        } else {
            logger.logProviderCheck(matchUrl, false);
        }
    }
}

function isLink(messageContent: string): string | null {
    const match = messageContent.match(urlRegex)
    return match ? match[0] : null
}

function checkProviderSupport(link: string): { supported: boolean, provider: string } {
    for (const provider of providers) {
        if (link.includes(provider)) {
            return { supported: true, provider };
        }
    }
    
    // Try to determine provider from URL
    const url = new URL(link);
    const domain = url.hostname.replace('www.', '');
    
    return { supported: false, provider: domain };
}

function containsProviderLink(link: string): boolean {
    return providers.some(provider => link.includes(provider))
}

export { handleMessageCreate }