require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const axios = require('axios');
const Registration = require('./Registration');

const app = express();
app.use(express.json());

let channel;
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

async function connectRabbitMQ() {
  const conn = await amqp.connect('amqp://127.0.0.1');
  channel = await conn.createChannel();
  await channel.assertQueue('registration_notifications');
  console.log('RabbitMQ connected');
}
connectRabbitMQ();

// regester user to an event 
app.post('/registrations', async (req, res) => {
  const { userId, eventId } = req.body;
  try {
    const eventRes = await axios.get(`${process.env.EVENT_SERVICE_URL}/events/${eventId}`);
    const event = eventRes.data;

    if (event.capacity <= 0) {
      return res.status(400).json({ message: 'Event is full. ' });
    }

    await Registration.create({ userId, eventId });

    await axios.put(`${process.env.EVENT_SERVICE_URL}/events/${eventId}`, {
      capacity: event.capacity - 1
    });

    channel.sendToQueue('registration_notifications', Buffer.from(JSON.stringify({
      type: 'NEW_REGISTRATION',
      eventId,
      userId
    })));

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// users events
app.get('/registrations/:userId', async (req, res) => {
  const registrations = await Registration.find({ userId: req.params.userId });
  res.json(registrations);
});

// delete registration
app.delete('/registrations/:id', async (req, res) => {
  const reg = await Registration.findByIdAndDelete(req.params.id);
  if (!reg) return res.status(404).send('Event not found in registration');

  channel.sendToQueue('registration_notifications', Buffer.from(JSON.stringify({
    type: 'REGISTRATION_CANCELLED',
    eventId: reg.eventId,
    userId: reg.userId
  })));

  res.send({ message: 'REGISTRATION CANCELLED' });
});

app.listen(process.env.PORT, () => console.log(`Registration-service => port ${process.env.PORT}`));
