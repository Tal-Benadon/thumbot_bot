import { Client, Events, GatewayIntentBits } from 'discord.js'
// discord client dev token
const discordToken = process.env.DISCORD_TOKEN

// initialize client(bot) and listen to on ready event bot intents inlcuded
export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);

})

// event listener to when a message is created in the server
client.on(Events.MessageCreate, (message) => {

    console.log(`${message.content}`);

})

// login after event listeners are initialized
client.login(discordToken)

