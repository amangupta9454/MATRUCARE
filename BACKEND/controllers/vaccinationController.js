const BabyVaccination = require('../models/BabyVaccination');
const BabyProfile = require('../models/BabyProfile');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { Readable } = require('stream');
const sendEmail = require('../config/nodemailer');

// ── Get vaccines for logged-in mother's baby ─────────────────────────────────
exports.getMyBabyVaccinations = async (req, res) => {
    try {
        const baby = await BabyProfile.findOne({ mother: req.user._id });
        if (!baby) return res.status(404).json({ message: 'Baby profile not found. Create a baby profile first.' });
        const vaccines = await BabyVaccination.find({ baby: baby._id }).sort('dueDate');
        res.json(vaccines);
    } catch (err) { res.status(500).json({ message: 'Error fetching vaccinations' }); }
};

// ── Mark baby vaccine as completed + optional Cloudinary proof ──────────────
exports.markBabyVaccination = async (req, res) => {
    try {
        const { vaccineName } = req.body;
        const baby = await BabyProfile.findOne({ mother: req.user._id });
        if (!baby) return res.status(404).json({ message: 'Baby profile not found' });

        const vaccine = await BabyVaccination.findOne({ baby: baby._id, vaccineName });
        if (!vaccine) return res.status(404).json({ message: 'Vaccine not found' });

        let proofUrl, proofPublicId;
        if (req.file) {
            // Upload to Cloudinary
            await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'maacare/baby_vaccines', resource_type: 'auto' },
                    (error, result) => {
                        if (error) return reject(error);
                        proofUrl = result.secure_url;
                        proofPublicId = result.public_id;
                        resolve();
                    }
                );
                Readable.from(req.file.buffer).pipe(stream);
            });
        }

        vaccine.completed = true;
        vaccine.completedDate = new Date();
        if (proofUrl) { vaccine.proofUrl = proofUrl; vaccine.proofPublicId = proofPublicId; }
        await vaccine.save();

        res.json(vaccine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error marking vaccination' });
    }
};

// ── Delete vaccine proof from Cloudinary ────────────────────────────────────
exports.deleteVaccineProof = async (req, res) => {
    try {
        const vaccine = await BabyVaccination.findById(req.params.id);
        if (!vaccine) return res.status(404).json({ message: 'Vaccine record not found' });

        if (vaccine.proofPublicId) {
            await cloudinary.uploader.destroy(vaccine.proofPublicId);
        }
        vaccine.proofUrl = undefined; vaccine.proofPublicId = undefined;
        await vaccine.save();
        res.json({ message: 'Proof removed' });
    } catch (err) { res.status(500).json({ message: 'Error removing proof' }); }
};
