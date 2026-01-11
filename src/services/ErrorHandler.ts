export enum ErrorLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface ErrorDetails {
  message: string;
  level: ErrorLevel;
  context?: string;
  error?: Error | unknown;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean;
  enablePersistence: boolean;
  maxStoredErrors: number;
}

class ErrorHandlerService {
  private config: ErrorHandlerConfig;
  private errorLog: ErrorDetails[] = [];
  private readonly STORAGE_KEY = 'app_error_log';

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableConsoleLogging: config.enableConsoleLogging ?? true,
      enablePersistence: config.enablePersistence ?? false,
      maxStoredErrors: config.maxStoredErrors ?? 50
    };

    if (this.config.enablePersistence) {
      this.loadPersistedErrors();
    }
  }

  handle(details: Omit<ErrorDetails, 'timestamp'>): void {
    const errorEntry: ErrorDetails = {
      ...details,
      timestamp: new Date()
    };

    this.errorLog.push(errorEntry);

    if (this.errorLog.length > this.config.maxStoredErrors) {
      this.errorLog.shift();
    }

    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorEntry);
    }

    if (this.config.enablePersistence) {
      this.persistErrors();
    }
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    this.handle({
      message,
      level: ErrorLevel.INFO,
      context,
      metadata
    });
  }

  warn(message: string, context?: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    this.handle({
      message,
      level: ErrorLevel.WARNING,
      context,
      error,
      metadata
    });
  }

  error(message: string, context?: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    this.handle({
      message,
      level: ErrorLevel.ERROR,
      context,
      error,
      metadata
    });
  }

  critical(message: string, context?: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    this.handle({
      message,
      level: ErrorLevel.CRITICAL,
      context,
      error,
      metadata
    });
  }

  getErrors(level?: ErrorLevel): ErrorDetails[] {
    if (level) {
      return this.errorLog.filter(e => e.level === level);
    }
    return [...this.errorLog];
  }

  clearErrors(): void {
    this.errorLog = [];
    if (this.config.enablePersistence) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private logToConsole(details: ErrorDetails): void {
    const timestamp = details.timestamp?.toISOString() || new Date().toISOString();
    const prefix = `[${timestamp}] [${details.level}]`;
    const contextStr = details.context ? ` [${details.context}]` : '';
    const fullMessage = `${prefix}${contextStr} ${details.message}`;

    switch (details.level) {
      case ErrorLevel.INFO:
        console.info(fullMessage, details.metadata || '');
        break;
      case ErrorLevel.WARNING:
        console.warn(fullMessage, details.error || '', details.metadata || '');
        break;
      case ErrorLevel.ERROR:
        console.error(fullMessage, details.error || '', details.metadata || '');
        break;
      case ErrorLevel.CRITICAL:
        console.error(`🚨 ${fullMessage}`, details.error || '', details.metadata || '');
        break;
    }
  }

  private persistErrors(): void {
    try {
      const serialized = JSON.stringify(
        this.errorLog.map(e => ({
          ...e,
          error: e.error instanceof Error ? e.error.message : String(e.error),
          timestamp: e.timestamp?.toISOString()
        }))
      );
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (e) {
      console.error('Failed to persist errors to localStorage:', e);
    }
  }

  private loadPersistedErrors(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.errorLog = parsed.map((e: any) => ({
          ...e,
          timestamp: e.timestamp ? new Date(e.timestamp) : new Date()
        }));
      }
    } catch (e) {
      console.error('Failed to load persisted errors from localStorage:', e);
    }
  }
}

export const errorHandler = new ErrorHandlerService({
  enableConsoleLogging: true,
  enablePersistence: false,
  maxStoredErrors: 100
});
