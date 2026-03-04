const Appointment = require('../models/Appointment');

const generateAppointmentId = async () => {
    const currentYear = new Date().getFullYear();
    const prefix = `AMAN/HC/${currentYear}/`;

    // Find the latest appointment ID for the current year
    const lastAppointment = await Appointment.findOne({
        appointmentId: { $regex: `^${prefix}` }
    }).sort({ appointmentId: -1 });

    let nextSerial = 1;

    if (lastAppointment && lastAppointment.appointmentId) {
        // Extract the numerical part
        const parts = lastAppointment.appointmentId.split('/');
        const lastSerial = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSerial)) {
            nextSerial = lastSerial + 1;
        }
    }

    // Pad with 3 digits
    const paddedSerial = String(nextSerial).padStart(3, '0');
    return `${prefix}${paddedSerial}`;
};

module.exports = generateAppointmentId;
