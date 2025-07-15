const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');

/* GET home page. */
router.get('/', authenticate, function(req, res, next) {
  // Redirect based on role
  if (req.user.role === 'admin') {
    res.redirect('/registrations/list');
  } else {
    res.redirect('/events/register');
  }
});

module.exports = router;