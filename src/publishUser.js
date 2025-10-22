import amqp from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

async function publishUser() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  const queue = 'usuario_registrado';
  await channel.assertQueue(queue, { durable: true });

  const user = { email: 'prueba3@gmail.com', name: 'Gaby' };
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(user)));
  console.log('Mensaje enviado a la cola:', user);

  setTimeout(() => connection.close(), 500);
}

publishUser();
