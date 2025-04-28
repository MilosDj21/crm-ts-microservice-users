import "reflect-metadata";
import "dotenv/config";
import AppDataSource from "./data-source";
import KafkaClient from "./kafka/KafkaClient";

const init = async () => {
  //db connection and connecting kafka client
  try {
    await AppDataSource.initialize();
    console.log("Connected to the database");
    const kafkaClient = await KafkaClient.getInstance();
    await kafkaClient.subscribeToAllTopics();
    console.log("Kafka connected and subscribed");
  } catch (error) {
    console.log(error);
  }
};

init();
