import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private logLevel: LogLevel;
  private logFilePath: string;

  constructor() {
    this.logLevel = this.getLogLevel(CONFIG.log.level);
    this.logFilePath = CONFIG.log.filePath;
    this.ensureLogDirectory();
  }

  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error': return LogLevel.ERROR;
      case 'warn': return LogLevel.WARN;
      case 'info': return LogLevel.INFO;
      case 'debug': return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private ensureLogDirectory(): void {
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `[${timestamp}] ${level}: ${message}${dataStr}\n`;
  }

  private writeLog(level: string, message: string, data?: any): void {
    const formattedMessage = this.formatMessage(level, message, data);
    
    // コンソールに出力
    console.log(formattedMessage.trim());
    
    // ファイルに出力
    try {
      fs.appendFileSync(this.logFilePath, formattedMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  error(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.ERROR) {
      this.writeLog('ERROR', message, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.WARN) {
      this.writeLog('WARN', message, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.INFO) {
      this.writeLog('INFO', message, data);
    }
  }

  debug(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      this.writeLog('DEBUG', message, data);
    }
  }
}

export const logger = new Logger();