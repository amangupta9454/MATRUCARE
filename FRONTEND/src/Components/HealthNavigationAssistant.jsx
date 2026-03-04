import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, ArrowRight, Activity, Calendar, UserCheck, Search } from 'lucide-react';
import axios from 'axios';

const HealthNavigationAssistant = () => {
    const [condition, setCondition] = useState('');
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!condition) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/navigation/journey?condition=${condition}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJourney(res.data.journey);
        } catch (error) {
            console.error('Failed to fetch journey', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl mb-4">
                    <Map size={32} />
                </div>
                <h2 className="text-3xl font-bold font-heading text-white mb-2">Health Navigation Assistant</h2>
                <p className="text-gray-400 text-lg">Your step-by-step personalized healthcare journey guide.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl mx-auto mb-12">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Activity className="text-emerald-400" size={20} />
                    </div>
                    <input
                        type="text"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        placeholder="E.g., Anemia, Diabetes, Pregnancy..."
                        className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-lg"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !condition}
                    className="px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? 'Mapping...' : <><Search size={20} /> Navigate</>}
                </button>
            </form>

            {journey && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 relative"
                >
                    <div className="absolute left-[39px] top-10 bottom-10 w-1 bg-gradient-to-b from-emerald-500/50 to-emerald-500/10 rounded-full z-0 hidden md:block" />

                    <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4 inline-block">{journey.title}</h3>

                    {journey.steps.map((step, index) => (
                        <motion.div
                            key={step.stepNumber}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col md:flex-row gap-6 relative z-10"
                        >
                            <div className="hidden md:flex flex-shrink-0 w-20 h-20 rounded-2xl bg-black border-2 border-emerald-500 items-center justify-center font-bold text-2xl text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                {step.stepNumber}
                            </div>

                            <div className="flex-1 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-6 group cursor-default">
                                <div className="md:hidden w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl mb-4">
                                    {step.stepNumber}
                                </div>
                                <h4 className="text-xl font-semibold text-white mb-4 group-hover:text-emerald-300 transition-colors">{step.action}</h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 text-gray-300 bg-black/20 p-3 rounded-xl">
                                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><UserCheck size={18} /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Specialist</p>
                                            <p className="text-sm font-medium">{step.doctorSpecialty}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300 bg-black/20 p-3 rounded-xl">
                                        <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Activity size={18} /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Category</p>
                                            <p className="text-sm font-medium">{step.serviceCategory}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300 bg-black/20 p-3 rounded-xl">
                                        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg"><Calendar size={18} /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Timeline</p>
                                            <p className="text-sm font-medium">{step.estimatedTimeline}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="pt-8 text-center">
                        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 flex items-center gap-2 mx-auto">
                            Find Recommended Doctors <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default HealthNavigationAssistant;
