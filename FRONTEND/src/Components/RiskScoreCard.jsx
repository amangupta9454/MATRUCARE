import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

const riskTheme = {
    Low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', ring: '#22c55e', icon: ShieldCheck, label: 'Low Risk', desc: 'Your pregnancy health indicators are within safe parameters.' },
    Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', ring: '#eab308', icon: AlertTriangle, label: 'Medium Risk', desc: 'Some factors require monitoring. Stay in regular touch with your doctor.' },
    High: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', ring: '#ef4444', icon: ShieldAlert, label: 'High Risk', desc: 'Immediate medical attention recommended. Your doctor has been notified.' },
};

const RiskScoreCard = ({ score = 0, level = 'Low', factors = [] }) => {
    const theme = riskTheme[level] || riskTheme.Low;
    const Icon = theme.icon;

    // SVG ring
    const R = 54, C = 2 * Math.PI * R;
    const progress = C - (score / 100) * C;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`glass-card p-6 border ${theme.border}`}>
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Ring */}
                <div className="relative shrink-0">
                    <svg width="140" height="140" viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                        <circle cx="70" cy="70" r={R} fill="none" stroke={theme.ring} strokeWidth="14"
                            strokeDasharray={C} strokeDashoffset={progress}
                            strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-extrabold ${theme.color}`}>{score}</span>
                        <span className="text-xs text-gray-500 font-bold">/100</span>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${theme.bg} ${theme.border} ${theme.color} mb-3`}>
                        <Icon size={16} />{theme.label}
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-1">Risk Assessment</h3>
                    <p className="text-gray-400 text-sm mb-4">{theme.desc}</p>

                    {factors.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detected Risk Factors</p>
                            <div className="flex flex-wrap gap-2">
                                {factors.map(f => (
                                    <span key={f} className={`text-xs px-3 py-1 rounded-lg border ${theme.bg} ${theme.border} ${theme.color} font-medium`}>
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default RiskScoreCard;
