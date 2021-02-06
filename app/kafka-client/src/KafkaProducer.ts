import debugLib from 'debug';
import config from 'config';
import { injectable } from 'inversify';
import * as kafkajs from 'kafkajs';

const debugLog = debugLib('kafka-client:KafkaProducer');
const debugError = debugLib('error:kafka-client:KafkaProducer');

@injectable()
export class KafkaProducer {
  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  readonly #producer: kafkajs.Producer;
  #topic: string;
  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  public constructor() {
    this.#topic = config.get<string>('kafka.topic');

    const kafka = new kafkajs.Kafka({
      clientId: config.get<string>('clientId'),
      brokers: config.get<string[]>('kafka.brokers'),
    });

    this.#producer = kafka.producer({
      allowAutoTopicCreation: false,
      retry: {
        retries: 3,
        initialRetryTime: 10,
        maxRetryTime: 60,
      },
    });
  }

  public async connect(): Promise<boolean> {
    debugLog('Connecting as producer...');
    try {
      await this.#producer.connect();
    } catch (error) {
      debugError('Failed to connect:', error);
      return false;
    }
    debugLog('Connected!');

    return true;
  }

  public async disconnect(): Promise<void> {
    await this.#producer.disconnect();
  }

  public async sendMessage(value: string | Buffer): Promise<boolean> {
    try {
      const recordMetadata = await this.#producer.send({
        topic: this.#topic,
        messages: [
          {
            value,
          },
        ],
      });

      debugLog(recordMetadata);

      return true;
    } catch (error) {
      debugError('Failed to send messages:', error);
      return false;
    }
  }
}
