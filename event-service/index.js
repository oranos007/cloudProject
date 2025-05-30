require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const Event = require('./Event');

const app = express();
app.use(express.json());

let channel;
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

async function connectRabbitMQ() {
  const conn = await amqp.connect('amqp://127.0.0.1');
  channel = await conn.createChannel();
  await channel.assertQueue('event_notifications');
  console.log('RabbitMQ connected');
}
connectRabbitMQ();

// creation d'evenement
app.post('/events', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    channel.sendToQueue('event_notifications', Buffer.from(JSON.stringify({
      type: 'NEW_EVENT',
      event,
    })));
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// afficher tous les evenements
app.get('/events', async (_, res) => {
  const events = await Event.find();
  res.json(events);
});

// afficher un seul evenement
app.get('/events/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).send('Not found');
  res.json(event);
});

// mettre a jour un evenement
app.put('/events/:id', async (req, res) => {
  const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).send('Not found');

  channel.sendToQueue('event_notifications', Buffer.from(JSON.stringify({
    type: 'EVENT_UPDATED',
    event: updated,
  })));
  res.json(updated);
});

app.listen(PORT, () => console.log(`Event-service => port ${PORT}`));
