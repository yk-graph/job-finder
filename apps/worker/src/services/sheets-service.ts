import { GoogleAuth } from 'google-auth-library';
import { sheets_v4, google } from 'googleapis';
import { CONFIG } from '../utils/config';
import { logger } from '../utils/logger';
import { JobListing } from '../types/job';

export class SheetsService {
  private sheets: sheets_v4.Sheets;
  private auth: GoogleAuth;

  constructor() {
    this.auth = new GoogleAuth({
      credentials: {
        client_email: CONFIG.google.clientEmail,
        private_key: CONFIG.google.privateKey
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async saveJobs(jobs: JobListing[]): Promise<boolean> {
    try {
      // ヘッダー行を準備
      const headers = [
        'ID', 'タイトル', '会社名', '勤務地', '給与', 
        '雇用形態', '投稿日', 'URL', 'ソース', 'スクレイプ日時'
      ];

      // データ行を準備
      const rows = jobs.map(job => [
        job.id,
        job.title,
        job.company,
        job.location,
        job.salary || '',
        job.employmentType || '',
        job.postedDate,
        job.url,
        job.source,
        job.scrapedAt
      ]);

      // 既存のデータをクリア（オプション：必要に応じて）
      await this.clearSheet();

      // ヘッダーとデータを一緒に書き込み
      const allRows = [headers, ...rows];

      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.google.spreadsheetId,
        range: `${CONFIG.google.sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: allRows
        }
      });

      logger.info(`${jobs.length} jobs saved to Google Sheets`, { 
        updatedCells: response.data.updatedCells 
      });
      return true;

    } catch (error) {
      logger.error('Failed to save jobs to Google Sheets', { error: error });
      return false;
    }
  }

  async appendJobs(jobs: JobListing[]): Promise<boolean> {
    try {
      const rows = jobs.map(job => [
        job.id,
        job.title,
        job.company,
        job.location,
        job.salary || '',
        job.employmentType || '',
        job.postedDate,
        job.url,
        job.source,
        job.scrapedAt
      ]);

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG.google.spreadsheetId,
        range: `${CONFIG.google.sheetName}!A:J`,
        valueInputOption: 'RAW',
        requestBody: {
          values: rows
        }
      });

      logger.info(`${jobs.length} jobs appended to Google Sheets`, { 
        updatedCells: response.data.updates?.updatedCells 
      });
      return true;

    } catch (error) {
      logger.error('Failed to append jobs to Google Sheets', { error: error });
      return false;
    }
  }

  private async clearSheet(): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: CONFIG.google.spreadsheetId,
        range: `${CONFIG.google.sheetName}!A:Z`
      });
      logger.info('Google Sheet cleared');
    } catch (error) {
      logger.error('Failed to clear Google Sheet', { error: error });
    }
  }

  async setupHeaders(): Promise<boolean> {
    try {
      const headers = [
        'ID', 'タイトル', '会社名', '勤務地', '給与', 
        '雇用形態', '投稿日', 'URL', 'ソース', 'スクレイプ日時'
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG.google.spreadsheetId,
        range: `${CONFIG.google.sheetName}!A1:J1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers]
        }
      });

      logger.info('Headers set up in Google Sheets');
      return true;
    } catch (error) {
      logger.error('Failed to setup headers in Google Sheets', { error: error });
      return false;
    }
  }
}