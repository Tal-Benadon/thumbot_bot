import { ThumbBotLogger } from '../utils/logger'
import { MetricsContext, trackApiError } from '../utils/metrics'

const logger = new ThumbBotLogger('api');

// Configure the downloader service URL - support Docker environments
const downloaderHost = process.env.DOWNLOADER_HOST || '127.0.0.1';
const downloaderPort = process.env.DOWNLOADER_PORT || '8001';
const baseUrl = `http://${downloaderHost}:${downloaderPort}/videos`;

logger.logConfigLoaded(3); // host, port, baseUrl

// Enhanced video request with proper error handling and metrics
async function videoRequest(url: string, channelId: string): Promise<void> {
    const metricsContext = new MetricsContext({ url, channelId });
    
    logger.logApiRequest('POST', baseUrl);
    logger.debug(`Requesting download for: ${url} -> Channel: ${channelId}`);

    try {
        const payload = { url, channelId };
        const startTime = Date.now();
        
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "User-Agent": "ThumbBot-Discord-Bot/2.0.0"
            },
            body: JSON.stringify(payload),
            // Note: timeout handled by AbortController if needed
        });

        const responseTime = (Date.now() - startTime) / 1000;
        
        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`❌ Downloader service error: ${response.status} ${response.statusText}`);
            logger.debug(`Error details: ${errorText}`);
            
            metricsContext.finish('error');
            trackApiError('/videos', `http_${response.status}`);
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        logger.success(`✅ Video request successful in ${responseTime.toFixed(2)}s`);
        logger.debug(`Response: ${JSON.stringify(result)}`);
        
        metricsContext.finish('success');

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`❌ Video request failed: ${errorMessage}`);
        
        metricsContext.finish('error');
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            trackApiError('/videos', 'network_error');
            logger.error('🔌 Network error - is the downloader service running?');
        } else if (error instanceof Error && error.message.includes('timeout')) {
            trackApiError('/videos', 'timeout');
            logger.error('⏱️ Request timeout - downloader service may be overloaded');
        } else {
            trackApiError('/videos', 'unknown');
        }
        
        throw error;
    }
}

// Health check function
async function checkDownloaderHealth(): Promise<boolean> {
    try {
        const healthUrl = `http://${downloaderHost}:${downloaderPort}/health`;
        const response = await fetch(healthUrl, { 
            method: 'GET',
            // Note: timeout handled by AbortController if needed 
        });
        
        return response.ok;
    } catch (error) {
        logger.error('Downloader health check failed:', error);
        return false;
    }
}

export { videoRequest, checkDownloaderHealth }