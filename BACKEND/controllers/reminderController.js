const HospitalBooking = require('../models/HospitalBooking');

exports.getUserReminders = async (req, res) => {
    try {
        const patientId = req.user.id;

        const upcomingBookings = await HospitalBooking.find({
            patientId,
            preferredDate: { $gte: new Date() },
            status: 'Approved'
        }).populate('hospitalId', 'hospitalName');

        const reminders = upcomingBookings.map(b => ({
            id: b._id,
            type: 'Doctor Visit',
            message: `Appointment with ${b.hospitalId.hospitalName} for ${b.serviceSelected}`,
            time: new Date(b.preferredDate).toLocaleString()
        }));

        res.status(200).json({ success: true, reminders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
