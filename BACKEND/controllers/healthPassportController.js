const HealthPassport = require('../models/HealthPassport');

exports.createOrUpdatePassport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bloodGroup, allergies, conditions, vaccinations, primaryDoctor, insuranceProvider } = req.body;

        let passport = await HealthPassport.findOne({ userId });

        if (passport) {
            passport.bloodGroup = bloodGroup || passport.bloodGroup;
            passport.allergies = allergies || passport.allergies;
            passport.conditions = conditions || passport.conditions;
            passport.vaccinations = vaccinations || passport.vaccinations;
            passport.primaryDoctor = primaryDoctor || passport.primaryDoctor;
            passport.insuranceProvider = insuranceProvider || passport.insuranceProvider;
            await passport.save();
            return res.status(200).json({ success: true, message: 'Passport updated', passport });
        }

        passport = new HealthPassport({
            userId, bloodGroup, allergies, conditions, vaccinations, primaryDoctor, insuranceProvider
        });
        await passport.save();

        res.status(201).json({ success: true, message: 'Passport created', passport });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPassport = async (req, res) => {
    try {
        // Can be requested by self or a hospital/doctor with the QR code
        const userId = req.params.userId || req.user.id;
        const passport = await HealthPassport.findOne({ userId }).populate('userId', 'name email mobileNumber');

        if (!passport) {
            return res.status(404).json({ success: false, message: 'Health passport not found for this user.' });
        }
        res.status(200).json({ success: true, passport });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
