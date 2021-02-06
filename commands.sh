kafka-topics.sh --bootstrap-server kafka:9092 --list

kafka-console-producer.sh --bootstrap-server kafka-1:9092 --topic gui-logs 

kafka-console-consumer.sh --bootstrap-server kafka-1:9092 --topic gui-logs --from-beginning 
