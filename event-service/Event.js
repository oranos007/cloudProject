const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  date: Date,
  location: String,
  capacity: { type: Number, required: true },
});

module.exports = mongoose.model('Event', eventSchema);