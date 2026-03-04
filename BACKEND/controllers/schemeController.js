const SchemeEligibility = require('../models/SchemeEligibility');
const { checkSchemeEligibility } = require('../utils/schemeChecker');
const sendEmail = require('../config/nodemailer');

// POST /api/schemes/check
exports.checkEligibility = async (req, res) => {
    try {
        const { age, pregnancyNumber, hasAadhaar, hasBankAccount, state, isRural } = req.body;

        const input = {
            age: parseInt(age),
            pregnancyNumber: parseInt(pregnancyNumber),
            hasAadhaar: hasAadhaar === 'true' || hasAadhaar === true,
            hasBankAccount: hasBankAccount === 'true' || hasBankAccount === true,
            state: state || '',
            isRural: isRural === 'true' || isRural === true,
        };

        const results = checkSchemeEligibility(input);
        const eligibleSchemes = results.filter(r => r.eligible);

        // Save to DB if user is logged in (Mother)
        let saved = null;
        if (req.user) {
            saved = await SchemeEligibility.create({
                mother: req.user._id,
                inputData: input,
                results,
            });

            // Send eligibility report email
            const schemeRows = results.map(r => `
                <tr>
                  <td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">${r.schemeName}</td>
                  <td style="padding:8px;border:1px solid #e2e8f0;color:${r.eligible ? '#16a34a' : '#dc2626'};font-weight:bold">${r.eligible ? '✅ Eligible' : '❌ Not Eligible'}</td>
                </tr>`).join('');

            await sendEmail({
                to: req.user.email,
                subject: 'MaaCare – Your Government Scheme Eligibility Report',
                html: `
                <div style="font-family:Arial,sans-serif;padding:24px;max-width:600px;">
                  <h2 style="color:#008080;">Government Scheme Eligibility Report</h2>
                  <p>Dear ${req.user.name},</p>
                  <p>Based on the information you provided, here is your eligibility summary:</p>
                  <table style="border-collapse:collapse;width:100%;margin:16px 0;">
                    <tr style="background:#f0fdf4;"><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Scheme</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Status</th></tr>
                    ${schemeRows}
                  </table>
                  <p><strong>${eligibleSchemes.length} scheme(s)</strong> found eligible for you.</p>
                  <p>Log in to MaaCare to view the full details with required documents and application steps.</p>
                  <p style="color:#718096;font-size:12px;">This report was generated on ${new Date().toLocaleDateString('en-IN')}.</p>
                </div>`,
            });
        }

        res.json({ results, eligibleCount: eligibleSchemes.length, savedId: saved?._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error checking scheme eligibility' });
    }
};

// GET /api/schemes/my-checks
exports.getMyEligibilities = async (req, res) => {
    try {
        const checks = await SchemeEligibility.find({ mother: req.user._id }).sort('-checkedDate').limit(5);
        res.json(checks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching eligibility history' });
    }
};
