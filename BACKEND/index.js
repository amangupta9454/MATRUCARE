require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { startScheduler } = require('./utils/notificationScheduler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const pregnancyRoutes = require('./routes/pregnancyRoutes');
const reportRoutes = require('./routes/reportRoutes');
const healthRoutes = require('./routes/healthRoutes');
const ashaRoutes = require('./routes/ashaRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const babyRoutes = require('./routes/babyRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const teleConsultRoutes = require('./routes/teleConsultRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const forumRoutes = require('./routes/forumRoutes');

// --- Module 7 Routes ---
const dietRoutes = require('./routes/dietRoutes');
const chatRoutes = require('./routes/chatRoutes');
const quizRoutes = require('./routes/quizRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// --- Module 8 Routes ---
const hospitalRoutes = require('./routes/hospitalRoutes');
const hospitalBookingRoutes = require('./routes/hospitalBookingRoutes');
const healthRecordRoutes = require('./routes/healthRecordRoutes');
const mentorRoutes = require('./routes/mentorRoutes');

// --- New Features (Insurance, Passport, Navigation, SOS) ---
const insuranceRoutes = require('./routes/insuranceRoutes');
const healthPassportRoutes = require('./routes/healthPassportRoutes');
const navigationRoutes = require('./routes/navigationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Start daily notification scheduler (graceful — skips if node-cron not installed)
startScheduler();

// Start Module 8 reminder scheduler
require('./utils/reminderScheduler').scheduleReminders();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// Socket.io Setup
const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});
app.set('io', io);
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected', socket.id));
});

// Routes — Modules 1–3
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/pregnancy', pregnancyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/health', healthRoutes);
// Module 4
app.use('/api/asha', ashaRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/analytics', analyticsRoutes);
// Module 5
app.use('/api/baby', babyRoutes);
app.use('/api/baby-vaccines', vaccinationRoutes);
app.use('/api/teleconsult', teleConsultRoutes);
app.use('/api/insights', insightsRoutes);
// Module 6 — Rating, Recommendations, Forum
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/forum', forumRoutes);
// Module 7 — Nutrition, Chat, Quiz, Feedback
app.use('/api/diet', dietRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/feedback', feedbackRoutes);

// Module 8 — Hospital Integration & Advanced Services
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/hospital-bookings', hospitalBookingRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/mentors', mentorRoutes);

// New Features (Insurance, Passport, Navigation, SOS)
app.use('/api/insurance', insuranceRoutes);
app.use('/api/health-passport', healthPassportRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health Check
app.get('/', (req, res) => res.send('MaaCare API is running'));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
