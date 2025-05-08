const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/RegistrationsDB', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

const RegistrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
    registrationDate: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Registration', RegistrationSchema);
