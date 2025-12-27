/**
 * Prometheus metrics for ThumbBot Discord Bot
 */
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import express from 'express';
import { ThumbBotLogger } from './logger';

const logger = new ThumbBotLogger('metrics');

// Enable default metrics collection
collectDefaultMetrics({ register });

// Custom metrics
export const discordMessagesTotal = new Counter({
    name: 'thumbbot_discord_messages_total',
    help: 'Total number of Discord messages processed',
    labelNames: ['guild', 'channel', 'has_link']
});

export const linkDetectionsTotal = new Counter({
    name: 'thumbbot_link_detections_total',
    help: 'Total number of links detected',
    labelNames: ['provider', 'supported']
});

export const downloaderRequestsTotal = new Counter({
    name: 'thumbbot_downloader_requests_total',
    help: 'Total number of requests sent to downloader service',
    labelNames: ['status']
});

export const downloaderResponseTime = new Histogram({
    name: 'thumbbot_downloader_response_time_seconds',
    help: 'Response time from downloader service',
    buckets: [0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 25.0]
});

export const activeConnections = new Gauge({
    name: 'thumbbot_active_discord_connections',
    help: 'Number of active Discord connections'
});

export const guildsTotal = new Gauge({
    name: 'thumbbot_guilds_total',
    help: 'Total number of Discord guilds the bot is in'
});

export const uptimeSeconds = new Gauge({
    name: 'thumbbot_uptime_seconds',
    help: 'Bot uptime in seconds'
});

// Bot-specific metrics
export const botReadyEvents = new Counter({
    name: 'thumbbot_bot_ready_events_total',
    help: 'Total number of bot ready events'
});

export const apiErrors = new Counter({
    name: 'thumbbot_api_errors_total',
    help: 'Total number of API errors',
    labelNames: ['endpoint', 'error_type']
});

// Metrics tracking functions
export function trackMessage(guild: string, channel: string, hasLink: boolean) {
    discordMessagesTotal.labels(guild, channel, hasLink.toString()).inc();
}

export function trackLinkDetection(provider: string, supported: boolean) {
    linkDetectionsTotal.labels(provider, supported.toString()).inc();
}

export function trackDownloaderRequest(status: string, responseTime?: number) {
    downloaderRequestsTotal.labels(status).inc();
    if (responseTime !== undefined) {
        downloaderResponseTime.observe(responseTime);
    }
}

export function trackApiError(endpoint: string, errorType: string) {
    apiErrors.labels(endpoint, errorType).inc();
}

export function updateGuildCount(count: number) {
    guildsTotal.set(count);
}

export function updateActiveConnections(count: number) {
    activeConnections.set(count);
}

export function incrementBotReady() {
    botReadyEvents.inc();
}

// Metrics context class for request tracking
export class MetricsContext {
    private startTime: number;
    private labels: Record<string, string>;
    
    constructor(labels: Record<string, string> = {}) {
        this.startTime = Date.now();
        this.labels = labels;
    }
    
    finish(status: string) {
        const duration = (Date.now() - this.startTime) / 1000;
        trackDownloaderRequest(status, duration);
    }
}

// Metrics middleware for Express
export function metricsMiddleware() {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const startTime = Date.now();
        
        res.on('finish', () => {
            const duration = (Date.now() - startTime) / 1000;
            const status = res.statusCode >= 400 ? 'error' : 'success';
            
            // Track API call metrics here if needed
            logger.debug(`Request ${req.method} ${req.path} completed in ${duration}s with status ${res.statusCode}`);
        });
        
        next();
    };
}

// Metrics server
let metricsServer: any = null;

export function startMetricsServer(port: number = 3001): Promise<void> {
    return new Promise((resolve, reject) => {
        if (metricsServer) {
            logger.warn('Metrics server already started');
            resolve();
            return;
        }
        
        const app = express();
        
        // Metrics endpoint
        app.get('/metrics', async (req, res) => {
            try {
                const metrics = await register.metrics();
                res.set('Content-Type', register.contentType);
                res.send(metrics);
            } catch (error) {
                logger.error('Error generating metrics', { error });
                res.status(500).send('Error generating metrics');
            }
        });
        
        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'thumbbot-discord-bot',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
        
        metricsServer = app.listen(port, () => {
            logger.success(`📊 Prometheus metrics server started on port ${port}`);
            
            // Start uptime tracking
            const startTime = Date.now();
            setInterval(() => {
                uptimeSeconds.set((Date.now() - startTime) / 1000);
            }, 5000);
            
            resolve();
        });
        
        metricsServer.on('error', (error: Error) => {
            logger.error('Failed to start metrics server', { error });
            reject(error);
        });
    });
}

export function stopMetricsServer(): Promise<void> {
    return new Promise((resolve) => {
        if (metricsServer) {
            metricsServer.close(() => {
                logger.info('Metrics server stopped');
                metricsServer = null;
                resolve();
            });
        } else {
            resolve();
        }
    });
}

// Register cleanup handler
process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down metrics server');
    await stopMetricsServer();
});

process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down metrics server');
    await stopMetricsServer();
});

export { register };