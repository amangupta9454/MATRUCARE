const BabyProfile = require('../models/BabyProfile');
const BabyVaccination = require('../models/BabyVaccination');
const GrowthRecord = require('../models/GrowthRecord');
const { STANDARD_VACCINES } = require('../models/BabyVaccination');
const sendEmail = require('../config/nodemailer');
const User = require('../models/User');

// Helper: calculate due date from birth date + weeks
const addWeeks = (date, weeks) => {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
};

// ── Mother: Create Baby Profile ──────────────────────────────────────────────
exports.createBabyProfile = async (req, res) => {
    try {
        const { babyName, gender, birthDate, birthWeight, birthHeight, bloodGroup, deliveryHospital, doctor, notes, isPreterm } = req.body;

        const existing = await BabyProfile.findOne({ mother: req.user._id });
        if (existing) return res.status(400).json({ message: 'Baby profile already exists. Use update instead.' });

        const baby = await BabyProfile.create({
            mother: req.user._id,
            babyName, gender, birthDate, birthWeight, birthHeight,
            bloodGroup, deliveryHospital, doctor, notes,
            isPreterm: isPreterm || false,
        });

        // Auto-scaffold standard vaccinations
        const vaccinations = STANDARD_VACCINES.map(v => ({
            baby: baby._id,
            vaccineName: v.name,
            dueDate: addWeeks(birthDate, v.dueWeeks),
            completed: false,
        }));
        await BabyVaccination.insertMany(vaccinations, { ordered: false }).catch(() => { });

        res.status(201).json(baby);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating baby profile' });
    }
};

// ── Get Baby Profile ─────────────────────────────────────────────────────────
exports.getBabyProfile = async (req, res) => {
    try {
        const query = req.user.role === 'Mother'
            ? { mother: req.user._id }
            : { _id: req.params.babyId };
        const baby = await BabyProfile.findOne(query)
            .populate('mother', 'name email')
            .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });
        if (!baby) return res.status(404).json({ message: 'Baby profile not found' });
        res.json(baby);
    } catch (err) { res.status(500).json({ message: 'Error fetching baby profile' }); }
};

// ── Update Baby Profile ──────────────────────────────────────────────────────
exports.updateBabyProfile = async (req, res) => {
    try {
        const baby = await BabyProfile.findOneAndUpdate(
            { mother: req.user._id },
            req.body,
            { new: true }
        );
        if (!baby) return res.status(404).json({ message: 'Baby profile not found' });
        res.json(baby);
    } catch (err) { res.status(500).json({ message: 'Error updating baby profile' }); }
};

// ── Doctor: Add Growth Record ────────────────────────────────────────────────
exports.addGrowthRecord = async (req, res) => {
    try {
        const { babyId, weight, height, headCircumference, recordedDate, notes } = req.body;
        const baby = await BabyProfile.findById(babyId).populate('mother', 'name email');
        if (!baby) return res.status(404).json({ message: 'Baby not found' });

        const record = await GrowthRecord.create({
            baby: babyId, weight, height, headCircumference,
            recordedDate: recordedDate || new Date(),
            recordedBy: req.user._id,
            notes,
        });

        // Email mother
        if (baby.mother?.email) {
            await sendEmail({
                to: baby.mother.email,
                subject: `MaaCare — Growth Record Updated for ${baby.babyName}`,
                html: `<div style="font-family:Arial,sans-serif;padding:20px;border-left:4px solid #008080;">
                  <h2 style="color:#008080;">Baby Growth Record Updated</h2>
                  <p>Dear ${baby.mother.name},</p>
                  <p>A new growth record has been recorded for <strong>${baby.babyName}</strong>:</p>
                  <table style="border-collapse:collapse;width:100%;margin:12px 0;">
                    ${weight ? `<tr><td style="padding:6px;background:#f0fdf4;font-weight:600">Weight</td><td style="padding:6px">${weight} kg</td></tr>` : ''}
                    ${height ? `<tr><td style="padding:6px;background:#f0fdf4;font-weight:600">Height</td><td style="padding:6px">${height} cm</td></tr>` : ''}
                    ${headCircumference ? `<tr><td style="padding:6px;background:#f0fdf4;font-weight:600">Head Circumference</td><td style="padding:6px">${headCircumference} cm</td></tr>` : ''}
                    ${notes ? `<tr><td style="padding:6px;background:#f0fdf4;font-weight:600">Notes</td><td style="padding:6px">${notes}</td></tr>` : ''}
                  </table>
                  <p style="font-size:12px;color:#718096;">Recorded on ${new Date(record.recordedDate).toLocaleDateString('en-IN')}</p>
                </div>`,
            });
        }
        res.status(201).json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating growth record' });
    }
};

// ── Get Growth Records ────────────────────────────────────────────────────────
exports.getGrowthRecords = async (req, res) => {
    try {
        const baby = await BabyProfile.findOne({ mother: req.user._id });
        if (!baby) return res.status(404).json({ message: 'Baby profile not found' });
        const records = await GrowthRecord.find({ baby: baby._id }).sort('recordedDate');
        res.json(records);
    } catch (err) { res.status(500).json({ message: 'Error fetching growth records' }); }
};
