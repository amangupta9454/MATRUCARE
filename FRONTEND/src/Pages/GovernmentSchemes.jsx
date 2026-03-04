import React from 'react';
import { motion } from 'framer-motion';
import { Shield, IndianRupee, FileText, ArrowRight, BookOpen } from 'lucide-react';
import SchemeEligibilityForm from '../Components/SchemeEligibilityForm';

const SCHEME_CARDS = [
    { name: 'PMMVY', full: 'Pradhan Mantri Matru Vandana Yojana', color: 'border-green-500/30 bg-green-500/5', amount: '₹5,000', desc: 'Cash incentive for first-time mothers to offset wage loss, encourage institutional delivery and good health practices.' },
    { name: 'JSY', full: 'Janani Suraksha Yojana', color: 'border-blue-500/30  bg-blue-500/5', amount: '₹1,400', desc: 'Cash assistance for below-poverty-line mothers for institutional delivery in empanelled hospitals.' },
    { name: 'JSSK', full: 'Janani Shishu Suraksha Karyakram', color: 'border-purple-500/30 bg-purple-500/5', amount: 'FREE', desc: 'Free delivery, C-section, drugs, diagnostics, transport and blood at government health facilities.' },
    { name: 'POSHAN', full: 'Poshan Abhiyaan', color: 'border-orange-500/30 bg-orange-500/5', amount: 'Nutrition', desc: 'Supplementary nutrition, IFA tablets, and growth monitoring for pregnant women via Anganwadi centres.' },
];

const GovernmentSchemes = () => (
    <div className="max-w-5xl mx-auto py-10 px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-500/20 border border-green-500/30 p-3 rounded-xl"><Shield size={24} className="text-green-400" /></div>
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Government Schemes</h1>
                    <p className="text-gray-500">Welfare programs available for expecting mothers in India</p>
                </div>
            </div>
        </motion.div>

        {/* Scheme overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {SCHEME_CARDS.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className={`glass-card border p-5 ${s.color}`}>
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{s.name}</span>
                            <h3 className="font-extrabold text-white text-base mt-0.5">{s.full}</h3>
                        </div>
                        <div className="shrink-0 bg-white/10 border border-white/20 px-3 py-1 rounded-xl">
                            <p className="text-sm font-extrabold text-white">{s.amount}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400">{s.desc}</p>
                </motion.div>
            ))}
        </div>

        {/* Eligibility Checker */}
        <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-white mb-1">Check Your Eligibility</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in a few details to see which schemes you qualify for. If you're logged in, we'll save your results and email you a report.</p>
            <SchemeEligibilityForm />
        </div>
    </div>
);

export default GovernmentSchemes;
