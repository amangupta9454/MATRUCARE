/**
 * Government Scheme Eligibility Checker
 * Returns array of scheme results based on mother's socioeconomic profile
 */
const SCHEMES = [
    {
        name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
        check: ({ age, pregnancyNumber, hasAadhaar, hasBankAccount }) =>
            hasAadhaar && hasBankAccount && pregnancyNumber === 1,
        benefits: [
            'Cash incentive of ₹5,000 in three instalments',
            'First instalment: ₹1,000 on early pregnancy registration',
            'Second instalment: ₹2,000 after 6 months of pregnancy',
            'Third instalment: ₹2,000 after child birth and first cycle of vaccination',
        ],
        documents: [
            'Aadhaar Card (Mother)',
            'Aadhaar Card (Husband)',
            'Bank Passbook (first page)',
            'MCP Card (Mother & Child Protection)',
            'Pregnancy Registration Certificate',
        ],
        steps: [
            'Visit nearest Anganwadi Centre or Health Sub-Centre',
            'Fill Form 1A for first instalment',
            'Submit with Aadhaar and bank passbook copies',
            'Subsequent instalments processed automatically via Anganwadi',
        ],
        officialLink: 'https://pmmvy.nic.in',
    },
    {
        name: 'Janani Suraksha Yojana (JSY)',
        check: ({ isRural, state }) => {
            const highFocusStates = ['UP', 'MP', 'Bihar', 'Rajasthan', 'Jharkhand', 'Odisha', 'UK', 'Chhattisgarh', 'Assam', 'J&K'];
            return isRural || highFocusStates.includes(state);
        },
        benefits: [
            'Cash assistance of ₹1,400 for institutional delivery in rural areas',
            'Cash assistance of ₹1,000 in urban areas (select states)',
            'ASHA worker incentive for facilitating delivery',
            'Free delivery services at government health facilities',
        ],
        documents: [
            'Aadhaar Card or BPL Card',
            'JSY Card issued by ANM/ASHA',
            'Delivery certificate from hospital',
            'Bank account details for direct transfer',
        ],
        steps: [
            'Register at nearest government health centre during pregnancy',
            'Obtain JSY card from your ASHA worker or ANM',
            'Deliver at empanelled public/private health facility',
            'Cash transferred within 7 days of discharge',
        ],
        officialLink: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309',
    },
    {
        name: 'Janani Shishu Suraksha Karyakram (JSSK)',
        check: () => true, // Universal entitlement for all pregnant women
        benefits: [
            'Free and cashless delivery at government hospitals',
            'Free C-section if required',
            'Free drugs, diagnostics, diet during hospital stay',
            'Free blood transfusion if needed',
            'Free transport from home to hospital and back',
        ],
        documents: [
            'Any government ID proof',
            'Pregnancy registration card',
        ],
        steps: [
            'Visit any government health facility for delivery',
            'All services are free — no payment required',
            'Report any denial to the District Health Officer',
        ],
        officialLink: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=310',
    },
    {
        name: 'Poshan Abhiyaan (PM Nutrition Mission)',
        check: ({ age }) => age <= 35,
        benefits: [
            'Supplementary nutrition through Anganwadi centres',
            'Take-home rations for pregnant women',
            'Iron and Folic Acid (IFA) supplementation',
            'Regular growth monitoring during pregnancy',
        ],
        documents: [
            'Registration at local Anganwadi Centre',
            'Aadhaar Card',
        ],
        steps: [
            'Visit nearest Anganwadi Centre',
            'Register your pregnancy',
            'Collect monthly nutritional supplies',
        ],
        officialLink: 'https://poshanabhiyaan.gov.in',
    },
];

const checkSchemeEligibility = (formData) => {
    return SCHEMES.map(scheme => ({
        schemeName: scheme.name,
        eligible: scheme.check(formData),
        benefits: scheme.benefits,
        documents: scheme.documents,
        steps: scheme.steps,
        officialLink: scheme.officialLink,
    }));
};

module.exports = { checkSchemeEligibility };
