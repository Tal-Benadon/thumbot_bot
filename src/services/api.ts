// Configure the downloader service URL - support Docker environments
const downloaderHost = process.env.DOWNLOADER_HOST || '127.0.0.1';
const downloaderPort = process.env.DOWNLOADER_PORT || '8000';
const baseUrl = `http://${downloaderHost}:${downloaderPort}/videos`;

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