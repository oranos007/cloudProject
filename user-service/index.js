require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const User = require('./User');

const app = express();
app.use(express.json());

let channel;
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

async function connectRabbitMQ() {
  const conn = await amqp.connect('amqp://127.0.0.1');
  channel = await conn.createChannel();
  await channel.assertQueue('event_notifications');
  await channel.assertQueue('registration_notifications');

  channel.consume('event_notifications', (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log('[EVENT MSG]', data);
    channel.ack(msg);
  });

  channel.consume('registration_notifications', (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log('[REGISTRATION MSG]', data);
    channel.ack(msg);
  });

  console.log('RabbitMQ connected & listening');
}
connectRabbitMQ();

// register
app.post('/users/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).send('Email already used');
  
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ firstName, lastName, email, passwordHash });
  res.status(201).json({ userId: user._id });
});

// Login
app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).send('User not found!!');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).send('Invalid password!');

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// user infos
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).send(' not found');
  res.json(user);
});

app.listen(process.env.PORT, () => console.log(`user-service => port ${process.env.PORT}`));
