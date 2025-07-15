const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require("socket.io");

// Import routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const eventRouter = require('./routes/event');
const registrationRouter = require('./routes/registration');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Gắn io và server vào app để có thể truy cập từ nơi khác
app.set('io', io);
app.server = server; // Gắn server vào app

// Connect to MongoDB
mongoose.connect('mongodb+srv://trongducdoan25:Tduc123@ducevent.xowgeoc.mongodb.net/?retryWrites=true&w=majority&appName=DucEvent', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để truyền user vào mọi view
app.use((req, res, next) => {
    // res.locals sẽ được truyền vào tất cả các file EJS
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/auth', authRouter);
app.use('/events', eventRouter);
app.use('/registrations', registrationRouter);
app.use('/', indexRouter);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error', { title: 'Lỗi' });
});

// Chỉ export đối tượng app
module.exports = app;