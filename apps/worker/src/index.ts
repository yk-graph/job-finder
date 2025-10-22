import { IndeedScraper } from './scrapers/indeed-scraper';
import { logger } from './utils/logger';
import { validateConfig } from './utils/config';

/**
 * メインエントリーポイント
 * スクレイピングの実行を管理
 */
async function main() {
  logger.info('=== Job Scraper Worker Started ===');

  try {
    // 設定の検証
    const configErrors = validateConfig();
    if (configErrors.length > 0) {
      logger.error('Configuration validation failed', { errors: configErrors });
      process.exit(1);
    }

    // コマンドライン引数の解析
    const args = process.argv.slice(2);
    const searchQuery = args[0] || 'エンジニア';
    const location = args[1] || '東京';
    const maxPages = parseInt(args[2]) || 3;

    logger.info('Starting scraping job', {
      searchQuery,
      location,
      maxPages
    });

    // スクレイピング実行
    const scraper = new IndeedScraper();
    const result = await scraper.scrapeJobs(searchQuery, location, maxPages);
    await scraper.close();

    // 結果をログ出力
    if (result.success) {
      logger.info('Scraping completed successfully', {
        jobsFound: result.jobsFound,
        timestamp: result.timestamp
      });
    } else {
      logger.error('Scraping completed with errors', {
        jobsFound: result.jobsFound,
        errors: result.errors,
        timestamp: result.timestamp
      });
    }

    logger.info('=== Job Scraper Worker Finished ===');
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    logger.error('Fatal error in main process', { error });
    process.exit(1);
  }
}

// プロセス終了時のクリーンアップ
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// 未処理の例外をキャッチ
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

// メイン関数を実行
if (require.main === module) {
  main();
}