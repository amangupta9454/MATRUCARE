import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Baby, ShieldCheck, Utensils, FileText, Pill, Syringe,
    CalendarDays, PlusCircle, ChevronRight, AlertTriangle, Clock, CheckCircle2, UserCheck, Users, Shield, Youtube
} from 'lucide-react';
import PregnancyProfileForm from '../Components/PregnancyProfileForm';
import RiskScoreCard from '../Components/RiskScoreCard';
import NutritionPlan from '../Components/NutritionPlan';
import ReportUpload from '../Components/ReportUpload';
import MedicineReminder from '../Components/MedicineReminder';
import EmergencyButton from '../Components/EmergencyButton';
import AshaAssignmentCard from '../Components/AshaAssignmentCard';
import FamilyAccessCard from '../Components/FamilyAccessCard';
import PregnancyVideos from '../Components/PregnancyVideos';

const ANC_WEEKS = [12, 20, 28, 36];
const TABS = [
    { id: 'overview', label: 'Overview', icon: Baby },
    { id: 'profile', label: 'Pregnancy Profile', icon: Baby },
    { id: 'nutrition', label: 'Nutrition Plan', icon: Utensils },
    { id: 'videos', label: 'Videos', icon: Youtube },
    { id: 'reports', label: 'Lab Reports', icon: FileText },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'anc', label: 'ANC & Vaccines', icon: Syringe },
    { id: 'asha', label: 'ASHA Worker', icon: UserCheck },
    { id: 'family', label: 'Family View', icon: Users },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
];


const HealthDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [ancVisits, setAncVisits] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [nutrition, setNutrition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ancLoading, setAncLoading] = useState('');

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
        try {
            const [profRes, ancRes, vacRes, nutRes] = await Promise.allSettled([
                axios.get(`${import.meta.env.VITE_API_URL}/pregnancy/profile`, { headers: authHeader }),
                axios.get(`${import.meta.env.VITE_API_URL}/pregnancy/anc`, { headers: authHeader }),
                axios.get(`${import.meta.env.VITE_API_URL}/pregnancy/vaccinations`, { headers: authHeader }),
                axios.get(`${import.meta.env.VITE_API_URL}/health/nutrition`, { headers: authHeader }),
            ]);
            if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
            if (ancRes.status === 'fulfilled') setAncVisits(ancRes.value.data);
            if (vacRes.status === 'fulfilled') setVaccinations(vacRes.value.data);
            if (nutRes.status === 'fulfilled') setNutrition(nutRes.value.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, [token]);

    const markAnc = async (visitWeek) => {
        setAncLoading(visitWeek);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/pregnancy/anc`, { visitWeek }, { headers: authHeader });
            fetchAll();
        } catch { } finally { setAncLoading(''); }
    };

    const markVaccine = async (vaccineName) => {
        try {
            const fd = new FormData();
            fd.append('vaccineName', vaccineName);
            await axios.put(`${import.meta.env.VITE_API_URL}/pregnancy/vaccination`, fd, { headers: authHeader });
            fetchAll();
        } catch { }
    };

    const weekProgress = profile ? Math.round((profile.pregnancyWeek / 40) * 100) : 0;
    const nextAnc = ancVisits.find(v => !v.completed);
    const pendingVaccines = vaccinations.filter(v => !v.completed).length;

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Health Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.name}. Your maternal health hub.</p>
                </div>
                <Link to="/doctors" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm">
                    <PlusCircle size={16} /> Book Appointment
                </Link>
            </div>

            {/* Quick stats */}
            {profile && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Pregnancy Week', value: `Week ${profile.pregnancyWeek}`, sub: `${40 - profile.pregnancyWeek} weeks to go`, color: 'border-pink-500/30' },
                        { label: 'Risk Level', value: profile.riskLevel, sub: `Score: ${profile.riskScore}/100`, color: profile.riskLevel === 'High' ? 'border-red-500/30' : profile.riskLevel === 'Medium' ? 'border-yellow-500/30' : 'border-green-500/30' },
                        { label: 'Next ANC Visit', value: nextAnc ? `Week ${nextAnc.visitWeek}` : 'All Done ✓', sub: nextAnc ? 'Upcoming check-up' : 'All visits complete', color: 'border-blue-500/30' },
                        { label: 'Vaccines Pending', value: pendingVaccines, sub: `${vaccinations.length - pendingVaccines} completed`, color: 'border-purple-500/30' },
                    ].map(s => (
                        <div key={s.label} className={`glass-card p-4 border ${s.color}`}>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{s.label}</p>
                            <p className="text-2xl font-extrabold text-white mt-1">{s.value}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{s.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab Nav */}
            <div className="flex gap-1 mb-8 overflow-x-auto pb-1 custom-scrollbar">
                {TABS.map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${activeTab === t.id ? 'bg-teal-600 text-white' : 'bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10'}`}>
                            <Icon size={14} />{t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div>
                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {!profile ? (
                            <div className="glass-card p-10 text-center">
                                <Baby className="mx-auto h-14 w-14 text-pink-500/50 mb-4" />
                                <h3 className="text-xl font-extrabold text-white mb-2">Create Your Pregnancy Profile</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">Set up your profile to unlock personalised risk scoring, nutrition plans, and ANC tracking.</p>
                                <button onClick={() => setActiveTab('profile')} className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-xl font-bold transition-all">
                                    Get Started →
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Pregnancy week bar */}
                                <div className="glass-card p-6">
                                    <div className="flex justify-between mb-3">
                                        <span className="text-sm font-bold text-white">Pregnancy Progress — Week {profile.pregnancyWeek}</span>
                                        <span className="text-sm text-gray-500">{weekProgress}%</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${weekProgress}%` }} transition={{ duration: 1.2 }}
                                            className="h-full rounded-full bg-gradient-to-r from-pink-600 to-rose-400" />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                        <span>Week 1</span><span>Week 40</span>
                                    </div>
                                </div>

                                {/* Risk card */}
                                <RiskScoreCard score={profile.riskScore} level={profile.riskLevel} factors={profile.riskFactors || []} />

                                {/* ANC summary */}
                                <div className="glass-card p-6">
                                    <h3 className="font-extrabold text-white mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-blue-400" /> ANC Visit Status</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {ANC_WEEKS.map(w => {
                                            const visit = ancVisits.find(v => v.visitWeek === w);
                                            const done = visit?.completed;
                                            return (
                                                <div key={w} className={`p-4 rounded-2xl border text-center ${done ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                                                    <p className={`text-2xl font-extrabold ${done ? 'text-green-400' : 'text-gray-400'}`}>W{w}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{done ? '✓ Done' : 'Pending'}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quick actions */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { tab: 'nutrition', icon: Utensils, color: 'bg-green-500/10 border-green-500/20 text-green-400', label: 'View Nutrition Plan' },
                                        { tab: 'reports', icon: FileText, color: 'bg-blue-500/10  border-blue-500/20  text-blue-400', label: 'Upload Lab Report' },
                                        { tab: 'emergency', icon: AlertTriangle, color: 'bg-red-500/10   border-red-500/20   text-red-400', label: 'Emergency SOS' },
                                    ].map(a => {
                                        const Icon = a.icon;
                                        return (
                                            <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                                                className={`glass-card p-5 border ${a.color} flex items-center justify-between hover:scale-[1.02] transition-all`}>
                                                <div className="flex items-center gap-3"><Icon size={20} /><span className="font-bold">{a.label}</span></div>
                                                <ChevronRight size={16} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && <PregnancyProfileForm onSaved={fetchAll} />}
                {activeTab === 'nutrition' && (
                    nutrition ? <NutritionPlan plan={nutrition} /> : (
                        <div className="glass-card p-10 text-center text-gray-500">
                            {profile ? 'Loading nutrition plan...' : 'Please create your pregnancy profile first.'}
                        </div>
                    )
                )}
                {activeTab === 'reports' && <ReportUpload />}
                {activeTab === 'medicines' && <MedicineReminder />}

                {/* ANC & Vaccinations */}
                {activeTab === 'anc' && (
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-extrabold text-white mb-5 flex items-center gap-2"><CalendarDays size={18} className="text-blue-400" /> ANC Visit Schedule</h3>
                            <div className="space-y-4">
                                {ANC_WEEKS.map(w => {
                                    const visit = ancVisits.find(v => v.visitWeek === w);
                                    const done = visit?.completed;
                                    return (
                                        <motion.div key={w} className={`flex items-center gap-4 p-4 rounded-2xl border ${done ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 ${done ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}`}>
                                                {w}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-white">Week {w} ANC Visit</p>
                                                <p className="text-xs text-gray-500">
                                                    {done ? `Completed on ${new Date(visit.completedDate).toLocaleDateString('en-IN')}` : 'Pending — Mark when done'}
                                                </p>
                                            </div>
                                            {!done ? (
                                                <button onClick={() => markAnc(w)} disabled={ancLoading === w}
                                                    className="flex items-center gap-1 text-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-70">
                                                    {ancLoading === w ? <Clock size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                    Mark Done
                                                </button>
                                            ) : (
                                                <CheckCircle2 size={22} className="text-green-400 shrink-0" />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-xl font-extrabold text-white mb-5 flex items-center gap-2"><Syringe size={18} className="text-purple-400" /> Vaccination Tracker</h3>
                            <div className="space-y-3">
                                {vaccinations.length === 0 ? (
                                    <p className="text-gray-500 text-center py-6">
                                        {profile ? 'Loading vaccinations...' : 'Create your pregnancy profile first.'}
                                    </p>
                                ) : vaccinations.map(v => (
                                    <div key={v._id} className={`flex items-center gap-4 p-4 rounded-2xl border ${v.completed ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/5 border-white/10'}`}>
                                        <div className={`p-3 rounded-xl ${v.completed ? 'bg-purple-500/20' : 'bg-white/10'}`}>
                                            <Syringe size={18} className={v.completed ? 'text-purple-400' : 'text-gray-500'} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white">{v.vaccineName}</p>
                                            <p className="text-xs text-gray-500">{v.completed ? `Done on ${new Date(v.completedDate).toLocaleDateString('en-IN')}` : 'Not yet administered'}</p>
                                        </div>
                                        {!v.completed ? (
                                            <button onClick={() => markVaccine(v.vaccineName)}
                                                className="text-sm bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 px-4 py-2 rounded-xl font-bold transition-all">
                                                Mark Done
                                            </button>
                                        ) : (
                                            <CheckCircle2 size={20} className="text-purple-400 shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'videos' && <PregnancyVideos />}

                {activeTab === 'asha' && (
                    <div className="space-y-5">
                        <AshaAssignmentCard />
                        <div className="glass-card p-5 border border-green-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-green-500/20 border border-green-500/30 p-2.5 rounded-xl"><Shield size={18} className="text-green-400" /></div>
                                <div><p className="font-bold text-white">Government Schemes</p><p className="text-xs text-gray-500">Check your eligibility for PMMVY, JSY and more</p></div>
                            </div>
                            <Link to="/schemes" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                                Check Eligibility →
                            </Link>
                        </div>
                    </div>
                )}
                {activeTab === 'family' && (
                    <FamilyAccessCard profile={profile} ancVisits={ancVisits} appointments={[]} />
                )}
                {activeTab === 'emergency' && <EmergencyButton />}
            </div>
        </div>
    );
};

export default HealthDashboard;
