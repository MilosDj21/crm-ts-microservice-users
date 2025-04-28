import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";
import UserService from "../services/user";
import AppDataSource from "../data-source";
import User from "../entity/User";
import Role from "../entity/Role";
import { errorHandler } from "../errors/errorHandling";

class KafkaClient {
  private static singleInstance: KafkaClient;
  private kafka;
  private producer;
  private consumer;
  private pendingRequests;

  private constructor() {
    this.kafka = new Kafka({
      clientId: "users",
      brokers: ["kafka-broker:29092"],
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "user-service-group" });
    this.pendingRequests = new Map();
  }

  public static getInstance = async () => {
    if (!this.singleInstance) {
      this.singleInstance = new KafkaClient();
      await this.singleInstance.producer.connect();
      await this.singleInstance.consumer.connect();
    }
    return this.singleInstance;
  };

  public subscribeToAllTopics = async () => {
    const topics = [
      "request-user-by-id",
      "request-user-by-email",
      "request-users",
      "request-create-user",
      "request-update-user",
      "request-remove-user",
    ];
    await Promise.all(
      topics.map((t) =>
        this.consumer.subscribe({
          topic: t,
          fromBeginning: false,
        }),
      ),
    );
    const userService = new UserService();

    // Run the consumer
    this.consumer.run({
      eachMessage: async ({
        topic,
        message,
      }: {
        topic: string;
        message: any;
      }) => {
        if (
          message.headers &&
          message.headers["correlationId"] &&
          message.value
        ) {
          const correlationId = message.headers["correlationId"];

          try {
            const parsed = JSON.parse(message.value.toString());

            let user;
            switch (topic) {
              case topics[0]:
                user = await userService.findById(parsed.data.id);
                this.emitResponse(
                  {
                    data: user,
                    error: null,
                  },
                  topic,
                  correlationId,
                );
                break;

              case topics[1]:
                user = await userService.findByEmail(parsed.data.email);
                this.emitResponse(
                  {
                    data: user,
                    error: null,
                  },
                  topic,
                  correlationId,
                );
                break;

              case topics[2]:
                const userList = await userService.findAll();
                this.emitResponse(
                  {
                    data: userList,
                    error: null,
                  },
                  topic,
                  correlationId,
                );
                break;

              case topics[3]:
                user = await userService.create(parsed.data.userObject);
                this.emitResponse(
                  {
                    data: user,
                    error: null,
                  },
                  topic,
                  correlationId,
                );
                break;

              case topics[4]:
                user = await userService.update(parsed.data.userObject);
                this.emitResponse(
                  {
                    data: user,
                    error: null,
                  },
                  topic,
                  correlationId,
                );
                break;

              case topics[5]:
                user = await userService.removeById(parsed.data.id);
                this.emitResponse(
                  {
                    data: user,
                    error: null,
                  },
                  topic,
                  correlationId,
                );
                break;
            }
          } catch (error) {
            this.emitResponse(
              {
                data: null,
                error: error,
              },
              topic,
              correlationId,
            );
            errorHandler(error);
          }
        }
      },
    });
  };

  private emitResponse = async (
    requestData: any,
    requestTopic: string,
    correlationId: string,
  ) => {
    try {
      requestTopic = requestTopic.replace("request", "response");
      // Send the request with the correlationId header
      await this.producer.send({
        topic: requestTopic,
        messages: [
          {
            value: JSON.stringify(requestData),
            headers: { correlationId },
          },
        ],
      });
    } catch (error) {
      errorHandler(error);
    }
  };

  public disconnect = async () => {
    try {
      await this.consumer.disconnect();
      await this.producer.disconnect();
      console.log("Kafka connections closed gracefully.");
    } catch (err) {
      console.error("Error during Kafka disconnect:", err);
      errorHandler(err);
    }
  };
}

export default KafkaClient;
