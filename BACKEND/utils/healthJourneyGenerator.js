/**
 * Generates a step-by-step healthcare journey based on a medical condition.
 * @param {string} condition - The health condition (e.g., 'Anemia', 'Diabetes').
 * @returns {Array} - Array of steps detailing the journey.
 */
const generateJourney = (condition) => {
    condition = condition.toLowerCase();

    const journeys = {
        anemia: {
            title: 'Anemia Treatment Journey',
            steps: [
                { stepNumber: 1, action: 'Blood Test (CBC, Ferritin)', estimatedTimeline: 'Day 1', doctorSpecialty: 'General Physician / Pathologist', serviceCategory: 'Diagnostics' },
                { stepNumber: 2, action: 'Nutrition Plan formulation focusing on iron-rich foods', estimatedTimeline: 'Day 2-3', doctorSpecialty: 'Dietitian', serviceCategory: 'Nutrition' },
                { stepNumber: 3, action: 'Start Iron Supplementation under guidance', estimatedTimeline: 'Day 3', doctorSpecialty: 'General Physician', serviceCategory: 'Pharmacy' },
                { stepNumber: 4, action: 'Follow-up consultation to check hemoglobin levels', estimatedTimeline: 'Week 4', doctorSpecialty: 'General Physician', serviceCategory: 'Consultation' }
            ]
        },
        pregnancy: {
            title: 'Early Pregnancy Care Journey',
            steps: [
                { stepNumber: 1, action: 'Confirmation Scan & Initial Blood Work', estimatedTimeline: 'Week 6-8', doctorSpecialty: 'Obstetrician/Gynecologist', serviceCategory: 'Maternity' },
                { stepNumber: 2, action: 'Start Prenatal Vitamins (Folic Acid)', estimatedTimeline: 'Week 8', doctorSpecialty: 'Obstetrician/Gynecologist', serviceCategory: 'Pharmacy' },
                { stepNumber: 3, action: 'Nuchal Translucency (NT) Scan', estimatedTimeline: 'Week 11-14', doctorSpecialty: 'Fetal Medicine Specialist', serviceCategory: 'Diagnostics' },
                { stepNumber: 4, action: 'Anomaly Scan Follow-up', estimatedTimeline: 'Week 18-22', doctorSpecialty: 'Obstetrician/Gynecologist', serviceCategory: 'Maternity' }
            ]
        },
        diabetes: {
            title: 'Gestational Diabetes Management',
            steps: [
                { stepNumber: 1, action: 'Glucose Tolerance Test (GTT)', estimatedTimeline: 'Day 1', doctorSpecialty: 'Endocrinologist / Pathologist', serviceCategory: 'Diagnostics' },
                { stepNumber: 2, action: 'Dietary Adjustment & Monitoring setup', estimatedTimeline: 'Day 2', doctorSpecialty: 'Dietitian', serviceCategory: 'Nutrition' },
                { stepNumber: 3, action: 'Daily Blood Sugar Charting Review', estimatedTimeline: 'Week 1-2', doctorSpecialty: 'Endocrinologist', serviceCategory: 'Consultation' },
                { stepNumber: 4, action: 'Insulin/Medication prescription (if required)', estimatedTimeline: 'Variable', doctorSpecialty: 'Endocrinologist', serviceCategory: 'Pharmacy' }
            ]
        },
        postpartum: {
            title: 'Postpartum Recovery Care',
            steps: [
                { stepNumber: 1, action: 'Immediate postpartum checkup', estimatedTimeline: 'Day 1-3', doctorSpecialty: 'Obstetrician', serviceCategory: 'Maternity' },
                { stepNumber: 2, action: 'Lactation Consultation', estimatedTimeline: 'Week 1-2', doctorSpecialty: 'Lactation Consultant', serviceCategory: 'Consultation' },
                { stepNumber: 3, action: 'Pelvic Floor Therapy Assessment', estimatedTimeline: 'Week 6', doctorSpecialty: 'Physiotherapist', serviceCategory: 'Therapy' },
                { stepNumber: 4, action: 'Mental Health Screening (PPD)', estimatedTimeline: 'Week 6-8', doctorSpecialty: 'Psychiatrist / Therapist', serviceCategory: 'Mental Health' }
            ]
        }
    };

    // Default generic journey if not found
    const defaultJourney = {
        title: `Healthcare Journey: ${condition.charAt(0).toUpperCase() + condition.slice(1)}`,
        steps: [
            { stepNumber: 1, action: 'Initial consultation and diagnosis', estimatedTimeline: 'Day 1', doctorSpecialty: 'General Physician', serviceCategory: 'Consultation' },
            { stepNumber: 2, action: 'Recommended diagnostic tests', estimatedTimeline: 'Day 1-3', doctorSpecialty: 'Pathologist', serviceCategory: 'Diagnostics' },
            { stepNumber: 3, action: 'Treatment Plan formulation', estimatedTimeline: 'Day 4', doctorSpecialty: 'Specialist', serviceCategory: 'Consultation' },
            { stepNumber: 4, action: 'Follow-up review', estimatedTimeline: 'Week 2-4', doctorSpecialty: 'Specialist', serviceCategory: 'Consultation' }
        ]
    };

    // Check if any predefined journeys cover this condition
    const matchingKey = Object.keys(journeys).find(k => condition.includes(k));

    return matchingKey ? journeys[matchingKey] : defaultJourney;
};

module.exports = generateJourney;
