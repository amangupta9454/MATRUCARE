import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Star, CheckCircle, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '../Components/Navbar';

const Education = () => {
    const [questions, setQuestions] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);

    // Results state
    const [isFinished, setIsFinished] = useState(false);
    const [scoreEarned, setScoreEarned] = useState(0);
    const [newBadges, setNewBadges] = useState([]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/quiz/daily`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.nextQuizAvailable === true) {
                    setIsFinished(true); // Already played today
                    setProgress(res.data.progress);
                } else {
                    setQuestions(res.data.questions);
                    setProgress(res.data.progress);
                }
            } catch (error) {
                console.error("Error fetching quiz", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, []);

    const handleOptionSelect = (index) => {
        if (showExplanation) return;
        setSelectedOption(index);
        setShowExplanation(true);

        if (index === questions[currentIdx].correctAnswerIndex) {
            setScoreEarned(prev => prev + questions[currentIdx].points);
        }
    };

    const nextQuestion = async () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            // Finish Quiz
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const completedIds = questions.map(q => q._id);
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/quiz/submit`, {
                    score: scoreEarned,
                    completedQuestionIds: completedIds
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setProgress(res.data.progress);
                setNewBadges(res.data.newBadges || []);
                setIsFinished(true);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center"><div className="animate-spin w-12 h-12 border-b-2 border-teal-500 rounded-full"></div></div>;

    const currentQ = questions[currentIdx];

    return (
        <div className="min-h-screen pb-12">
            <Navbar />

            <div className="max-w-4xl mx-auto pt-24 px-4">

                {/* Progress Header */}
                <div className="glass-card mb-8 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-white/10">
                            L{progress?.level || 1}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-indigo-300">MaaCare Academy</h2>
                            <p className="text-sm text-gray-400 font-medium">Earn points. Learn daily. Stay healthy.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Points</p>
                            <p className="text-xl font-bold text-teal-400 flex justify-center items-center gap-1"><Star size={18} className="fill-teal-400" /> {progress?.totalPoints || 0}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Daily Streak</p>
                            <p className="text-xl font-bold text-orange-400 flex justify-center items-center gap-1"><Flame size={18} className={progress?.streakDays > 0 ? "fill-orange-400" : ""} /> {progress?.streakDays || 0} Days</p>
                        </div>
                    </div>
                </div>

                {/* Main Quiz Area */}
                {isFinished ? (
                    <div className="glass-card p-8 md:p-12 text-center border-t-4 border-teal-400">
                        <Trophy className="w-24 h-24 text-teal-400 mx-auto mb-6" />
                        <h2 className="text-3xl font-black mb-4">You're All Caught Up!</h2>
                        <p className="text-gray-300 text-lg mb-8">You've completed your daily health education. Come back tomorrow for more questions to build your streak.</p>

                        {scoreEarned > 0 && (
                            <div className="inline-block bg-teal-500/20 text-teal-300 px-6 py-3 rounded-full font-bold text-lg mb-8 animate-bounce">
                                +{scoreEarned} Points Earned Today!
                            </div>
                        )}

                        {newBadges.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold mb-4 text-indigo-300">New Badges Unlocked!</h3>
                                <div className="flex justify-center gap-4">
                                    {newBadges.map(b => (
                                        <div key={b} className="bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/50 p-4 rounded-xl flex items-center gap-2">
                                            <ShieldCheck className="w-6 h-6 text-indigo-300" />
                                            <span className="font-bold text-white">{b}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {progress?.badges?.length > 0 && newBadges.length === 0 && (
                            <div className="mt-8 text-left border-t border-white/10 pt-8">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Your Badge Collection</h3>
                                <div className="flex flex-wrap gap-2">
                                    {progress.badges.map(b => (
                                        <span key={b} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm font-semibold">{b}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="glass-card shadow-2xl relative overflow-hidden">
                        <div className="h-2 bg-white/5 w-full">
                            <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${((currentIdx) / questions.length) * 100}%` }}></div>
                        </div>

                        <div className="p-6 md:p-10">
                            <div className="flex justify-between items-center mb-6">
                                <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
                                    {currentQ?.category}
                                </span>
                                <span className="text-gray-400 text-sm font-bold">
                                    Question {currentIdx + 1} of {questions.length}
                                </span>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-semibold mb-8 text-white leading-tight">
                                {currentQ?.question}
                            </h3>

                            <div className="space-y-3 mb-8">
                                {currentQ?.options.map((opt, idx) => {
                                    let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-teal-500/50";
                                    let icon = null;

                                    if (showExplanation) {
                                        if (idx === currentQ.correctAnswerIndex) {
                                            btnStyle = "bg-teal-500/20 border-teal-500/50 text-teal-200 ring-2 ring-teal-500/50";
                                            icon = <CheckCircle className="w-5 h-5 text-teal-400" />;
                                        } else if (idx === selectedOption) {
                                            btnStyle = "bg-red-500/20 border-red-500/50 text-red-200";
                                            icon = <X className="w-5 h-5 text-red-400" />;
                                        } else {
                                            btnStyle = "bg-white/5 border-white/5 opacity-50";
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={showExplanation}
                                            onClick={() => handleOptionSelect(idx)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex justify-between items-center ${btnStyle}`}
                                        >
                                            <span className="text-lg">{opt}</span>
                                            {icon}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation Box */}
                            <div className={`transition-all duration-500 overflow-hidden ${showExplanation ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl mb-6">
                                    <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">Did You Know?</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">{currentQ?.explanation}</p>
                                </div>
                                <div className="text-right">
                                    <button
                                        onClick={nextQuestion}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] text-white px-8 py-3 rounded-full font-bold transition-all"
                                    >
                                        {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Education;
