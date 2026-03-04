/**
 * doctorRanking.js
 * Computes a reputation score for a doctor to drive the smart recommendation engine.
 *
 * Formula:
 *   score = rating*0.4 + experienceNorm*0.3 + availabilityNorm*0.2 + reviewCountNorm*0.1
 *
 * All inputs are normalised to 0–5 scale for fair weighting.
 */

/**
 * @param {Object} doctor      — Mongoose Doctor document (populated)
 * @param {Object} reviewStats — { avgRating: Number, reviewCount: Number }
 * @returns {Number} score (0–5 range, higher = better recommended)
 */
const computeScore = (doctor, reviewStats = {}) => {
    const rating = Math.min(reviewStats.avgRating || 0, 5);
    const experience = Math.min((doctor.experienceYears || 0) / 6, 1) * 5;   // 30 yrs → max 5
    const availability = Math.min((doctor.availableDays?.length || 0) / 7, 1) * 5; // 7 days → max 5
    const reviewCount = Math.min((reviewStats.reviewCount || 0) / 100, 1) * 5;    // 100+ → max 5

    return +(rating * 0.4 + experience * 0.3 + availability * 0.2 + reviewCount * 0.1).toFixed(3);
};

/**
 * Returns a human-readable reputation badge based on score.
 */
const getBadge = (score) => {
    if (score >= 4.2) return 'Top Rated Doctor';
    if (score >= 3.5) return 'Highly Recommended';
    if (score >= 2.5) return 'Expert Specialist';
    return '';
};

module.exports = { computeScore, getBadge };
