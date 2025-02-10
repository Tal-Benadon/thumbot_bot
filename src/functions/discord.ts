const discordBaseAPI = "https://discord.com/api/v10/"
const discordToken = process.env.DISCORD_TOKEN

interface GatewayResponse {
    url: string
    session_start_limit: object
    shards: number
}

// *** gets the websocket connection gateway URL *** //

export async function getGateway(): Promise<GatewayResponse> {
    try {
        const response = await fetch(`${discordBaseAPI}/gateway/bot`, {
            method: "GET",
            headers: {
                Authorization: `Bot ${discordToken}`
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch gateway: ${response.status} ${response.statusText}`);

        }
        const data: GatewayResponse = await response.json()
        return data
    } catch (error) {
        console.error("Error fetching Discord Gateway:", error)
        throw error
    }
}