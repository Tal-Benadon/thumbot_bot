/**
 * Enhanced logging system with colors and structured output for ThumbBot Discord Bot
 */
import winston from 'winston';
import chalk from 'chalk';

// Custom format with colors for console
const coloredConsoleFormat = winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, service, ...meta }) => {
        const lvl = {
            error: chalk.red.bold(level.toUpperCase().padEnd(7)),
            warn: chalk.yellow.bold(level.toUpperCase().padEnd(7)),
            info: chalk.blue.bold(level.toUpperCase().padEnd(7)),
            debug: chalk.gray.bold(level.toUpperCase().padEnd(7)),
            verbose: chalk.cyan.bold(level.toUpperCase().padEnd(7))
        }[level] || chalk.white.bold(level.toUpperCase().padEnd(7));
        
        const msg = level === 'error' ? chalk.red(message) : message;
        
        const extra = Object.keys(meta).length > 0 ? 
            chalk.gray(` ${JSON.stringify(meta)}`) : '';
        
        return `${lvl} | ${msg}${extra}`;
    })
);

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'thumbbot-discord-bot' },
    transports: [
        // Console transport with colors (stdout only)
        new winston.transports.Console({
            format: coloredConsoleFormat
        })
    ]
});

// Convenience functions with emojis and colors
export class ThumbBotLogger {
    private logger: winston.Logger;
    
    constructor(service?: string) {
        this.logger = service ? logger.child({ service }) : logger;
    }
    
    info(message: string, meta?: any) {
        this.logger.info(message, meta);
    }
    
    error(message: string, meta?: any) {
        this.logger.error(message, meta);
    }
    
    warn(message: string, meta?: any) {
        this.logger.warn(message, meta);
    }
    
    debug(message: string, meta?: any) {
        this.logger.debug(message, meta);
    }
    
    success(message: string, meta?: any) {
        this.logger.info(`✅ ${message}`, meta);
    }
    
    // Discord-specific logging methods
    logBotReady(username: string, guildCount: number) {
        this.success(`Bot logged in as ${chalk.cyan(username)} | Serving ${chalk.yellow(guildCount)} guilds`);
    }
    
    logMessageReceived(guildName: string, channelName: string, author: string) {
        this.info(`📨 Message from ${chalk.cyan(author)} in ${chalk.green(guildName)}#${chalk.blue(channelName)}`);
    }
    
    logLinkDetected(url: string, provider: string) {
        this.info(`🔗 Detected ${chalk.magenta(provider)} link: ${chalk.underline(url)}`);
    }
    
    logApiRequest(method: string, url: string, status?: number) {
        if (status) {
            if (status >= 200 && status < 300) {
                this.success(`${method} ${url} -> ${status}`);
            } else if (status >= 400) {
                this.error(`${method} ${url} -> ${status}`);
            } else {
                this.info(`${method} ${url} -> ${status}`);
            }
        } else {
            this.info(`🚀 ${method} ${url}`);
        }
    }
    
    logProviderCheck(url: string, supported: boolean) {
        if (supported) {
            this.success(`Provider check: ${url} is supported`);
        } else {
            this.debug(`Provider check: ${url} not supported`);
        }
    }
    
    logSystemInfo(info: any) {
        this.info(`🖥️  System Info`, info);
    }
    
    logConfigLoaded(itemCount: number) {
        this.success(`⚙️  Configuration loaded: ${itemCount} items`);
    }
}

// Export default logger instance
export const thumbbotLogger = new ThumbBotLogger();
export default logger;