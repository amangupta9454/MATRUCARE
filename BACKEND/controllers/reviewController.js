const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const sendEmail = require('../config/nodemailer');

// ── Helper: compute average rating for a doctor ───────────────────────────────
const getReviewStats = async (doctorId) => {
    const agg = await Review.aggregate([
        { $match: { doctor: doctorId } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    return agg[0] ? { avgRating: +agg[0].avg.toFixed(1), reviewCount: agg[0].count } : { avgRating: 0, reviewCount: 0 };
};

// ── POST /api/reviews  (Mother only) ─────────────────────────────────────────
exports.submitReview = async (req, res) => {
    try {
        const { doctorId, appointmentId, rating, reviewText } = req.body;

        // Verify the appointment belongs to this patient
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.mother.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'This appointment does not belong to you' });
        if (appointment.doctor.toString() !== doctorId)
            return res.status(400).json({ message: 'Doctor mismatch with appointment' });

        // Check appointment is completed or approved
        if (!['Approved', 'Completed'].includes(appointment.status))
            return res.status(400).json({ message: 'You can only review doctors after an approved or completed appointment' });

        // Check for duplicate review
        const existing = await Review.findOne({ doctor: doctorId, appointment: appointmentId });
        if (existing) return res.status(409).json({ message: 'You have already reviewed this appointment' });

        const review = await Review.create({
            doctor: doctorId,
            patient: req.user._id,
            appointment: appointmentId,
            rating,
            reviewText,
        });

        // Email doctor
        const doctor = await Doctor.findById(doctorId).populate('user', 'name email');
        if (doctor?.user?.email) {
            const isLowRating = rating <= 2;
            await sendEmail({
                to: doctor.user.email,
                subject: isLowRating
                    ? `⚠️ MaaCare — Low Rating Alert (${rating}⭐) from a Patient`
                    : `⭐ MaaCare — New ${rating}-Star Review Received`,
                html: `<div style="font-family:Arial,sans-serif;padding:20px;border-left:4px solid ${isLowRating ? '#dc2626' : '#f59e0b'};">
                  <h2 style="color:${isLowRating ? '#dc2626' : '#f59e0b'};">${isLowRating ? '⚠️ Low Rating Alert' : '⭐ New Review'}</h2>
                  <p>Dear Dr. <strong>${doctor.user.name}</strong>,</p>
                  <p>Patient <strong>${req.user.name}</strong> gave you a <strong>${rating}/5</strong> rating.</p>
                  ${reviewText ? `<blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555;">"${reviewText}"</blockquote>` : ''}
                  <p>Log in to MaaCare to view all your reviews.</p>
                </div>`,
            });
        }

        res.status(201).json(review);
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Duplicate review for this appointment' });
        console.error(err);
        res.status(500).json({ message: 'Error submitting review' });
    }
};

// ── GET /api/reviews/:doctorId  (public) ─────────────────────────────────────
exports.getReviewsForDoctor = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [reviews, stats] = await Promise.all([
            Review.find({ doctor: req.params.doctorId })
                .populate('patient', 'name profileImage')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            getReviewStats(new (require('mongoose').Types.ObjectId)(req.params.doctorId)),
        ]);

        res.json({ reviews, ...stats, page, limit });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};

// ── DELETE /api/reviews/:id  (Admin only) ────────────────────────────────────
exports.deleteReview = async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting review' });
    }
};

module.exports.getReviewStats = getReviewStats;
