import './sentry';

import type {
  DynamoDBBatchResponse,
  DynamoDBStreamEvent,
  Handler,
} from 'aws-lambda';

import { logger } from './logger';
import { TaskRunner } from './runner';

const handleDynamoDbEvent = async (
  event: DynamoDBStreamEvent
): Promise<DynamoDBBatchResponse> => {
  logger.info('Handling DynamoDB event...');
  logger.info('Searching for INSERT events to process');
  const tasks = event.Records.filter(
    (record) => record.eventName === 'INSERT'
  ).map((record) => {
    return TaskRunner.fromRecord(record);
  });

  const results = await Promise.all(tasks.map((task) => task.run()));
  return {
    batchItemFailures: results
      .filter(({ error }) => error != null)
      .map(({ id }) => ({ itemIdentifier: id.toString() })),
  };
};

export const handler: Handler<DynamoDBStreamEvent> = async (event) => {
  logger.info('Starting Task Runner...');
  logger.info("Event: '%o'", event);

  if (
    event.Records &&
    event.Records[0] &&
    event.Records[0].eventSource === 'aws:dynamodb'
  ) {
    logger.info('Starting DynamoDB event handling');
    return handleDynamoDbEvent(event);
  }
  throw new Error('Event source is not from DynamoDB Stream. Ignoring');
};
