const HospitalBooking = require('../models/HospitalBooking');
const sendEmail = require('../utils/emailService');
const Hospital = require('../models/Hospital');

exports.createBooking = async (req, res) => {
    try {
        const { hospitalId, serviceId, doctorId, patientName, patientEmail, mobileNumber, serviceSelected, preferredDate, notes, insurancePolicyId, estimatedCost } = req.body;
        const patientId = req.user ? req.user.id : null;

        const booking = new HospitalBooking({
            patientId, hospitalId, serviceId, doctorId, patientName, patientEmail, mobileNumber, serviceSelected, preferredDate, notes, insurancePolicyId, estimatedCost
        });
        await booking.save();

        const hospital = await Hospital.findById(hospitalId);

        // Notify patient
        if (patientEmail && hospital) {
            let emailMessage = `Dear ${patientName}, your booking for ${serviceSelected} at ${hospital.hospitalName} on ${new Date(preferredDate).toLocaleDateString()} is received and pending approval.`;

            if (insurancePolicyId) {
                emailMessage += `\n\nInsurance Details attached. Estimated Patient Cost: ₹${estimatedCost || 0}. Final verification will be done at the hospital.`;
            }

            await sendEmail({
                email: patientEmail,
                subject: 'Hospital Booking Confirmation - MaaCare',
                message: emailMessage
            });
        }

        res.status(201).json({ success: true, message: 'Booking created successfully', booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getHospitalBookings = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        const bookings = await HospitalBooking.find({ hospitalId }).populate('serviceId');
        res.status(200).json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await HospitalBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = status;
        await booking.save();

        let message = `Your booking status for ${booking.serviceSelected} has been updated to: ${status}.`;
        if (status === 'Approved') message = `Your booking for ${booking.serviceSelected} has been APPROVED!`;

        if (booking.patientEmail) {
            await sendEmail({
                email: booking.patientEmail,
                subject: `Booking Status Update: ${status}`,
                message
            });
        }

        res.status(200).json({ success: true, message: 'Booking status updated', booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const patientId = req.user.id; // user auth middleware required
        const bookings = await HospitalBooking.find({ patientId }).populate('hospitalId', 'hospitalName logo').populate('serviceId', 'serviceName');
        res.status(200).json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
