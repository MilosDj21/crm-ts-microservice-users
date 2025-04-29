import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";

import UserService from "../services/userService";
import RoleService from "../services/roleService";
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
    const userTopics = [
      "request-user-by-id",
      "request-user-by-email",
      "request-users",
      "request-create-user",
      "request-update-user",
      "request-remove-user",
    ];
    const roleTopics = [
      "request-role-by-id",
      "request-roles-by-user-id",
      "request-roles",
      "request-create-role",
      "request-update-role",
      "request-remove-role",
    ];
    const allTopics = [...userTopics, ...roleTopics];
    await Promise.all(
      allTopics.map((t) =>
        this.consumer.subscribe({
          topic: t,
          fromBeginning: false,
        }),
      ),
    );

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

            if (userTopics.includes(topic)) {
              await this.handleUserTopics(
                topic,
                userTopics,
                parsed,
                correlationId,
              );
            } else if (roleTopics.includes(topic)) {
              await this.handleRoleTopics(
                topic,
                roleTopics,
                parsed,
                correlationId,
              );
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

  private handleUserTopics = async (
    topic: string,
    topics: string[],
    parsed: any,
    correlationId: string,
  ) => {
    let user;
    const userService = new UserService();

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
  };

  private handleRoleTopics = async (
    topic: string,
    topics: string[],
    parsed: any,
    correlationId: string,
  ) => {
    let role;
    const roleService = new RoleService();

    switch (topic) {
      case topics[0]:
        role = await roleService.findById(parsed.data.id);
        this.emitResponse(
          {
            data: role,
            error: null,
          },
          topic,
          correlationId,
        );
        break;

      //TODO: vidi kako da ovo implementiras, i da li uopste treba da se nadju role po user id
      //case topics[1]:
      //  role = await roleService.findByUserId(parsed.data.id);
      //  this.emitResponse(
      //    {
      //      data: role,
      //      error: null,
      //    },
      //    topic,
      //    correlationId,
      //  );
      //  break;

      case topics[2]:
        const roleList = await roleService.findAll();
        this.emitResponse(
          {
            data: roleList,
            error: null,
          },
          topic,
          correlationId,
        );
        break;

      case topics[3]:
        role = await roleService.create(parsed.data.name);
        this.emitResponse(
          {
            data: role,
            error: null,
          },
          topic,
          correlationId,
        );
        break;

      case topics[4]:
        role = await roleService.update(parsed.data.id, parsed.data.name);
        this.emitResponse(
          {
            data: role,
            error: null,
          },
          topic,
          correlationId,
        );
        break;

      case topics[5]:
        role = await roleService.removeById(parsed.data.id);
        this.emitResponse(
          {
            data: role,
            error: null,
          },
          topic,
          correlationId,
        );
        break;
    }
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
