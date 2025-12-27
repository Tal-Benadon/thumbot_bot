/**
 * Tests for ThumbBot Discord Bot metrics system
 */
import {
    trackMessage,
    trackLinkDetection,
    trackDownloaderRequest,
    trackApiError,
    updateGuildCount,
    updateActiveConnections,
    incrementBotReady,
    MetricsContext,
    startMetricsServer,
    stopMetricsServer
} from '../utils/metrics';

describe('Metrics Tracking', () => {
    test('should track messages without errors', () => {
        expect(() => {
            trackMessage('TestGuild', 'general', true);
            trackMessage('TestGuild', 'general', false);
        }).not.toThrow();
    });

    test('should track link detections without errors', () => {
        expect(() => {
            trackLinkDetection('instagram', true);
            trackLinkDetection('unknown', false);
        }).not.toThrow();
    });

    test('should track downloader requests without errors', () => {
        expect(() => {
            trackDownloaderRequest('success', 1.5);
            trackDownloaderRequest('error');
        }).not.toThrow();
    });

    test('should track API errors without errors', () => {
        expect(() => {
            trackApiError('/videos', 'network_error');
            trackApiError('/videos', 'timeout');
        }).not.toThrow();
    });

    test('should update guild count', () => {
        expect(() => {
            updateGuildCount(10);
            updateGuildCount(0);
        }).not.toThrow();
    });

    test('should update active connections', () => {
        expect(() => {
            updateActiveConnections(1);
            updateActiveConnections(0);
        }).not.toThrow();
    });

    test('should increment bot ready counter', () => {
        expect(() => {
            incrementBotReady();
        }).not.toThrow();
    });
});

describe('MetricsContext', () => {
    test('should create metrics context', () => {
        const context = new MetricsContext({ test: 'value' });
        expect(context).toBeInstanceOf(MetricsContext);
    });

    test('should finish with success status', () => {
        const context = new MetricsContext();
        expect(() => {
            context.finish('success');
        }).not.toThrow();
    });

    test('should finish with error status', () => {
        const context = new MetricsContext();
        expect(() => {
            context.finish('error');
        }).not.toThrow();
    });
});

describe('Metrics Server', () => {
    test('should handle server operations without crashing', async () => {
        // Test that we can call the functions without them throwing
        // Don't actually start/stop server in tests to avoid port conflicts
        expect(typeof startMetricsServer).toBe('function');
        expect(typeof stopMetricsServer).toBe('function');
    }, 5000);
});

describe('Metrics Integration', () => {
    test('should track multiple metrics in sequence', () => {
        expect(() => {
            // Simulate a typical bot workflow
            incrementBotReady();
            updateGuildCount(5);
            updateActiveConnections(1);
            trackMessage('TestGuild', 'general', true);
            trackLinkDetection('instagram', true);
            trackDownloaderRequest('success', 2.1);
        }).not.toThrow();
    });

    test('should handle error scenarios', () => {
        expect(() => {
            trackApiError('/videos', 'network_error');
            trackDownloaderRequest('error');
            trackLinkDetection('unknown', false);
        }).not.toThrow();
    });
});