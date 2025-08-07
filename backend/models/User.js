const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    // lowercase: true, // 
    match: [/^[a-zA-Z0-9]+@uohyd\.ac\.in$/, 'Must be a valid @uohyd.ac.in email']
    // match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Must be a valid gmail']
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 35
  },
  major: {
    type: String,
    required: true
  },
  year: {
    type: String,
    enum: ['Integrated', 'PG 1st', 'PG 2nd', 'Graduate', 'PhD'],
    required: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  interests: [String],
  photos: [{ url: String, isMain: Boolean }],
  location: String,
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  isActive: { type: Boolean, default: true },
  matches: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, matchedAt: { type: Date, default: Date.now } }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
