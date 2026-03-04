const sendEmail = require('../utils/emailService');
const Hospital = require('../models/Hospital');
const EmergencyEvent = require('../models/EmergencyEvent');
const EmergencyContact = require('../models/EmergencyContact');

exports.triggerEmergencyAlert = async (req, res) => {
    try {
        const { patientName, location, pregnancyWeek, riskLevel, contactEmail } = req.body;

        // Find verified hospitals
        const hospitals = await Hospital.find({ isVerified: true }).select('email hospitalName');
        const emails = hospitals.map(h => h.email);

        const alertMessage = `
            <div style="color:red; font-family: sans-serif;">
                <h2>EMERGENCY ALERT: IMMEDIATE ATTENTION REQUIRED 🚑</h2>
                <p><strong>Patient Name:</strong> ${patientName || 'Unknown'}</p>
                <p><strong>Location:</strong> ${location || 'Unknown'}</p>
                <p><strong>Pregnancy Week:</strong> ${pregnancyWeek || 'Unknown'}</p>
                <p><strong>Risk Level:</strong> ${riskLevel || 'High'}</p>
                <p>Please prepare emergency response.</p>
            </div>
        `;

        // Send to hospitals
        if (emails.length > 0) {
            await Promise.all(emails.map(email => sendEmail({
                email,
                subject: 'CRITICAL: EMERGENCY ALERT',
                message: alertMessage
            })));
        }

        // Send to emergency contact
        if (contactEmail) {
            await sendEmail({
                email: contactEmail,
                subject: 'EMERGENCY ALERT TRIGGERED',
                message: alertMessage
            });
        }

        // We can also emit real-time event via socket.io here if needed
        const io = req.app.get('io');
        if (io) {
            io.emit('emergencyAlert', { patientName, location, pregnancyWeek, riskLevel });
        }

        res.status(200).json({ success: true, message: 'Emergency alert sent successfully to nearby hospitals and contacts.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.sendEmergencyAlert = exports.triggerEmergencyAlert;

exports.addEmergencyContact = async (req, res) => {
    try {
        const userId = req.user.id;
        const { doctorName, doctorPhone, familyContactName, familyContactPhone, ashaWorkerName, ashaWorkerPhone, phoneNumber } = req.body;

        let contactInfo = await EmergencyContact.findOne({ userId });
        if (contactInfo) {
            // Update
            contactInfo.doctorName = doctorName || contactInfo.doctorName;
            contactInfo.doctorPhone = doctorPhone || contactInfo.doctorPhone;
            contactInfo.familyContact = { name: familyContactName || contactInfo.familyContact?.name, phone: familyContactPhone || contactInfo.familyContact?.phone };
            contactInfo.ashaWorkerName = ashaWorkerName || contactInfo.ashaWorkerName;
            contactInfo.ashaWorkerPhone = ashaWorkerPhone || contactInfo.ashaWorkerPhone;
            contactInfo.phoneNumber = phoneNumber || contactInfo.phoneNumber;
            await contactInfo.save();
            return res.status(200).json({ success: true, message: 'Emergency contacts updated', contactInfo });
        }

        contactInfo = new EmergencyContact({
            userId,
            doctorName, doctorPhone,
            familyContact: { name: familyContactName, phone: familyContactPhone },
            ashaWorkerName, ashaWorkerPhone,
            phoneNumber
        });
        await contactInfo.save();

        res.status(201).json({ success: true, message: 'Emergency contacts added', contactInfo });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getEmergencyContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const contacts = await EmergencyContact.findOne({ userId });
        if (!contacts) return res.status(404).json({ success: false, message: 'No emergency contacts found' });

        res.status(200).json({ success: true, contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.triggerSOS = async (req, res) => {
    try {
        const userId = req.user.id;
        const { latitude, longitude, riskLevel, message } = req.body;

        const event = new EmergencyEvent({
            userId,
            location: { latitude, longitude },
            riskLevel: riskLevel || 'High',
            message
        });

        await event.save();

        const patientName = req.user.name || 'A patient';
        let sentLog = [];

        const emailMsg = `Emergency Alert\n\nPatient: ${patientName}\nLocation: ${latitude}, ${longitude}\nRisk Status: ${riskLevel || 'High'}\nMessage: ${message || 'Immediate assistance required.'}`;

        // Send to patient's own email for demonstration, typically would go to doctors/family
        if (req.user.email) {
            await sendEmail({
                email: req.user.email,
                subject: `EMERGENCY SOS: ${patientName}`,
                message: emailMsg
            });
            sentLog.push(req.user.email);
        }

        res.status(201).json({ success: true, message: 'SOS Triggered successfully', event, alertsSentTo: sentLog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
