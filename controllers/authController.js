const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.getLoginPage = (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/');
    }
    res.render('login', { error: null, title: 'Đăng nhập' });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).render('login', { error: 'Tên đăng nhập hoặc mật khẩu không đúng.', title: 'Đăng nhập' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
             return res.status(401).render('login', { error: 'Tên đăng nhập hoặc mật khẩu không đúng.', title: 'Đăng nhập' });
        }

        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, 'SECRET_KEY', { expiresIn: '1d' });
        
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/');
    } catch (error) {
        res.status(500).render('login', { error: 'Đã xảy ra lỗi server.', title: 'Đăng nhập' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
};