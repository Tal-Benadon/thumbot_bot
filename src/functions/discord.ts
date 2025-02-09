const discordBaseAPI = "https://discord.com/api/v10/"

export async function getGateway() {
    const response = await fetch(`${discordBaseAPI}/gateway`)
    const data = await response.json()
    return data
}