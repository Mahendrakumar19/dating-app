const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional)
    // await User.deleteMany({});

    const sampleUsers = [
      {
        email: 'mahendra.mk174@gmail.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Mahendra',
        lastName: 'Kumar',
        age: 24,
        major: 'Computer Science',
        year: 'Graduate',
        bio: 'Love coding and coffee!',
        interests: ['Programming', 'Coffee', 'Gaming', 'Movies'],
        location: 'SCIS',
        isEmailVerified: true,
        isActive: true
      },
      // {
      //   email: 'jane.smith@university.edu',
      //   password: await bcrypt.hash('password123', 12),
      //   firstName: 'Jane',
      //   lastName: 'Smith',
      //   age: 20,
      //   major: 'Psychology',
      //   year: 'Sophomore',
      //   bio: 'Psychology student who loves art and music',
      //   interests: ['Art', 'Music', 'Psychology', 'Reading'],
      //   location: 'Main Campus',
      //   isEmailVerified: true,
      //   isActive: true
      // }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
