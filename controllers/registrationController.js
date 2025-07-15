const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');

exports.registerForEvent = async (req, res) => {
    const { eventId } = req.body;
    const studentId = req.user.id;

    try {
        const event = await Event.findById(eventId);
        if (!event) return res.redirect('/events/register?error=Sự+kiện+không+tồn+tại');

        // KIỂM TRA MỚI: Nếu sự kiện đã qua, không cho đăng ký
        if (event.date < new Date()) {
            return res.redirect('/events/register?error=Sự+kiện+này+đã+kết+thúc');
        }

        const count = await Registration.countDocuments({ eventId });
        if (count >= event.capacity) return res.redirect('/events/register?error=Sự+kiện+đã+đầy');
        
        const existingRegistration = await Registration.findOne({ studentId, eventId });
        if (existingRegistration) return res.redirect('/events/register?error=Bạn+đã+đăng+ký+sự+kiện+này');

        const registration = new Registration({ studentId, eventId });
        await registration.save();
        
        const io = req.app.get('io');
        io.emit('newRegistration', { 
            studentUsername: req.user.username, 
            eventName: event.name,
            date: new Date().toLocaleString('vi-VN')
        });
        
        res.redirect('/events/register?success=Đăng+ký+thành+công');

    } catch (error) {
        res.redirect('/events/register?error=Lỗi+server');
    }
};

exports.listRegistrations = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    
    try {
        const registrations = await Registration.find()
            .populate('studentId', 'username')
            .populate('eventId', 'name')
            .sort({ registrationDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Registration.countDocuments();
        
        res.render('listRegistrations', {
            title: 'Danh sách đăng ký',
            registrations,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).render('error', { message: 'Lỗi Server', error });
    }
};

exports.getMyRegistrations = async (req, res) => {
     try {
        const registrations = await Registration.find({ studentId: req.user.id })
            .populate('eventId').sort({ registrationDate: -1 });

        res.render('cancelRegistrations', {
            title: 'Sự kiện của tôi',
            registrations,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        res.status(500).render('error', { message: 'Lỗi Server', error });
    }
};

exports.cancelRegistration = async (req, res) => {
    const { registrationId } = req.params;
    try {
        const registration = await Registration.findOneAndDelete({ _id: registrationId, studentId: req.user.id });
        if (!registration) return res.redirect('/registrations/my-registrations?error=Không+tìm+thấy+đăng+ký');
        
        res.redirect('/registrations/my-registrations?success=Hủy+đăng+ký+thành+công');
    } catch(error) {
        res.redirect('/registrations/my-registrations?error=Lỗi+server');
    }
};

exports.getSearchPage = (req, res) => {
    res.render('searchRegistrations', {
        title: 'Tìm kiếm đăng ký',
        registrations: null,
    });
};

exports.searchRegistrations = async (req, res) => {
    const { startDate, endDate } = req.body;
    let registrations = [];
    try {
        if (startDate && endDate) {
             registrations = await Registration.find({
                registrationDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            }).populate('studentId', 'username').populate('eventId', 'name').sort({ registrationDate: -1 });
        }
        res.render('searchRegistrations', {
            title: 'Kết quả tìm kiếm',
            registrations,
        });
    } catch (error) {
        res.status(500).render('error', { message: 'Lỗi Server', error });
    }
};