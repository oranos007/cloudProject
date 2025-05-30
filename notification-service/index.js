require('dotenv').config();
const amqp = require('amqplib');

async function start() {
  const conn = await amqp.connect('amqp://127.0.0.1');
  const channel = await conn.createChannel();

  await channel.assertQueue('event_notifications');
  await channel.assertQueue('registration_notifications');

  console.log('Notification service listening...');

  channel.consume('event_notifications', (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log('[Event Notification]', data);
    channel.ack(msg);
  });

  channel.consume('registration_notifications', (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log('[Registration Notification]', data);
    channel.ack(msg);
  });
}

start().catch(console.error);