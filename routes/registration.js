const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/register', authenticate, authorize(['student']), registrationController.registerForEvent);
router.get('/list', authenticate, authorize(['admin']), registrationController.listRegistrations);
router.get('/my-registrations', authenticate, authorize(['student']), registrationController.getMyRegistrations);
router.post('/cancel/:registrationId', authenticate, authorize(['student']), registrationController.cancelRegistration);
router.get('/search', authenticate, authorize(['admin']), registrationController.getSearchPage);
router.post('/search', authenticate, authorize(['admin']), registrationController.searchRegistrations);

module.exports = router;