const cron = require('node-cron');
const sendEmail = require('./emailService');
const HospitalBooking = require('../models/HospitalBooking');

const scheduleReminders = () => {
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log('Running daily reminder jobs for MaaCare...');

            // Fetch upcoming appointments (1 day from now)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
            const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

            const upcomingBookings = await HospitalBooking.find({
                preferredDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
                status: 'Approved'
            }).populate('hospitalId', 'hospitalName');

            // Send Reminders
            for (let booking of upcomingBookings) {
                if (booking.patientEmail) {
                    await sendEmail({
                        email: booking.patientEmail,
                        subject: 'Reminder: Scheduled Hospital Visit Tomorrow',
                        message: `Friendly reminder that you have a confirmed appointment tomorrow at ${booking.hospitalId.hospitalName} for ${booking.serviceSelected}.`
                    });
                }
            }

            console.log(`Sent ${upcomingBookings.length} appointment reminders.`);
        } catch (error) {
            console.error('Error in reminder scheduler:', error);
        }
    });
};

module.exports = { scheduleReminders };
