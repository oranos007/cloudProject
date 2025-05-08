const express = require('express');
const app = express();
const Registration = require('./RegistrationsDb');
const auth = require('./middleware/Authentification');
const axios = require('axios');
const amqp = require('amqplib');
const cors = require('cors');
const port = 9000;

app.use(cors());
app.use(express.json());

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(config => {
  const token = config.headers.Authorization?.split(' ')[1] || '';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

app.post('/registrations', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
   
    const eventResponse = await axiosInstance.get(`http://localhost:8000/events/${eventId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    const existingRegistration = await Registration.findOne({
      userId: req.userData.userId,
      eventId
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        error: "You are already registered for this event" 
      });
    }
    const currentCapacity = eventResponse.data.capacity;

    if (currentCapacity <= 0) {
      return res.status(400).json({ message: "Event full - cannot register" });
    }

   
    const newRegistration = new Registration({
      userId: req.userData.userId,
      eventId
    });
    await newRegistration.save();

   
    await axiosInstance.put(`http://localhost:8000/events/${eventId}`, {
      capacity: currentCapacity - 1
    }, {
      headers: { Authorization: req.headers.authorization }
    });

    
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    channel.sendToQueue('NEW_REGISTRATIONS', Buffer.from(JSON.stringify(newRegistration)));

    res.status(201).json(newRegistration);
  } catch (error) {
    console.error('Registration error:', error);
    
  
    if (newRegistration?._id) {
      await Registration.findByIdAndDelete(newRegistration._id);
    }

    res.status(400).json({
      error: error.response?.data?.message || 
            error.message || 
            'Registration failed'
    });
  }
});

app.get('/registrations', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.userData.userId });
  
    const registrationsWithEvents = await Promise.all(
      registrations.map(async (reg) => {
        const eventResponse = await axiosInstance.get(`http://localhost:8000/events/${reg.eventId}`);
        return {
          ...reg.toObject(),
          eventId: eventResponse.data 
        };
      })
    );

    res.json(registrationsWithEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/registrations/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ message: "Registration not found" });

    
    const event = await axiosInstance.get(`http://localhost:8000/events/${registration.eventId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    await axiosInstance.put(`http://localhost:8000/events/${registration.eventId}`, {
      capacity: event.data.capacity + 1
    }, {
      headers: { Authorization: req.headers.authorization }
    });


    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    channel.sendToQueue('CANCELLED_REGISTRATIONS', Buffer.from(JSON.stringify(registration)));

    res.json({ message: "Registration cancelled successfully" });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ 
      error: error.response?.data?.message || 
            error.message || 
            'Cancellation failed' 
    });
  }
});

app.listen(port, () => console.log(`Registrations service running on port ${port}`));
