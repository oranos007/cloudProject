const express = require('express');
const app = express();
const Event = require('./EventsDb');
const amqp = require('amqplib');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = 8000;

app.use(cors());
app.use(express.json());



const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).send("Access denied");

    jwt.verify(token, 'RANDOM_TOKEN_SECRET', (err, decoded) => {
        if (err) return res.status(401).send("Invalid token");
        req.userData = decoded;
        next();
    });
};

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('NEW_EVENTS');
    await channel.assertQueue('UPDATED_EVENTS');
    await channel.assertQueue('DELETED_EVENTS');
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    channel = null; // fallback: disable messaging
  }
};

connectRabbitMQ();




app.post('/events', authenticateJWT, async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            userId: req.userData.userId
        };
        
        const newEvent = new Event(eventData);
        await newEvent.save();
        
        channel.sendToQueue('NEW_EVENTS', Buffer.from(JSON.stringify(newEvent)));
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



app.get('/events', async (req, res) => {
    try {
        const events = await Event.find().populate('userId', 'firstName lastName email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get('/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('userId', 'firstName lastName');
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get('/events/user/:userId', async (req, res) => {
    try {
      const events = await Event.find({ userId: req.params.userId });
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/events/:id', authenticateJWT, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        
        
        if (req.body.capacity !== undefined) {
            event.capacity = req.body.capacity;
            await event.save();
        }

        if (event.userId.toString() !== req.userData.userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        channel.sendToQueue('UPDATED_EVENTS', Buffer.from(JSON.stringify(updatedEvent)));
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/events/:id', authenticateJWT, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        
        if (event.userId.toString() !== req.userData.userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Event.findByIdAndDelete(req.params.id);
        channel.sendToQueue('DELETED_EVENTS', Buffer.from(JSON.stringify({ id: req.params.id })));
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => console.log(`Events service running on port ${port}`));
