/**
 * Risk Calculator — Maternal Health Intelligence
 * Returns: { score: 0-100, level: 'Low'|'Medium'|'High', factors: [] }
 */
const calculateRisk = ({ age, hemoglobin, bmi, diabetes, hypertension, miscarriageHistory, pregnancyWeek }) => {
    let score = 0;
    const factors = [];

    // Age risk
    if (age < 18) { score += 20; factors.push('Teenage pregnancy (age < 18)'); }
    else if (age >= 35) { score += 15; factors.push('Advanced maternal age (≥ 35)'); }
    else if (age >= 30) { score += 5; }

    // Hemoglobin (g/dL) — anaemia risk
    if (hemoglobin < 7) { score += 25; factors.push('Severe anaemia (Hb < 7 g/dL)'); }
    else if (hemoglobin < 10) { score += 15; factors.push('Moderate anaemia (Hb < 10 g/dL)'); }
    else if (hemoglobin < 11) { score += 8; factors.push('Mild anaemia (Hb < 11 g/dL)'); }

    // BMI risk
    if (bmi < 18.5) { score += 10; factors.push('Underweight (BMI < 18.5)'); }
    else if (bmi >= 30) { score += 12; factors.push('Obese (BMI ≥ 30)'); }
    else if (bmi >= 25) { score += 5; factors.push('Overweight (BMI ≥ 25)'); }

    // Medical conditions
    if (diabetes) { score += 15; factors.push('Gestational diabetes'); }
    if (hypertension) { score += 15; factors.push('High blood pressure / Hypertension'); }
    if (miscarriageHistory) { score += 10; factors.push('Previous miscarriage history'); }

    // Pregnancy week extremes
    if (pregnancyWeek >= 37) { score += 5; }
    if (pregnancyWeek < 13) { score += 3; } // First trimester — higher miscarriage risk window

    // Cap at 100
    score = Math.min(100, score);

    let level;
    if (score >= 50) level = 'High';
    else if (score >= 25) level = 'Medium';
    else level = 'Low';

    return { score, level, factors };
};

module.exports = { calculateRisk };
