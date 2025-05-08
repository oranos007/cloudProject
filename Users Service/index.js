const express = require('express');
const app = express();
const User = require('./UsersDb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const cors = require('cors');
const port = 7000;


app.use(cors());

app.use(express.json());



app.post('/users/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role: 'user'
    });

    const savedUser = await newUser.save();
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, role: savedUser.role },
      'RANDOM_TOKEN_SECRET',
      { expiresIn: '2h' }
    );

    res.status(201).json({ token });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
  
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

   
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});




app.post('/users/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body); 
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'RANDOM_TOKEN_SECRET',
      { expiresIn: '2h' }
    );

    console.log('Login successful for:', email);
    res.json({ token });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


async function setupQueue(queueName) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);
    
    channel.consume(queueName, (msg) => {
        console.log(`Received message from ${queueName}:`, msg.content.toString());
        channel.ack(msg);
    });
}


app.get('/newEvent', async (req, res) => {
    await setupQueue('NEW_EVENTS');
    res.status(200).json({ message: "Listening for new events" });
});

app.get('/event_supprimes', async (req, res) => {
    await setupQueue('UPDATED_EVENTS');
    res.status(200).json({ message: "Listening for event updates" });
});


app.get('/inscriptionAnnule', async (req, res) => {
    await setupQueue('CANCELLED_REGISTRATIONS');
    res.status(200).json({ message: "Listening for cancelled registrations" });
});

app.listen(port, () => console.log(`Users service running on port ${port}`));
