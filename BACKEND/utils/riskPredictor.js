const VisitLog = require('../models/VisitLog');
const Appointment = require('../models/Appointment');

/**
 * Predictive Risk Scoring Engine (Module 5 — extended)
 * Combines static profile data with dynamic history for a time-aware risk prediction.
 * @param {Object} profile - PregnancyProfile document
 * @param {Array}  visitLogs - recent VisitLog documents for this mother
 * @param {Array}  appointments - Appointment documents for this mother
 * @returns {{ predictiveScore: number, predictiveLevel: string, factors: string[] }}
 */
const predictRisk = (profile, visitLogs = [], appointments = []) => {
    let score = 0;
    const factors = [];

    // ── Static profile factors ──────────────────────────────────────────────
    if (profile.age < 18 || profile.age > 35) { score += 20; factors.push('Age outside optimal range'); }
    if (profile.hemoglobin < 10) { score += 20; factors.push('Severe anaemia (Hb < 10)'); }
    else if (profile.hemoglobin < 11) { score += 10; factors.push('Mild anaemia (Hb < 11)'); }
    if (profile.bmi < 18.5) { score += 10; factors.push('Underweight (BMI < 18.5)'); }
    else if (profile.bmi > 30) { score += 10; factors.push('Obesity (BMI > 30)'); }
    if (profile.medicalHistory?.includes('diabetes')) { score += 15; factors.push('Gestational diabetes'); }
    if (profile.medicalHistory?.includes('hypertension')) { score += 15; factors.push('Hypertension'); }
    if (profile.medicalHistory?.includes('previous_complications')) { score += 20; factors.push('Previous pregnancy complications'); }
    if (profile.pregnancyWeek > 36) { score += 5; factors.push('Late-term pregnancy (> 36 weeks)'); }

    // ── Dynamic: Visit log signals ──────────────────────────────────────────
    const recentVisits = visitLogs.slice(0, 5); // last 5 visits
    const highBPVisits = recentVisits.filter(v => {
        if (!v.bloodPressure) return false;
        const [systolic] = v.bloodPressure.split('/').map(Number);
        return systolic > 140;
    });
    if (highBPVisits.length >= 2) { score += 20; factors.push('Persistently high BP in recent visits'); }
    else if (highBPVisits.length === 1) { score += 10; factors.push('Elevated BP detected'); }

    // Weight loss signal
    if (recentVisits.length >= 2) {
        const latest = recentVisits[0]?.weight;
        const previous = recentVisits[1]?.weight;
        if (latest && previous && latest < previous - 2) { score += 10; factors.push('Recent weight loss'); }
    }

    // ── Dynamic: Appointment adherence ─────────────────────────────────────
    const cancelled = appointments.filter(a => a.status === 'Cancelled').length;
    const total = appointments.length;
    if (total > 0 && cancelled / total > 0.4) { score += 10; factors.push('High appointment cancellation rate'); }

    // ── Clamp and classify ──────────────────────────────────────────────────
    const predictiveScore = Math.min(score, 100);
    const predictiveLevel = predictiveScore >= 60 ? 'High'
        : predictiveScore >= 30 ? 'Medium'
            : 'Low';

    return { predictiveScore, predictiveLevel, factors };
};

module.exports = { predictRisk };
