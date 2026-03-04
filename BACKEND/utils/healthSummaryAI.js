exports.generateSummary = async (reportType, reportUrl) => {
    // In a production environment, this would call an AI service API.
    // For the demonstration of Feature 9 handling, we generate smart summaries based on report type.
    let summary = '';

    const typeLower = (reportType || '').toLowerCase();

    if (typeLower.includes('lab') || typeLower.includes('blood')) {
        summary = `Hemoglobin: Low\nBlood Pressure: Normal\nRecommendation: Increase iron intake`;
    } else if (typeLower.includes('scan') || typeLower.includes('ultrasound')) {
        summary = `Fetal Growth: Normal\nAmniotic Fluid: Adequate\nRecommendation: Continue routine prenatal care`;
    } else {
        summary = `Standard report analyzed. No immediate critical flags detected.\nRecommendation: Discuss detailed findings during next consultation.`;
    }

    return summary;
};
