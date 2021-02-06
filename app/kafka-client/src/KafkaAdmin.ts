import debugLib from 'debug';
import config from 'config';
import { injectable } from 'inversify';
import * as kafkajs from 'kafkajs';

const debugLog = debugLib('kafka-client:KafkaAdmin');
const debugError = debugLib('error:kafka-client:KafkaAdmin');

@injectable()
export class KafkaAdmin {
  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  readonly #admin: kafkajs.Admin;
  #topic: string;
  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  public constructor() {
    this.#topic = config.get<string>('kafka.topic');

    const kafka = new kafkajs.Kafka({
      clientId: config.get<string>('clientId'),
      brokers: config.get<string[]>('kafka.brokers'),
    });

    this.#admin = kafka.admin({
      retry: {
        retries: 3,
        initialRetryTime: 10,
        maxRetryTime: 60,
      },
    });
  }

  public async connect(): Promise<boolean> {
    debugLog('Connecting as admin...');
    try {
      await this.#admin.connect();
    } catch (error) {
      debugError('Failed to connect:', error);
      return false;
    }
    debugLog('Connected!');

    return true;
  }

  public async disconnect(): Promise<void> {
    await this.#admin.disconnect();
  }

  public async createTopic(): Promise<boolean> {
    try {
      const topics = await this.#admin.listTopics();

      if (!topics.includes(this.#topic)) {
        debugLog(`Creating new topic: ${this.#topic}`);
        await this.#admin.createTopics({
          topics: [
            {
              topic: this.#topic,
              numPartitions: 1,
            },
          ],
        });
      }
    } catch (error) {
      debugError('Failed to create topic:', error);
      return false;
    }

    return true;
  }
}
