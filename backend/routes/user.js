const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for image upload
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'university-dating',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }]
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get potential matches
router.get('/potential-matches', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const excludeIds = [currentUser._id, ...currentUser.likes, ...currentUser.dislikes];

    const matches = await User.find({
      _id: { $nin: excludeIds },
      isActive: true,
      isEmailVerified: true
    }).select('firstName lastName age major year bio interests photos').limit(10);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/Dislike user
router.post('/action', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    const currentUserId = req.user._id;

    if (action === 'like') {
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { likes: targetUserId } });
      const targetUser = await User.findById(targetUserId);
      if (targetUser.likes.includes(currentUserId)) {
        await User.findByIdAndUpdate(currentUserId, { $addToSet: { matches: { userId: targetUserId } } });
        await User.findByIdAndUpdate(targetUserId, { $addToSet: { matches: { userId: currentUserId } } });
        return res.json({ match: true, message: 'It\'s a match!' });
      }
    } else {
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { dislikes: targetUserId } });
    }
    res.json({ match: false });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken')
      .populate('matches.userId', 'firstName lastName photos');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'interests', 'major', 'year', 'location', 'age'];
    const filteredUpdates = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Handle interests array
    if (updates.interests) {
      filteredUpdates.interests = Array.isArray(updates.interests) 
        ? updates.interests 
        : updates.interests.split(',').map(item => item.trim());
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken');

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload profile photos
router.post('/profile/photos', authMiddleware, upload.array('photos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }

    const user = await User.findById(req.user._id);
    
    // Add new photos
    const newPhotos = req.files.map((file, index) => ({
      url: file.path,
      isMain: user.photos.length === 0 && index === 0 // First photo becomes main if no photos exist
    }));

    user.photos = [...user.photos, ...newPhotos];
    await user.save();

    res.json({ 
      message: 'Photos uploaded successfully',
      photos: user.photos 
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Photo upload failed' });
  }
});

// Delete profile photo
router.delete('/profile/photos/:photoIndex', authMiddleware, async (req, res) => {
  try {
    const photoIndex = parseInt(req.params.photoIndex);
    const user = await User.findById(req.user._id);

    if (!user.photos[photoIndex]) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete from Cloudinary
    const photoUrl = user.photos[photoIndex].url;
    const publicId = photoUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`university-dating/${publicId}`);

    // Remove from user photos
    user.photos.splice(photoIndex, 1);
    
    // If deleted photo was main, make first photo main
    if (user.photos.length > 0 && !user.photos.some(p => p.isMain)) {
      user.photos[0].isMain = true;
    }

    await user.save();
    res.json({ message: 'Photo deleted successfully', photos: user.photos });
  } catch (error) {
    console.error('Photo delete error:', error);
    res.status(500).json({ error: 'Photo deletion failed' });
  }
});

// Set main profile photo
router.put('/profile/photos/:photoIndex/main', authMiddleware, async (req, res) => {
  try {
    const photoIndex = parseInt(req.params.photoIndex);
    const user = await User.findById(req.user._id);

    if (!user.photos[photoIndex]) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Reset all photos to not main
    user.photos.forEach(photo => photo.isMain = false);
    // Set selected photo as main
    user.photos[photoIndex].isMain = true;

    await user.save();
    res.json({ message: 'Main photo updated', photos: user.photos });
  } catch (error) {
    console.error('Main photo update error:', error);
    res.status(500).json({ error: 'Failed to update main photo' });
  }
});

// Get user matches
router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'matches.userId',
        select: 'firstName lastName photos bio major year lastActive'
      });
    
    res.json(user.matches || []);
  } catch (error) {
    console.error('Matches fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Block user
router.post('/block', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blocked: userId },
      $pull: { 
        likes: userId,
        matches: { userId: userId }
      }
    });

    // Remove match from other user too
    await User.findByIdAndUpdate(userId, {
      $pull: { matches: { userId: req.user._id } }
    });

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
