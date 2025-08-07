// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const User = require('../models/User');
// const router = express.Router();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // Register
// router.post('/register', async (req, res) => {
//   try {
//     const { email, password, firstName, lastName, age, major, year, location } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     const salt = await bcrypt.genSalt(12);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

//     const user = new User({
//       email, password: hashedPassword, firstName, lastName,
//       age, major, year, location, emailVerificationToken: verificationToken
//     });

//     await user.save();

//     const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Verify Your University Dating Account',
//       html: `<h2>Welcome!</h2><p>Click to verify: <a href="${verificationUrl}">Verify</a></p>`
//     });

//     res.status(201).json({ message: 'User created. Check email for verification.' });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || !await bcrypt.compare(password, user.password)) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     if (!user.isEmailVerified) {
//       return res.status(400).json({ error: 'Please verify your email first' });
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     res.json({ token, user: { id: user._id, firstName: user.firstName, email: user.email } });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, age, major, year, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      major,
      year,
      location,
      emailVerificationToken: verificationToken,
      isEmailVerified: false
    });

    await newUser.save();

    // FIX: Point to backend verification endpoint
    const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your University Dating Account',
      html: `
        <h2>Welcome to University Dating!</h2>
        <p>Thank you for registering. Please click the link below to verify your email:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link: ${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `
    });

    res.status(201).json({ message: 'User created. Check email for verification.' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email Verification - Modified to redirect to frontend after verification
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      // Redirect to frontend with error
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-result?status=error&message=Invalid token or user not found`);
    }

    if (user.isEmailVerified) {
      // Redirect to frontend with already verified message
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-result?status=success&message=Email already verified`);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    // Redirect to frontend with success message
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-result?status=success&message=Email verified successfully`);
  } catch (err) {
    console.error('Verification error:', err);
    // Redirect to frontend with error
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-result?status=error&message=Invalid or expired token`);
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email first.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
