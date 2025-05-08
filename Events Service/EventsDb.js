const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/EventsDB');

const EventSchema = mongoose.Schema({
    name: { type: String, unique: true },
    description: String,
    date: Date,
    location: String,
    capacity: { type: Number, required: true },
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }
  }, { versionKey: false });

module.exports = mongoose.model('Event', EventSchema);