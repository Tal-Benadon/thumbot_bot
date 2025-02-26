import { Message } from 'discord.js';
import providerList from '../../providers.json'
import { videoRequest } from './api'
const providers = providerList.providers
const urlRegex = /(https?:\/\/[^\s]+)/i


async function handleMessageCreate(message: Message) {
    const content: string = message.content
    const channelId: string = message.channelId

    const matchUrl: string | null = isLink(content)

    if (matchUrl) {
        const inProviders: boolean = containsProviderLink(matchUrl)

        if (inProviders) {
            await videoRequest(matchUrl, channelId)
        }
    }
}



function isLink(messageContent: string): string | null {

    const match = messageContent.match(urlRegex)

    return match ? match[0] : null
}

function containsProviderLink(link: string): boolean {
    return providers.some(provider => link.includes(provider))
}

export { handleMessageCreate }