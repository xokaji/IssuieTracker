const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// GET /api/users - Get all users (for assignee dropdown)
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}, 'name email').sort({ name: 1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
