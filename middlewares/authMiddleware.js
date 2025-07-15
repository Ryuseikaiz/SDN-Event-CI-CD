const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');
        req.user = decoded;
        res.locals.user = decoded; // Để các file EJS có thể truy cập
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.status(401).redirect('/auth/login');
    }
};

exports.authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).render('error', {
                message: '403 Forbidden',
                error: { status: 'Bạn không có quyền truy cập trang này.' },
                title: 'Lỗi Phân quyền',
                user: req.user
            });
        }
        next();
    };
};