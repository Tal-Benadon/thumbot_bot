import app from './server/server'
import './bot/discord'
import { ThumbBotLogger } from './utils/logger'
import { startMetricsServer } from './utils/metrics'

const logger = new ThumbBotLogger('main');
const PORT = process.env.PORT || 3000
const METRICS_PORT = process.env.METRICS_PORT || 3001

function logStartupConfig() {
    console.log('='.repeat(60));
    console.log('🔧 THUMBBOT DISCORD BOT CONFIGURATION');
    console.log('='.repeat(60));
    
    // Environment info
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`📊 Log Level: ${process.env.LOG_LEVEL || 'info'}`);
    console.log(`🚀 Server Port: ${PORT}`);
    console.log(`📈 Metrics Port: ${METRICS_PORT}`);
    
    // Service endpoints
    console.log(`🔗 Downloader Host: ${process.env.DOWNLOADER_HOST || '127.0.0.1'}`);
    console.log(`🔗 Downloader Port: ${process.env.DOWNLOADER_PORT || '8001'}`);
    console.log(`🎬 Downloader URL: http://${process.env.DOWNLOADER_HOST || '127.0.0.1'}:${process.env.DOWNLOADER_PORT || '8001'}/videos`);
    
    // Discord info (without token)
    if (process.env.DISCORD_TOKEN) {
        const tokenPreview = process.env.DISCORD_TOKEN.substring(0, 8) + '...' + process.env.DISCORD_TOKEN.slice(-4);
        console.log(`🤖 Discord Token: ${tokenPreview} (${process.env.DISCORD_TOKEN.length} chars)`);
    } else {
        console.log('❌ Discord Token: NOT SET');
    }
    
    // Environment variables (non-sensitive)
    const envVars: string[] = [];
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('DOWNLOADER_') || 
            key.startsWith('LOG_') ||
            key.startsWith('PORT') ||
            key.startsWith('METRICS_') ||
            key.startsWith('NODE_ENV')) {
            envVars.push(`  ${key}=${process.env[key]}`);
        }
    });
    
    if (envVars.length > 0) {
        console.log('🔧 Environment Variables:');
        envVars.sort().forEach(envVar => console.log(envVar));
    }
    
    console.log('='.repeat(60));
}

async function startServices() {
    try {
        logStartupConfig();
        
        // Start metrics server
        await startMetricsServer(Number(METRICS_PORT));
        
        // Start main server
        app.listen(PORT, () => {
            logger.success(`🚀 ThumbBot Discord Bot server running on port ${PORT}`);
            logger.info(`📊 Metrics available at http://localhost:${METRICS_PORT}/metrics`);
        });
        
    } catch (error) {
        logger.error('Failed to start services:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('Received SIGTERM signal, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('Received SIGINT signal, shutting down gracefully');
    process.exit(0);
});

startServices();
