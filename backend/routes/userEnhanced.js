const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { cloudinary, upload } = require('../utils/cloudinaryConfig');
const { calculateCompatibilityScore } = require('../utils/matchingAlgorithm');
const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken')
      .populate('matches.userId', 'firstName lastName photos lastActive');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload photos
router.post('/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'university-dating' },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Upload failed' });
        }

        const user = await User.findById(req.user._id);
        const isFirstPhoto = user.photos.length === 0;

        user.photos.push({
          url: result.secure_url,
          isMain: isFirstPhoto
        });

        await user.save();
        res.json({ url: result.secure_url, message: 'Photo uploaded successfully!' });
      }
    );

    req.file.stream.pipe(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Smart matching with algorithm
router.get('/smart-matches', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const excludeIds = [
      currentUser._id,
      ...currentUser.likes,
      ...currentUser.dislikes,
      ...currentUser.matches.map(m => m.userId),
      ...currentUser.blocked
    ];

    const potentialMatches = await User.find({
      _id: { $nin: excludeIds },
      isActive: true,
      isEmailVerified: true
    }).select('firstName lastName age major year bio interests photos location lastActive');

    // Calculate compatibility scores
    const matchesWithScores = potentialMatches.map(match => ({
      ...match.toObject(),
      compatibilityScore: calculateCompatibilityScore(currentUser, match)
    }));

    // Sort by compatibility score
    matchesWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json(matchesWithScores.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
