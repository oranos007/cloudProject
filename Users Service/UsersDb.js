const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/UsersDB', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    passwordHash: String,
    Role: String
}, { versionKey: false }); 

module.exports = mongoose.model('User', UserSchema);