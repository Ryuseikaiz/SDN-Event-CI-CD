const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// === STUDENT ROUTES ===
router.get('/register', authenticate, authorize(['student']), eventController.getRegistrationPage);

// === ADMIN ROUTES ===

// [GET] Trang danh sách sự kiện cho admin
router.get('/list-admin', authenticate, authorize(['admin']), eventController.listEventsForAdmin);

// [GET] Trang thêm sự kiện
router.get('/add', authenticate, authorize(['admin']), eventController.getAddEventPage);

// [POST] Xử lý thêm sự kiện
router.post('/add', authenticate, authorize(['admin']), eventController.createEvent);

// [GET] Xem danh sách đăng ký của một sự kiện
router.get('/:eventId/registrations', authenticate, authorize(['admin']), eventController.listRegistrationsForEvent);

module.exports = router;