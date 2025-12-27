/**
 * Tests for ThumbBot Discord Bot logging system
 */
import { ThumbBotLogger, thumbbotLogger } from '../utils/logger';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Mock Winston transports to capture log output
class MockTransport extends winston.transports.Console {
    public logs: string[] = [];

    log(info: any, callback?: () => void) {
        this.logs.push(info.message || JSON.stringify(info));
        if (callback) callback();
    }
}

describe('ThumbBotLogger', () => {
    let logger: ThumbBotLogger;
    let mockTransport: MockTransport;

    beforeEach(() => {
        mockTransport = new MockTransport();
        logger = new ThumbBotLogger('test');
        
        // Replace the logger's transports with our mock
        (logger as any).logger.clear();
        (logger as any).logger.add(mockTransport);
        
        // Increase max listeners to avoid warnings in tests
        (logger as any).logger.setMaxListeners(20);
    });

    afterEach(() => {
        // Clean up logger to prevent memory leaks
        if (logger && (logger as any).logger) {
            (logger as any).logger.clear();
            (logger as any).logger.close();
        }
    });

    test('should create logger instance', () => {
        expect(logger).toBeInstanceOf(ThumbBotLogger);
    });

    test('should log info messages without throwing errors', () => {
        expect(() => {
            logger.info('Test info message');
        }).not.toThrow();
    });

    test('should log error messages without throwing errors', () => {
        expect(() => {
            logger.error('Test error message');
        }).not.toThrow();
    });

    test('should log warning messages without throwing errors', () => {
        expect(() => {
            logger.warn('Test warning message');
        }).not.toThrow();
    });

    test('should log success messages without throwing errors', () => {
        expect(() => {
            logger.success('Test success message');
        }).not.toThrow();
    });

    test('should log bot ready event without throwing errors', () => {
        expect(() => {
            logger.logBotReady('TestBot#1234', 5);
        }).not.toThrow();
    });

    test('should log message received event without throwing errors', () => {
        expect(() => {
            logger.logMessageReceived('TestGuild', 'general', 'testuser');
        }).not.toThrow();
    });

    test('should log link detection without throwing errors', () => {
        expect(() => {
            logger.logLinkDetected('https://instagram.com/test', 'instagram');
        }).not.toThrow();
    });

    test('should log API requests without throwing errors', () => {
        expect(() => {
            logger.logApiRequest('POST', 'http://localhost:8001/videos', 200);
        }).not.toThrow();
    });

    test('should log provider checks without throwing errors', () => {
        expect(() => {
            logger.logProviderCheck('https://example.com', false);
        }).not.toThrow();
    });

    test('should log system info without throwing errors', () => {
        expect(() => {
            logger.logSystemInfo({ guilds: 5, users: 100 });
        }).not.toThrow();
    });

    test('should log config loaded without throwing errors', () => {
        expect(() => {
            logger.logConfigLoaded(10);
        }).not.toThrow();
    });

    test('should handle metadata objects in logging', () => {
        expect(() => {
            logger.info('Test message with metadata', { key: 'value', number: 42 });
        }).not.toThrow();
    });
});

describe('Global Logger', () => {
    test('should have global logger instance', () => {
        expect(thumbbotLogger).toBeInstanceOf(ThumbBotLogger);
    });
});

describe('Log Configuration', () => {
    test('should use stdout only (no log files)', () => {
        const logsDir = path.join(process.cwd(), 'logs');
        // Logger should not create logs directory since we're using stdout only
        expect(fs.existsSync(logsDir)).toBe(false);
    });
});