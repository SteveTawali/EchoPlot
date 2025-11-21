/**
 * Centralized logging utility
 * 
 * In development: logs to console
 * In production: only errors are logged, other logs are suppressed
 * Errors are automatically sent to Sentry in production
 */

const isDev = import.meta.env.DEV;

// Lazy load Sentry to avoid issues in test environment
let Sentry: typeof import('@sentry/react') | null = null;

const getSentry = async () => {
  if (Sentry) return Sentry;
  if (isDev) return null;
  
  try {
    Sentry = await import('@sentry/react');
    return Sentry;
  } catch {
    return null;
  }
};

export const logger = {
  /**
   * Log informational messages (development only)
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log error messages (always logged, sent to Sentry in production)
   */
  error: (...args: unknown[]) => {
    console.error(...args);
    
    // Send to Sentry in production (fire and forget)
    if (!isDev) {
      getSentry().then((sentry) => {
        if (sentry) {
          const error = args[0];
          if (error instanceof Error) {
            sentry.captureException(error);
          } else if (typeof error === 'string') {
            sentry.captureMessage(error, 'error');
          } else {
            sentry.captureException(new Error(String(error)));
          }
        }
      }).catch(() => {
        // Sentry not available, ignore
      });
    }
  },

  /**
   * Log warning messages (development only, sent to Sentry as warnings in production)
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    } else {
      // Send warnings to Sentry in production (fire and forget)
      getSentry().then((sentry) => {
        if (sentry) {
          const warning = args[0];
          if (typeof warning === 'string') {
            sentry.captureMessage(warning, 'warning');
          }
        }
      }).catch(() => {
        // Sentry not available, ignore
      });
    }
  },

  /**
   * Log debug messages (development only)
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};

