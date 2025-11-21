/**
 * Centralized logging utility
 * 
 * In development: logs to console
 * In production: only errors are logged, other logs are suppressed
 * 
 * TODO: Integrate with error tracking service (e.g., Sentry) for production
 */

const isDev = import.meta.env.DEV;

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
   * Log error messages (always logged)
   */
  error: (...args: unknown[]) => {
    console.error(...args);
    // TODO: Send to error tracking service in production
    // if (!isDev) {
    //   Sentry.captureException(args[0]);
    // }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
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

