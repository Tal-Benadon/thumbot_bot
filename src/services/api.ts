
// for locally run extractor. will change in deployment
const baseUrl = 'http://127.0.0.1:8000/videos'

// thin post request aimed to "fire and forget" the post request after passing provider checks
async function videoRequest(url: string, channelId: string) {

    try {
        const payload = { url, channelId }
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            console.log("Error accessing videoRequest post endpoint");
        }



    } catch (error) {
        console.log(`An error occured while processing the request: ${error}`);
    }

}

export { videoRequest }