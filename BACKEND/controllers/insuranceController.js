const InsurancePolicy = require('../models/InsurancePolicy');
const sendEmail = require('../utils/emailService');

exports.addPolicy = async (req, res) => {
    try {
        const { providerName, policyNumber, coverageAmount, coverageType, validFrom, validTill, hospitalNetwork, documentUrl } = req.body;
        const userId = req.user.id;

        const policy = new InsurancePolicy({
            userId, providerName, policyNumber, coverageAmount, coverageType, validFrom, validTill, hospitalNetwork, documentUrl
        });

        await policy.save();

        if (req.user.email) {
            await sendEmail({
                email: req.user.email,
                subject: 'Insurance Policy Added - MaaCare',
                message: `Your insurance policy ${policyNumber} from ${providerName} has been successfully added to your MaaCare profile.`
            });
        }

        res.status(201).json({ success: true, message: 'Insurance policy added successfully', policy });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPolicies = async (req, res) => {
    try {
        const userId = req.user.id;
        const policies = await InsurancePolicy.find({ userId });
        res.status(200).json({ success: true, policies });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deletePolicy = async (req, res) => {
    try {
        const policy = await InsurancePolicy.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });

        res.status(200).json({ success: true, message: 'Policy deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.checkHospitalCoverage = async (req, res) => {
    try {
        const { id } = req.params; // Policy ID
        const { hospitalName } = req.query;

        const policy = await InsurancePolicy.findById(id);
        if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });

        const isCovered = policy.hospitalNetwork.includes(hospitalName) || policy.hospitalNetwork.length === 0; // Empty network means widely accepted
        res.status(200).json({ success: true, isCovered, policy });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
