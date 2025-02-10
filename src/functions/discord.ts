const discordBaseAPI = "https://discord.com/api/v10/"
const token = process.env.DISCORD_TOKEN
console.log(token)
interface GatewayResponse {
    url: string
}


export async function getGateway(): Promise<GatewayResponse> {
    try {
        const response = await fetch(`${discordBaseAPI}/gateway`)

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