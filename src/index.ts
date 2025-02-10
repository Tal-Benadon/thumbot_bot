// import WebSocket from "ws";
import app from './server/server'
import { getGateway } from './functions/discord'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})

async function main() {

    const gateway = await getGateway();
    console.log(gateway)
}

main()

