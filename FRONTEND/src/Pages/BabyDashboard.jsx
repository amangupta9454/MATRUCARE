import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion } from 'framer-motion';
import { Baby, Syringe, TrendingUp, PlusCircle } from 'lucide-react';
import BabyProfileForm from '../Components/BabyProfileForm';
import VaccinationTracker from '../Components/VaccinationTracker';
import GrowthChart from '../Components/GrowthChart';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Baby },
    { id: 'profile', label: 'Baby Profile', icon: Baby },
    { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
    { id: 'growth', label: 'Growth Chart', icon: TrendingUp },
];

const BabyDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [baby, setBaby] = useState(null);
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(true);

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        const [babyRes, vacRes] = await Promise.allSettled([
            axios.get(`${import.meta.env.VITE_API_URL}/baby`, { headers: authHeader }),
            axios.get(`${import.meta.env.VITE_API_URL}/baby-vaccines`, { headers: authHeader }),
        ]);
        if (babyRes.status === 'fulfilled') setBaby(babyRes.value.data);
        if (vacRes.status === 'fulfilled') setVaccines(vacRes.value.data);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [token]);

    const ageInDays = baby ? Math.floor((Date.now() - new Date(baby.birthDate)) / 86400000) : 0;
    const ageLabel = ageInDays < 30 ? `${ageInDays} days old` : ageInDays < 365 ? `${Math.floor(ageInDays / 30)} months old` : `${Math.floor(ageInDays / 365)} year(s) old`;

    const pending = vaccines.filter(v => !v.completed);
    const overdue = vaccines.filter(v => !v.completed && new Date(v.dueDate) < new Date());
    const done = vaccines.filter(v => v.completed);

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" /></div>;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 text-slate-800">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Baby Health Dashboard</h1>
                <p className="text-slate-600 mt-1">Welcome, <span className="font-bold text-sky-800">{user?.name}</span>. Track your baby's health and development.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
                {TABS.map(t => {
                    const Icon = t.icon; return (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${activeTab === t.id ? 'bg-pink-600 text-white shadow-sm' : 'bg-white border border-sky-200 text-slate-600 hover:text-pink-700 hover:bg-pink-50'}`}>
                            <Icon size={14} />{t.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {!baby ? (
                        <div className="glass-card p-12 text-center border border-sky-200 bg-white/90">
                            <Baby className="mx-auto h-16 w-16 text-pink-500 mb-4" />
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Create Baby Profile</h3>
                            <p className="text-slate-600 mb-6 font-normal">Set up your baby's profile to unlock vaccination tracking and growth monitoring.</p>
                            <button onClick={() => setActiveTab('profile')} className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm">Get Started →</button>
                        </div>
                    ) : (
                        <>
                            {/* Baby info strip */}
                            <div className="glass-card p-6 border border-pink-200 bg-pink-50/50">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-pink-100 border border-pink-300 flex items-center justify-center text-3xl font-black text-pink-700">
                                        {baby.babyName?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">{baby.babyName}</h2>
                                        <p className="text-slate-600 font-medium">{baby.gender} · {ageLabel} · {baby.bloodGroup || 'Blood group unknown'}</p>
                                        {baby.birthWeight && <p className="text-xs text-slate-500 mt-0.5 font-medium">Birth weight: {baby.birthWeight} kg · Height: {baby.birthHeight} cm</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Vaccines Due', value: pending.length, color: 'border-amber-300 bg-amber-50/80', text: 'text-amber-800' },
                                    { label: 'Overdue', value: overdue.length, color: 'border-rose-300 bg-rose-50/80', text: 'text-rose-700' },
                                    { label: 'Completed', value: done.length, color: 'border-emerald-300 bg-emerald-50/80', text: 'text-emerald-800' },
                                ].map(s => (
                                    <div key={s.label} className={`glass-card p-4 border ${s.color} text-center`}>
                                        <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
                                        <p className="text-xs text-slate-600 font-bold mt-1 uppercase">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Overdue alert */}
                            {overdue.length > 0 && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                                    <p className="font-bold text-red-400">⚠️ {overdue.length} vaccine{overdue.length > 1 ? 's' : ''} overdue!</p>
                                    <p className="text-xs text-red-300/70 mt-0.5">{overdue.map(v => v.vaccineName).join(', ')}</p>
                                    <button onClick={() => setActiveTab('vaccinations')} className="mt-2 text-xs text-red-400 underline">View vaccinations →</button>
                                </div>
                            )}

                            {/* Quick actions */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { tab: 'vaccinations', label: 'Vaccination Tracker', icon: Syringe, color: 'border-purple-500/20 text-purple-400' },
                                    { tab: 'growth', label: 'Growth Chart', icon: TrendingUp, color: 'border-teal-500/20 text-teal-400' },
                                ].map(a => {
                                    const Icon = a.icon; return (
                                        <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                                            className={`glass-card p-5 border ${a.color} flex items-center justify-between hover:scale-[1.02] transition-all`}>
                                            <div className="flex items-center gap-3"><Icon size={18} /><span className="font-bold">{a.label}</span></div>
                                            <span>→</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'profile'}       {<BabyProfileForm onSaved={fetchData} />}
            {activeTab === 'vaccinations' && <VaccinationTracker />}
            {activeTab === 'growth' && <GrowthChart />}
        </div>
    );
};

export default BabyDashboard;
