import express from 'express';
import Subscriber from '../models/subscriberModel.js';

const router = express.Router();

// POST /api/subscribers - Create or update subscriber
router.post('/', async (req, res) => {
  try {
    const { email, consent } = req.body;

    // Validation
    if (!email || !consent) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and consent are required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Upsert: Update existing or create new
    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        email: email.toLowerCase(),
        consent,
        active: true,
        source: 'footer',
        $setOnInsert: { subscribedAt: new Date() } // Only set on new docs
      },
      { upsert: true, new: true }
    );

    // Check if it was newly created
    const wasCreated = !subscriber.updatedAt || 
                       subscriber.createdAt.getTime() === subscriber.updatedAt.getTime();

    res.status(wasCreated ? 201 : 200).json({
      success: true,
      message: wasCreated 
        ? 'Successfully subscribed to newsletter!' 
        : 'You are already subscribed!',
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while processing subscription' 
    });
  }
});

// GET /api/subscribers - Get all subscribers
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;