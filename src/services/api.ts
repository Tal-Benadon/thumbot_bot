
const baseUrl = 'http://127.0.0.1:8000/videos'

async function videoRequest(url: string, channelId: string) {

    try {
        const payload = { url, channelId }
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            console.log("error");
        }

        console.log(await response.json());

    } catch (error) {
        console.log(error);

    }

}

export { videoRequest }