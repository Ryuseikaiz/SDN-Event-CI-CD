const Event = require("../models/eventModel");
const Registration = require("../models/registrationModel");

// [STUDENT] Hiển thị trang đăng ký sự kiện cho sinh viên
exports.getRegistrationPage = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });

    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const count = await Registration.countDocuments({ eventId: event._id });
        const isRegistered = await Registration.findOne({
          eventId: event._id,
          studentId: req.user.id,
        });

        // So sánh ngày sự kiện với ngày hiện tại
        const isPast = event.date < new Date();

        return {
          ...event.toObject(),
          registeredCount: count,
          isFull: count >= event.capacity,
          isRegistered: !!isRegistered,
          isPast: isPast, // Thêm thuộc tính isPast
        };
      })
    );

    res.render("registerEvent", {
      events: eventsWithCounts,
      title: "Đăng ký sự kiện",
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    res.status(500).render("error", { message: "Lỗi Server", error });
  }
};

// [ADMIN] Hiển thị trang danh sách sự kiện
exports.listEventsForAdmin = async (req, res) => {
  try {
    const { search } = req.query; // Lấy tham số search từ URL
    let filter = {};

    // Nếu có tham số search, tạo bộ lọc tìm kiếm
    if (search) {
      // Tìm kiếm không phân biệt chữ hoa/thường
      filter.name = { $regex: search, $options: "i" };
    }

    const events = await Event.find(filter).sort({ date: -1 });

    res.render("listEventsAdmin", {
      title: "Quản lý Sự kiện",
      events,
      success: req.query.success,
      searchQuery: search || "", // Gửi lại từ khóa tìm kiếm để hiển thị trên view
    });
  } catch (error) {
    res.status(500).render("error", { message: "Lỗi Server", error });
  }
};

// [ADMIN] Hiển thị trang thêm sự kiện mới
exports.getAddEventPage = (req, res) => {
  res.render("addEvent", {
    title: "Thêm sự kiện mới",
    error: null,
  });
};

// [ADMIN] Xử lý việc thêm sự kiện mới
exports.createEvent = async (req, res) => {
  try {
    const { name, description, date, location, capacity } = req.body;
    const newEvent = new Event({ name, description, date, location, capacity });
    await newEvent.save();
    res.redirect("/events/list-admin?success=Thêm+sự+kiện+thành+công");
  } catch (error) {
    res.render("addEvent", {
      title: "Thêm sự kiện mới",
      error: "Đã xảy ra lỗi. Vui lòng thử lại.",
    });
  }
};

// [ADMIN] Hiển thị danh sách đăng ký cho một sự kiện cụ thể
exports.listRegistrationsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .render("error", { message: "Không tìm thấy sự kiện" });
    }

    const registrations = await Registration.find({ eventId: eventId })
      .populate("studentId", "username")
      .sort({ registrationDate: -1 });

    res.render("registrationsForEvent", {
      title: `DS Đăng ký: ${event.name}`,
      event,
      registrations,
    });
  } catch (error) {
    res.status(500).render("error", { message: "Lỗi Server", error });
  }
};
