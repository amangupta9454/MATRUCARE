import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Coffee, Sun, Moon, Apple, Droplets, Download, Flame, Dumbbell, Zap } from 'lucide-react';

const MEAL_ICONS = { breakfast: Coffee, lunch: Sun, dinner: Moon, snacks: Apple, hydration: Droplets };
const MEAL_COLORS = {
    breakfast: 'border-orange-500/30 bg-orange-500/5',
    lunch: 'border-yellow-500/30 bg-yellow-500/5',
    dinner: 'border-blue-500/30  bg-blue-500/5',
    snacks: 'border-green-500/30  bg-green-500/5',
    hydration: 'border-cyan-500/30   bg-cyan-500/5',
};

const NutritionPlan = ({ plan }) => {
    const [activeTab, setActiveTab] = useState('breakfast');
    if (!plan) return null;

    const tabs = Object.keys(plan.meals || {});
    const MealIcon = MEAL_ICONS[activeTab] || Utensils;

    const handlePrint = () => window.print();

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2"><Utensils size={18} className="text-green-400" /> Daily Nutrition Plan</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Trimester {plan.trimester} · Week {plan.pregnancyWeek}</p>
                </div>
                <button onClick={handlePrint} className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl font-bold transition-all">
                    <Download size={14} /> Download PDF
                </button>
            </div>

            {/* Macro stats */}
            <div className="grid grid-cols-3 gap-4 p-5 border-b border-white/10">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1"><Flame size={16} className="text-orange-400" /></div>
                    <p className="text-2xl font-extrabold text-white">{plan.calories}</p>
                    <p className="text-xs text-gray-500">kcal / day</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1"><Dumbbell size={16} className="text-blue-400" /></div>
                    <p className="text-2xl font-extrabold text-white">{plan.protein}g</p>
                    <p className="text-xs text-gray-500">protein / day</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1"><Zap size={16} className="text-yellow-400" /></div>
                    <p className="text-2xl font-extrabold text-white">{plan.ironMg}mg</p>
                    <p className="text-xs text-gray-500">iron / day</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 custom-scrollbar">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-3.5 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-500 hover:text-white'}`}>
                        {React.createElement(MEAL_ICONS[tab] || Utensils, { size: 14 })}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Meal content */}
            <div className={`m-5 p-5 rounded-2xl border ${MEAL_COLORS[activeTab] || 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <MealIcon size={18} className="text-teal-400" />
                    <h4 className="font-bold text-white capitalize">{activeTab}</h4>
                </div>
                <ul className="space-y-2">
                    {(plan.meals[activeTab] || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Iron foods */}
            {plan.ironFoods && (
                <div className="mx-5 mb-5 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                    <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">Iron-rich Foods to Include</p>
                    <div className="flex flex-wrap gap-2">
                        {plan.ironFoods.map(f => <span key={f} className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-2.5 py-1 rounded-lg">{f}</span>)}
                    </div>
                </div>
            )}

            {plan.note && <p className="mx-5 mb-5 text-xs text-gray-600 italic">{plan.note}</p>}
        </motion.div>
    );
};

export default NutritionPlan;
