import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

let connection = null;
let channel = null;

export const connectRabbitMQ = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();

      // Declarar el exchange para eventos de clientes
      await channel.assertExchange("vetcore.events", "topic", {
        durable: true,
      });

      console.log("RabbitMQ successfully connected");

      // Manejo de errores de conexión
      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
      });

      connection.on("close", () => {
        console.log("RabbitMQ connection closed");
      });

      return { connection, channel };
    } catch (error) {
      console.log(
        `Attempt ${i + 1}/${retries} - Waiting for RabbitMQ connection...`
      );
      if (i === retries - 1) {
        console.error("Error connecting to RabbitMQ:", error.message);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
};

export const publishEvent = async (routingKey, eventData) => {
  try {
    const channel = getChannel();
    const exchange = "vetcore.events";

    const message = Buffer.from(JSON.stringify(eventData));

    const published = channel.publish(exchange, routingKey, message, {
      persistent: true,
      contentType: "application/json",
      timestamp: Date.now(),
    });

    if (published) {
      console.log(`Event published: ${routingKey}`, eventData);
    } else {
      console.warn(`Failed to publish event: ${routingKey}`);
    }

    return published;
  } catch (error) {
    console.error(`Error publishing event ${routingKey}:`, error);
    throw error;
  }
};

export const closeConnection = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("RabbitMQ connection closed gracefully");
  } catch (error) {
    console.error("Error closing RabbitMQ connection:", error);
  }
};
