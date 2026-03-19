const DietPlan = require('../models/DietPlan');
const PregnancyProfile = require('../models/PregnancyProfile');

// Base templates based on trimesters/risks
const getDietTemplate = (profile) => {
    const isDiabetic = profile.diabetes;
    const week = profile.pregnancyWeek || 1;
    let template = {
        Breakfast: ['Oatmeal with nuts and seeds', 'Boiled egg or Paneer bhurji'],
        Lunch: ['Dal/Lentils with Roti', 'Green leafy vegetables', 'Curd/Yogurt'],
        Snack: ['Roasted chana', 'Fresh fruit (Apple/Orange)'],
        Dinner: ['Light vegetable soup', 'Khichdi or grilled chicken', 'Salad']
    };

    if (isDiabetic) {
        template.Breakfast = ['Moong dal chilla', 'Unsweetened green tea', 'Almonds'];
        template.Snack = ['Makhana (Fox nuts)', 'Cucumber sticks'];
    }

    if (week > 26) { // 3rd Trimester: requires more calcium/iron
        template.Lunch.push('Palak/Spinach for iron');
        template.Snack.push('Glass of warm milk');
    }

    return template;
};

// ── GET OR GENERATE TODAY'S PLAN ───────────────────────────────────────────────
exports.getTodayPlan = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let plan = await DietPlan.findOne({ mother: req.user._id, date: today });

        // Generate auto-plan if none exists for today
        if (!plan) {
            const profile = await PregnancyProfile.findOne({ mother: req.user._id });
            if (!profile) return res.status(200).json(null);

            const template = getDietTemplate(profile);
            const meals = Object.keys(template).map(cat => ({
                category: cat,
                items: template[cat],
                isCompleted: false
            }));

            plan = await DietPlan.create({
                mother: req.user._id,
                date: today,
                meals
            });
        }

        res.json(plan);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching diet plan' });
    }
};

// ── TOGGLE MEAL COMPLETION ────────────────────────────────────────────────────
exports.toggleMeal = async (req, res) => {
    try {
        const { mealId, isCompleted } = req.body;

        const plan = await DietPlan.findOne({ _id: req.params.id, mother: req.user._id });
        if (!plan) return res.status(404).json({ message: 'Diet plan not found' });

        const meal = plan.meals.id(mealId);
        if (!meal) return res.status(404).json({ message: 'Meal not found in plan' });

        meal.isCompleted = isCompleted;

        // Recalculate adherence
        const completedCount = plan.meals.filter(m => m.isCompleted).length;
        plan.adherenceScore = Math.round((completedCount / plan.meals.length) * 100);

        await plan.save();
        res.json(plan);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating meal' });
    }
};

// ── GET WEEKLY HISTORY ────────────────────────────────────────────────────────
exports.getWeeklyProgress = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const plans = await DietPlan.find({ mother: req.user._id, date: { $gte: sevenDaysAgo } })
            .sort('date')
            .select('date adherenceScore totalCalories');

        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};
