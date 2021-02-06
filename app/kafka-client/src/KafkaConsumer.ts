import debugLib from 'debug';
import config from 'config';
import { injectable } from 'inversify';
import * as kafkajs from 'kafkajs';

const debugLog = debugLib('kafka-client:KafkaConsumer');
const debugError = debugLib('error:kafka-client:KafkaConsumer');

@injectable()
export class KafkaConsumer {
  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  readonly #consumer: kafkajs.Consumer;
  #topic: string;
  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  public constructor() {
    this.#topic = config.get<string>('kafka.topic');

    const kafka = new kafkajs.Kafka({
      clientId: config.get<string>('clientId'),
      brokers: config.get<string[]>('kafka.brokers'),
    });

    this.#consumer = kafka.consumer({
      groupId: `test-group-${Math.random()}`,
      retry: {
        retries: 3,
        initialRetryTime: 10,
        maxRetryTime: 60,
      },
    });
  }

  public async connect(): Promise<boolean> {
    debugLog('Connecting as consumer...');
    try {
      await this.#consumer.connect();
    } catch (error) {
      debugError('Failed to connect:', error);
      return false;
    }
    debugLog('Connected!');

    return true;
  }

  public async disconnect(): Promise<void> {
    await this.#consumer.disconnect();
  }

  public async getMessages(): Promise<boolean> {
    try {
      await this.#consumer.subscribe({
        topic: this.#topic,
        fromBeginning: true,
      });

      await this.#consumer.run({
        // eslint-disable-next-line @typescript-eslint/require-await
        eachMessage: async (result) => {
          debugLog(`Received message: ${result.message.value?.toString()}`);
        },
      });

      return true;
    } catch (error) {
      debugError('Failed to send messages:', error);
      return false;
    }
  }
}
