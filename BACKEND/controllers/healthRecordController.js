const HealthRecord = require('../models/HealthRecord');
const { generateSummary } = require('../utils/healthSummaryAI');

exports.addHealthRecord = async (req, res) => {
    try {
        const { patientId, reportType, reportUrl } = req.body;
        const doctorId = req.user && req.user.role === 'doctor' ? req.user.id : null;
        const hospitalId = req.user && req.user.role === 'hospital' ? req.user.id : null;

        const summary = await generateSummary(reportType, reportUrl);

        const record = new HealthRecord({
            patientId, doctorId, hospitalId, reportType, reportUrl, summary
        });
        await record.save();

        res.status(201).json({ success: true, message: 'Health record added successfully', record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPatientRecords = async (req, res) => {
    try {
        const patientId = req.params.patientId || (req.user && req.user.id);
        const records = await HealthRecord.find({ patientId }).populate('doctorId', 'name').populate('hospitalId', 'hospitalName');
        res.status(200).json({ success: true, records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateRecord = async (req, res) => {
    try {
        const record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
