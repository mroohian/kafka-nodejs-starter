import 'reflect-metadata';
import process from 'process';
import { Container } from 'inversify';

import { KafkaAdmin } from './KafkaAdmin';
import { KafkaProducer } from './KafkaProducer';
import { KafkaConsumer } from './KafkaConsumer';

const container = new Container();

container.bind(KafkaAdmin).toSelf();
container.bind(KafkaProducer).toSelf();
container.bind(KafkaConsumer).toSelf();

async function main(): Promise<void> {
  const kafkaAdmin = container.get(KafkaAdmin);

  let success = await kafkaAdmin.connect();
  if (!success) {
    process.exit(1);
  }

  success = await kafkaAdmin.createTopic();
  if (!success) {
    process.exit(1);
  }

  await kafkaAdmin.disconnect();

  const kafkaProducer = container.get(KafkaProducer);

  success = await kafkaProducer.connect();
  if (!success) {
    process.exit(1);
  }

  success = await kafkaProducer.sendMessage('Message from code');
  if (!success) {
    process.exit(1);
  }

  success = await kafkaProducer.sendMessage('Another message from code');
  if (!success) {
    process.exit(1);
  }

  await kafkaProducer.disconnect();

  const kafkaConsumer = container.get(KafkaConsumer);

  success = await kafkaConsumer.connect();
  if (!success) {
    process.exit(1);
  }

  success = await kafkaConsumer.getMessages();
  if (!success) {
    process.exit(1);
  }

  // Wait a bit
  await new Promise((cb) => setTimeout(cb, 10000));

  await kafkaConsumer.disconnect();
}

main().catch(() => {
  process.exit(1);
});
