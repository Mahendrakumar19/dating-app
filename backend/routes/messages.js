const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get conversation between two users
router.get('/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user._id;

    // Verify that users are matched
    const currentUser = await User.findById(currentUserId);
    const isMatched = currentUser.matches.some(match => 
      match.userId.toString() === otherUserId
    );

    if (!isMatched) {
      return res.status(403).json({ error: 'You can only message matched users' });
    }

    // Get messages between these two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ],
      isDeleted: false
    })
    .populate('sender', 'firstName lastName photos')
    .populate('receiver', 'firstName lastName photos')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { 
        sender: otherUserId, 
        receiver: currentUserId, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    if (!content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify that users are matched
    const sender = await User.findById(senderId);
    const isMatched = sender.matches.some(match => 
      match.userId.toString() === receiverId
    );

    if (!isMatched) {
      return res.status(403).json({ error: 'You can only message matched users' });
    }

    // Create new message
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      messageType
    });

    await newMessage.save();

    // Populate sender and receiver info
    await newMessage.populate('sender', 'firstName lastName photos');
    await newMessage.populate('receiver', 'firstName lastName photos');

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all conversations for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get all conversations (latest message from each conversation)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ],
          isDeleted: false
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', currentUserId] },
              then: '$receiver',
              else: '$sender'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUserInfo'
        }
      },
      {
        $unwind: '$otherUserInfo'
      },
      {
        $project: {
          otherUser: '$otherUserInfo',
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark message as read
router.put('/:messageId/read', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findOneAndUpdate(
      { 
        _id: messageId, 
        receiver: currentUserId, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found or already read' });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a message
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findOneAndUpdate(
      { 
        _id: messageId, 
        sender: currentUserId 
      },
      { 
        isDeleted: true 
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
