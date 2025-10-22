import AWS from 'aws-sdk';
import { CONFIG } from '../utils/config';
import { logger } from '../utils/logger';
import { JobListing } from '../types/job';

export class DynamoDBService {
  private dynamoDb: AWS.DynamoDB.DocumentClient;

  constructor() {
    AWS.config.update({
      region: CONFIG.aws.region,
      accessKeyId: CONFIG.aws.accessKeyId,
      secretAccessKey: CONFIG.aws.secretAccessKey
    });

    this.dynamoDb = new AWS.DynamoDB.DocumentClient({
      endpoint: CONFIG.aws.dynamodb.endpoint || undefined
    });
  }

  async saveJob(job: JobListing): Promise<boolean> {
    try {
      const params = {
        TableName: CONFIG.aws.dynamodb.tableName,
        Item: {
          ...job,
          ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90日後にexpire
        }
      };

      await this.dynamoDb.put(params).promise();
      logger.info(`Job saved to DynamoDB: ${job.title} at ${job.company}`);
      return true;
    } catch (error) {
      logger.error('Failed to save job to DynamoDB', { error: error, jobId: job.id });
      return false;
    }
  }

  async saveJobs(jobs: JobListing[]): Promise<number> {
    let successCount = 0;

    // バッチ処理で効率化（最大25件ずつ）
    const batchSize = 25;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      
      try {
        const requests = batch.map(job => ({
          PutRequest: {
            Item: {
              ...job,
              ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
            }
          }
        }));

        const params = {
          RequestItems: {
            [CONFIG.aws.dynamodb.tableName]: requests
          }
        };

        await this.dynamoDb.batchWrite(params).promise();
        successCount += batch.length;
        logger.info(`Batch of ${batch.length} jobs saved to DynamoDB`);
      } catch (error) {
        logger.error('Failed to save batch to DynamoDB', { error: error, batchSize: batch.length });
      }
    }

    return successCount;
  }

  async checkJobExists(jobId: string): Promise<boolean> {
    try {
      const params = {
        TableName: CONFIG.aws.dynamodb.tableName,
        Key: { id: jobId }
      };

      const result = await this.dynamoDb.get(params).promise();
      return !!result.Item;
    } catch (error) {
      logger.error('Failed to check job existence in DynamoDB', { error: error, jobId });
      return false;
    }
  }
}