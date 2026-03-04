const QuizQuestion = require('../models/QuizQuestion');
const UserProgress = require('../models/UserProgress');

// Setup default questions if DB is empty (called silently on first request)
const seedQuestions = async () => {
    const count = await QuizQuestion.countDocuments();
    if (count > 0) return;
    const sampleQuestions = [
        { category: 'Nutrition', question: 'Which nutrient is most critical in early pregnancy to prevent neural tube defects?', options: ['Vitamin C', 'Iron', 'Folic Acid', 'Calcium'], correctAnswerIndex: 2, explanation: 'Folic acid helps form the neural tube. It can help prevent some major birth defects of the baby\'s brain and spine.' },
        { category: 'Baby Care', question: 'How often should a newborn baby be breastfed?', options: ['Every 1-3 hours', 'Every 4-5 hours', 'Twice a day', 'Only when they cry'], correctAnswerIndex: 0, explanation: 'Newborns need to nurse often, usually every 1 to 3 hours, because their stomachs are very small.' },
        { category: 'Postnatal Care', question: 'What is a common sign of postpartum depression?', options: ['Feeling tired sometimes', 'Joyful excitement', 'Severe mood swings & hopelessness', 'Increased appetite'], correctAnswerIndex: 2, explanation: 'While the "baby blues" are common, persistent feelings of hopelessness and severe mood swings indicate postpartum depression requiring medical help.' },
        { category: 'Nutrition', question: 'Which food should be avoided during pregnancy?', options: ['Cooked spinach', 'Raw papaya', 'Pasteurized milk', 'Apples'], correctAnswerIndex: 1, explanation: 'Raw or semi-ripe papaya contains latex which might trigger uterine contractions.' }
    ];
    await QuizQuestion.insertMany(sampleQuestions);
};

// ── GET DAILY QUESTIONS ───────────────────────────────────────────────────────
exports.getDailyQuestions = async (req, res) => {
    try {
        await seedQuestions();

        let progress = await UserProgress.findOne({ user: req.user._id });
        if (!progress) {
            progress = await UserProgress.create({ user: req.user._id });
        }

        // Check if user already played today
        const todayStr = new Date().toDateString();
        const lastDateStr = progress.lastQuizDate ? new Date(progress.lastQuizDate).toDateString() : null;

        if (todayStr === lastDateStr) {
            return res.json({ message: 'Already completed today', nextQuizAvailable: true, progress });
        }

        // Fetch 3 random questions the user hasn't seen
        let questions = await QuizQuestion.aggregate([
            { $match: { _id: { $nin: progress.completedQuizzes } } },
            { $sample: { size: 3 } }
        ]);

        // Fallback: If they answered everything, just give random questions
        if (questions.length < 3) {
            questions = await QuizQuestion.aggregate([{ $sample: { size: 3 } }]);
        }

        res.json({ questions, progress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
};

// ── SUBMIT QUIZ RESULTS ───────────────────────────────────────────────────────
exports.submitQuizResult = async (req, res) => {
    try {
        const { score, completedQuestionIds } = req.body;

        let progress = await UserProgress.findOne({ user: req.user._id });
        if (!progress) progress = new UserProgress({ user: req.user._id });

        // Update stats
        progress.totalPoints += score;
        progress.completedQuizzes.push(...completedQuestionIds);

        // Streak logic
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (progress.lastQuizDate && new Date(progress.lastQuizDate).toDateString() === yesterday.toDateString()) {
            progress.streakDays += 1;
        } else if (!progress.lastQuizDate || new Date(progress.lastQuizDate).toDateString() !== new Date().toDateString()) {
            progress.streakDays = 1;
        }

        progress.lastQuizDate = new Date();

        // Level & Badge logic
        progress.level = Math.floor(progress.totalPoints / 100) + 1;
        const newBadges = [];
        if (progress.streakDays === 3 && !progress.badges.includes('3-Day Streak 🔥')) newBadges.push('3-Day Streak 🔥');
        if (progress.totalPoints >= 300 && !progress.badges.includes('Health Scholar 🎓')) newBadges.push('Health Scholar 🎓');
        if (progress.totalPoints >= 1000 && !progress.badges.includes('MaaCare Expert 🌟')) newBadges.push('MaaCare Expert 🌟');

        progress.badges.push(...newBadges);
        await progress.save();

        res.json({ progress, newBadges, message: 'Quiz submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error saving quiz results' });
    }
};

exports.getProgress = async (req, res) => {
    try {
        const progress = await UserProgress.findOne({ user: req.user._id }) || { totalPoints: 0, level: 1, badges: [], streakDays: 0 };
        res.json(progress);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching progress' });
    }
};
