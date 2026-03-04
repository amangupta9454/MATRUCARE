/**
 * Nutrition Generator — Maternal Health Intelligence
 * Returns a tailored daily meal plan based on trimester, BMI, Hb, risk level
 */
const generateNutrition = ({ trimester, bmi, hemoglobin, riskLevel }) => {
    // Base calories by trimester
    let calories = trimester === 1 ? 1800 : trimester === 2 ? 2100 : 2400;
    let protein = trimester === 1 ? 60 : trimester === 2 ? 71 : 80; // grams
    let ironMg = hemoglobin < 11 ? 60 : 30; // higher iron if anaemic

    // Adjust for BMI
    if (bmi < 18.5) { calories += 200; protein += 5; }
    else if (bmi >= 30) { calories -= 100; }

    // Adjust for high risk
    if (riskLevel === 'High') { protein += 5; ironMg += 10; }

    const mealsByTrimester = {
        1: {
            breakfast: ['Oatmeal with banana & walnuts', 'A glass of warm milk', 'Folic acid-rich spinach omelette'],
            lunch: ['Rajma (kidney beans) rice', 'Mixed vegetable sabzi', 'Buttermilk (chaach)'],
            dinner: ['Moong dal khichdi', 'Roasted vegetables', 'A cup of warm turmeric milk'],
            snacks: ['Soaked almonds & raisins', 'Fruit chaat (apple, pear, pomegranate)', 'Sesame ladoo'],
            hydration: ['8–10 glasses of water', 'Coconut water', 'Herbal teas (ginger, chamomile)'],
        },
        2: {
            breakfast: ['Poha with peanuts & vegetables', 'Boiled eggs', 'Orange juice (fresh)'],
            lunch: ['Brown rice + dal makhani', 'Palak paneer', 'Salad with beets & carrots'],
            dinner: ['Roti + chicken/soya curry', 'Steamed broccoli', 'Dahi (curd)'],
            snacks: ['Roasted chana', 'Mixed nuts trail mix', 'Dates with milk'],
            hydration: ['10 glasses water', 'Lemon water', 'Coconut water after meals'],
        },
        3: {
            breakfast: ['Whole wheat upma', 'Scrambled eggs with veggies', 'Fresh papaya'],
            lunch: ['Roti + green dal + rice', 'Fish curry (omega-3)', 'Cucumber salad'],
            dinner: ['Light khichdi with ghee', 'Sauteed pumpkin & sweet potato', 'Warm milk with turmeric'],
            snacks: ['Makhana (fox nuts)', 'Banana shake', 'Anjeer (figs) soaked in water'],
            hydration: ['10–12 glasses water', 'Buttermilk', 'Avoid carbonated drinks'],
        },
    };

    const ironFoods = [
        'Spinach (palak)', 'Beetroot', 'Dates (khajoor)', 'Pomegranate', 'Lentils (dal)',
        'Kidney beans (rajma)', 'Tofu', 'Jaggery (gud)', 'Liver (if non-vegetarian)',
        'Sesame seeds (til)', 'Pumpkin seeds',
    ];

    return {
        calories,
        protein,
        ironMg,
        trimester,
        ironFoods,
        meals: mealsByTrimester[trimester] || mealsByTrimester[2],
        note: riskLevel === 'High'
            ? 'You are in a high-risk category. Please consult your doctor for a personalised diet plan before making dietary changes.'
            : 'This is a general recommendation. Always consult your doctor for personalised guidance.',
    };
};

module.exports = { generateNutrition };
