import { chromium, Browser, Page } from 'playwright';
import { CONFIG } from '../utils/config';
import { logger } from '../utils/logger';
import { JobListing, ScrapingResult } from '../types/job';
import { DynamoDBService } from '../services/dynamodb-service';
import { SheetsService } from '../services/sheets-service';
import crypto from 'crypto';

export class IndeedScraper {
  private browser: Browser | null = null;
  private dynamoService: DynamoDBService;
  private sheetsService: SheetsService;

  constructor() {
    this.dynamoService = new DynamoDBService();
    this.sheetsService = new SheetsService();
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true, // 本番では true、デバッグ時は false
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    logger.info('Browser initialized for scraping');
  }

  async scrapeJobs(searchQuery: string, location: string = '東京', maxPages: number = 3): Promise<ScrapingResult> {
    const startTime = new Date().toISOString();
    const jobs: JobListing[] = [];
    const errors: string[] = [];

    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page = await this.browser!.newPage();
      
      // User-Agentを設定
      await page.setUserAgent(CONFIG.scraping.userAgent);

      // 初期検索
      const searchUrl = this.buildSearchUrl(searchQuery, location);
      logger.info(`Starting scrape: ${searchUrl}`);

      for (let pageNum = 0; pageNum < maxPages; pageNum++) {
        try {
          const pageUrl = pageNum === 0 ? searchUrl : `${searchUrl}&start=${pageNum * 10}`;
          await page.goto(pageUrl, { waitUntil: 'networkidle' });

          // ページの求人を抽出
          const pageJobs = await this.extractJobsFromPage(page);
          jobs.push(...pageJobs);

          logger.info(`Page ${pageNum + 1}: Found ${pageJobs.length} jobs`);

          // 次のページがあるかチェック
          const hasNextPage = await this.hasNextPage(page);
          if (!hasNextPage) {
            logger.info('No more pages available');
            break;
          }

          // 遅延を追加（サイトに負荷をかけないため）
          await page.waitForTimeout(CONFIG.scraping.delayMs);

        } catch (error) {
          const errorMsg = `Error on page ${pageNum + 1}: ${error}`;
          logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      await page.close();

      // データを保存
      if (jobs.length > 0) {
        await this.saveJobs(jobs);
      }

      return {
        success: errors.length === 0,
        jobsFound: jobs.length,
        errors,
        timestamp: startTime
      };

    } catch (error) {
      const errorMsg = `Fatal scraping error: ${error}`;
      logger.error(errorMsg);
      return {
        success: false,
        jobsFound: jobs.length,
        errors: [errorMsg],
        timestamp: startTime
      };
    }
  }

  private buildSearchUrl(query: string, location: string): string {
    const baseUrl = CONFIG.scraping.indeedBaseUrl;
    const encodedQuery = encodeURIComponent(query);
    const encodedLocation = encodeURIComponent(location);
    return `${baseUrl}/jobs?q=${encodedQuery}&l=${encodedLocation}`;
  }

  private async extractJobsFromPage(page: Page): Promise<JobListing[]> {
    const jobs: JobListing[] = [];

    try {
      // 求人カードのセレクターを待機
      await page.waitForSelector('[data-jk]', { timeout: 10000 });

      // 求人情報を抽出
      const jobElements = await page.locator('[data-jk]').all();

      for (const element of jobElements) {
        try {
          const job = await this.extractJobDetails(element, page);
          if (job) {
            jobs.push(job);
          }
        } catch (error) {
          logger.error('Failed to extract job details', { error });
        }
      }

    } catch (error) {
      logger.error('Failed to extract jobs from page', { error });
    }

    return jobs;
  }

  private async extractJobDetails(element: any, page: Page): Promise<JobListing | null> {
    try {
      // 基本情報を抽出
      const title = await element.locator('h2 a span').first().textContent() || '';
      const company = await element.locator('[data-testid="company-name"]').textContent() || '';
      const location = await element.locator('[data-testid="job-location"]').textContent() || '';
      const jobUrl = await element.locator('h2 a').getAttribute('href') || '';
      
      // 給与情報（存在する場合）
      const salaryElement = element.locator('[data-testid="attribute_snippet_testid"]');
      const salary = await salaryElement.textContent().catch(() => '');

      // URLを完全なURLに変換
      const fullUrl = jobUrl.startsWith('http') ? jobUrl : `${CONFIG.scraping.indeedBaseUrl}${jobUrl}`;

      // 一意のIDを生成
      const jobId = crypto.createHash('md5').update(fullUrl).digest('hex');

      // 投稿日の取得（簡易版）
      const postedDate = new Date().toISOString().split('T')[0]; // 今日の日付をデフォルト

      const job: JobListing = {
        id: jobId,
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        description: '', // 詳細ページから取得する場合はここを拡張
        salary: salary?.trim() || undefined,
        employmentType: undefined, // 必要に応じて抽出ロジックを追加
        postedDate,
        url: fullUrl,
        source: 'indeed',
        scrapedAt: new Date().toISOString()
      };

      return job;

    } catch (error) {
      logger.error('Failed to extract job details from element', { error });
      return null;
    }
  }

  private async hasNextPage(page: Page): Promise<boolean> {
    try {
      const nextButton = page.locator('a[aria-label="次"]').first();
      return await nextButton.count() > 0;
    } catch {
      return false;
    }
  }

  private async saveJobs(jobs: JobListing[]): Promise<void> {
    try {
      // 重複チェック
      const uniqueJobs: JobListing[] = [];
      for (const job of jobs) {
        const exists = await this.dynamoService.checkJobExists(job.id);
        if (!exists) {
          uniqueJobs.push(job);
        }
      }

      if (uniqueJobs.length === 0) {
        logger.info('No new jobs to save (all duplicates)');
        return;
      }

      // DynamoDBに保存
      const dynamoSuccess = await this.dynamoService.saveJobs(uniqueJobs);
      logger.info(`DynamoDB: ${dynamoSuccess} jobs saved`);

      // Google Sheetsに保存
      const sheetsSuccess = await this.sheetsService.appendJobs(uniqueJobs);
      logger.info(`Google Sheets: ${sheetsSuccess ? 'Success' : 'Failed'}`);

    } catch (error) {
      logger.error('Failed to save jobs', { error });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }
}

// 直接実行用のスクリプト
if (require.main === module) {
  const scraper = new IndeedScraper();
  
  scraper.scrapeJobs('エンジニア', '東京', 2)
    .then((result) => {
      logger.info('Scraping completed', result);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Scraping failed', { error });
      process.exit(1);
    })
    .finally(() => {
      scraper.close();
    });
}