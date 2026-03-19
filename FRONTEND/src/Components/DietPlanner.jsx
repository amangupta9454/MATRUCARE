import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Circle } from 'lucide-react';

const DietPlanner = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/diet/today`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPlan(res.data);
            } catch (error) {
                if (error.response && error.response.status !== 404) {
                    console.error("Error fetching diet plan", error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, []);

    const toggleMeal = async (mealId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/diet/${plan._id}/meal`,
                { mealId, isCompleted: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPlan(res.data);
        } catch (error) {
            console.error("Error updating meal", error);
        }
    };

    if (loading) return <div className="animate-pulse glass-card h-64"></div>;
    if (!plan) return <div className="glass-card p-6 text-gray-400">Complete your pregnancy profile first to generate a diet plan.</div>;

    return (
        <div className="glass-card p-6">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Daily Nutrition</h2>
                    <p className="text-sm text-gray-400">Personalized for your trimester & health</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-teal-400">{plan.adherenceScore}%</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Adherence</p>
                </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-2 mb-8 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-indigo-500 h-2 transition-all duration-500" style={{ width: `${plan.adherenceScore}%` }}></div>
            </div>

            <div className="space-y-4">
                {plan.meals.map((meal) => (
                    <div
                        key={meal._id}
                        onClick={() => toggleMeal(meal._id, meal.isCompleted)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between group
                            ${meal.isCompleted
                                ? 'bg-teal-500/10 border-teal-500/30'
                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}
                    >
                        <div>
                            <p className={`font-bold mb-1 ${meal.isCompleted ? 'text-teal-300' : 'text-white'}`}>{meal.category}</p>
                            <div className="text-sm text-gray-400 flex flex-wrap gap-2">
                                {meal.items.map((item, idx) => (
                                    <span key={idx} className="bg-black/30 px-2 py-0.5 rounded-md">{item}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            {meal.isCompleted
                                ? <CheckCircle2 className="w-8 h-8 text-teal-400" />
                                : <Circle className="w-8 h-8 text-gray-500 group-hover:text-gray-300" />
                            }
                        </div>
                    </div>
                ))}
            </div>

            {plan.adherenceScore === 100 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border border-teal-500/30 rounded-xl text-center text-teal-200 animate-pulse">
                    🎉 Fantastic! You completed all your nutritious meals today!
                </div>
            )}
        </div>
    );
};

export default DietPlanner;
