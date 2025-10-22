import { config } from 'dotenv';
import path from 'path';

// .envファイルを読み込み
config({ path: path.resolve(__dirname, '../../.env') });

export const CONFIG = {
  // AWS設定
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    dynamodb: {
      tableName: process.env.DYNAMODB_TABLE_NAME || 'job-listings',
      endpoint: process.env.DYNAMODB_ENDPOINT || ''
    }
  },

  // Google Sheets設定
  google: {
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL || '',
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
    sheetName: process.env.GOOGLE_SHEET_NAME || 'Jobs'
  },

  // スクレイピング設定
  scraping: {
    delayMs: parseInt(process.env.SCRAPING_DELAY_MS || '2000'),
    userAgent: process.env.SCRAPING_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    indeedBaseUrl: process.env.INDEED_BASE_URL || 'https://jp.indeed.com',
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '5000')
  },

  // ログ設定
  log: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/scraping.log'
  }
};

// 必須の環境変数をチェック
export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!CONFIG.aws.accessKeyId) {
    errors.push('AWS_ACCESS_KEY_ID is required');
  }
  if (!CONFIG.aws.secretAccessKey) {
    errors.push('AWS_SECRET_ACCESS_KEY is required');
  }
  if (!CONFIG.google.clientEmail) {
    errors.push('GOOGLE_CLIENT_EMAIL is required');
  }
  if (!CONFIG.google.privateKey) {
    errors.push('GOOGLE_PRIVATE_KEY is required');
  }
  if (!CONFIG.google.spreadsheetId) {
    errors.push('GOOGLE_SPREADSHEET_ID is required');
  }

  return errors;
}