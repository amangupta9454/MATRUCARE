const AshaAssignment = require('../models/AshaAssignment');
const VisitLog = require('../models/VisitLog');
const PregnancyProfile = require('../models/PregnancyProfile');
const ANCVisit = require('../models/ANCVisit');
const User = require('../models/User');
const sendEmail = require('../config/nodemailer');

// ── Admin: Assign ASHA worker to mother ─────────────────────────────────────
exports.assignAsha = async (req, res) => {
    try {
        const { motherId, ashaWorkerId, region, notes } = req.body;

        // Validate both users exist with correct roles
        const [mother, ashaWorker] = await Promise.all([
            User.findOne({ _id: motherId, role: 'Mother' }),
            User.findOne({ _id: ashaWorkerId, role: 'ASHA' }),
        ]);
        if (!mother) return res.status(404).json({ message: 'Mother not found' });
        if (!ashaWorker) return res.status(404).json({ message: 'ASHA worker not found' });

        const assignment = await AshaAssignment.findOneAndUpdate(
            { mother: motherId },
            { mother: motherId, ashaWorker: ashaWorkerId, region, notes, assignedBy: req.user._id, assignedDate: new Date() },
            { upsert: true, new: true }
        ).populate('mother ashaWorker', 'name email');

        // Notify both
        await Promise.all([
            sendEmail({
                to: ashaWorker.email,
                subject: 'MaaCare – New Mother Assignment',
                html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">New Assignment</h2><p>Dear ${ashaWorker.name},</p><p>You have been assigned to support <strong>${mother.name}</strong> in the <strong>${region}</strong> region.</p><p>Please visit her soon and log your visit in the MaaCare system.</p><p>Regards,<br/>MaaCare Team</p></div>`,
            }),
            sendEmail({
                to: mother.email,
                subject: 'MaaCare – ASHA Worker Assigned to You',
                html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#008080;">ASHA Worker Assigned</h2><p>Dear ${mother.name},</p><p>An ASHA worker <strong>${ashaWorker.name}</strong> has been assigned to support your maternal health journey in <strong>${region}</strong>.</p><p>She will visit you periodically and help you with health tracking and government schemes.</p><p>Regards,<br/>MaaCare Team</p></div>`,
            }),
        ]);

        res.status(201).json(assignment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error assigning ASHA worker' });
    }
};

// ── Admin: Get all ASHA assignments ─────────────────────────────────────────
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await AshaAssignment.find()
            .populate('mother', 'name email')
            .populate('ashaWorker', 'name email')
            .sort('-assignedDate');
        res.json(assignments);
    } catch (err) { res.status(500).json({ message: 'Error fetching assignments' }); }
};

// ── Admin: Get all mothers and ASHA workers (for assignment UI dropdowns) ────
exports.getAssignableUsers = async (req, res) => {
    try {
        const [mothers, ashaWorkers] = await Promise.all([
            User.find({ role: 'Mother' }).select('name email'),
            User.find({ role: 'ASHA' }).select('name email'),
        ]);
        res.json({ mothers, ashaWorkers });
    } catch (err) { res.status(500).json({ message: 'Error fetching users' }); }
};

// ── ASHA: Get own assigned mothers with full profile data ────────────────────
exports.getMyAssignments = async (req, res) => {
    try {
        const assignments = await AshaAssignment.find({ ashaWorker: req.user._id })
            .populate('mother', 'name email profileImage');

        const enriched = await Promise.all(assignments.map(async a => {
            const profile = await PregnancyProfile.findOne({ mother: a.mother._id })
                .select('pregnancyWeek riskLevel riskScore expectedDeliveryDate bmi hemoglobin');
            const ancVisits = await ANCVisit.find({ patient: a.mother._id });
            const nextAnc = ancVisits.find(v => !v.completed);
            const lastVisit = await VisitLog.findOne({ mother: a.mother._id, ashaWorker: req.user._id }).sort('-visitDate');

            return {
                assignment: a,
                profile,
                nextAncWeek: nextAnc?.visitWeek || null,
                lastVisitDate: lastVisit?.visitDate || null,
            };
        }));

        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
};

// ── ASHA: Log a home visit ───────────────────────────────────────────────────
exports.logVisit = async (req, res) => {
    try {
        const {
            motherId, visitDate, bloodPressure, weight, hemoglobin,
            observations, recommendations, nextVisitDate, syncedFromOffline
        } = req.body;

        // Verify mother exists
        const mother = await User.findOne({ _id: motherId, role: 'Mother' });
        if (!mother) return res.status(404).json({ message: 'Mother not found' });

        const log = await VisitLog.create({
            mother: motherId,
            ashaWorker: req.user._id,
            visitDate: visitDate || new Date(),
            bloodPressure, weight, hemoglobin,
            observations, recommendations, nextVisitDate,
            syncedFromOffline: syncedFromOffline || false,
        });

        // Notify assigned doctor via pregnancy profile
        const profile = await PregnancyProfile.findOne({ mother: motherId })
            .populate({ path: 'assignedDoctor', populate: { path: 'user', select: 'name email' } });

        if (profile?.assignedDoctor?.user?.email) {
            await sendEmail({
                to: profile.assignedDoctor.user.email,
                subject: `MaaCare – ASHA Visit Log: ${mother.name}`,
                html: `
                <div style="font-family:Arial,sans-serif;padding:20px;border-left:4px solid #008080;">
                  <h2 style="color:#008080;">ASHA Home Visit Summary</h2>
                  <p><strong>Patient:</strong> ${mother.name} (${mother.email})</p>
                  <p><strong>Visit Date:</strong> ${new Date(visitDate || new Date()).toLocaleDateString('en-IN')}</p>
                  <p><strong>ASHA Worker:</strong> ${req.user.name}</p>
                  <table style="border-collapse:collapse;width:100%;margin-top:12px;">
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Blood Pressure</td><td style="padding:6px">${bloodPressure || 'N/A'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Weight</td><td style="padding:6px">${weight ? weight + ' kg' : 'N/A'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Hemoglobin</td><td style="padding:6px">${hemoglobin ? hemoglobin + ' g/dL' : 'N/A'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Observations</td><td style="padding:6px">${observations || 'None'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Recommendations</td><td style="padding:6px">${recommendations || 'None'}</td></tr>
                    <tr><td style="padding:6px;background:#f0fdf4;font-weight:bold;">Next Visit</td><td style="padding:6px">${nextVisitDate ? new Date(nextVisitDate).toLocaleDateString('en-IN') : 'Not scheduled'}</td></tr>
                  </table>
                  <p style="margin-top:16px;color:#718096;font-size:12px;">Auto-generated by MaaCare Field Reporting System</p>
                </div>`,
            });
        }

        res.status(201).json(log);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging visit' });
    }
};

// ── Get visit logs for a mother (ASHA / Doctor / Mother herself) ─────────────
exports.getVisitLogs = async (req, res) => {
    try {
        const { motherId } = req.params;
        const logs = await VisitLog.find({ mother: motherId })
            .populate('ashaWorker', 'name email')
            .sort('-visitDate');
        res.json(logs);
    } catch (err) { res.status(500).json({ message: 'Error fetching visit logs' }); }
};

// ── Get own visit logs (for Mother's health dashboard) ───────────────────────
exports.getMyVisitLogs = async (req, res) => {
    try {
        const logs = await VisitLog.find({ mother: req.user._id })
            .populate('ashaWorker', 'name email')
            .sort('-visitDate');
        res.json(logs);
    } catch (err) { res.status(500).json({ message: 'Error fetching own visit logs' }); }
};
