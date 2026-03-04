const Report = require('../models/Report');
const cloudinary = require('../config/cloudinary');

// Upload a report
exports.uploadReport = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'maacare/reports',
            resource_type: 'auto',
        });

        const report = await Report.create({
            patient: req.user._id,
            reportName: req.body.reportName || req.file.originalname,
            reportType: req.body.reportType || 'Other',
            reportUrl: result.secure_url,
            publicId: result.public_id,
            notes: req.body.notes || '',
        });

        res.status(201).json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error uploading report' });
    }
};

// Get own reports (Mother)
exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ patient: req.user._id }).sort('-uploadDate');
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reports' });
    }
};

// Get reports for doctor's appointment patients
exports.getDoctorPatientReports = async (req, res) => {
    try {
        const Doctor = require('../models/Doctor');
        const Appointment = require('../models/Appointment');

        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        // Get all patient IDs from appointments with this doctor
        const appointments = await Appointment.find({ doctor: doctor._id }).select('mother').lean();
        const patientIds = [...new Set(appointments.map(a => a.mother?.toString()))].filter(Boolean);

        const reports = await Report.find({ patient: { $in: patientIds } })
            .populate('patient', 'name email')
            .sort('-uploadDate');
        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching patient reports' });
    }
};

// Delete a report
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findOne({ _id: req.params.id, patient: req.user._id });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        if (report.publicId) {
            await cloudinary.uploader.destroy(report.publicId, { resource_type: 'auto' });
        }
        await report.deleteOne();
        res.json({ message: 'Report deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting report' });
    }
};
