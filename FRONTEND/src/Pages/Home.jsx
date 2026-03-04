import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../Components/AuthContext';
import {
    HeartPulse, Stethoscope, UserCheck, Calendar, Shield, Clock,
    Star, ArrowRight, Baby, Ambulance, Bell, BriefcaseMedical,
    ChevronRight, CheckCircle2, Users, MapPin, Activity
} from 'lucide-react';
import RecommendedDoctors from './RecommendedDoctors';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
});

// Compact wrapper used on the home page — shows top 3 recommended doctors
const TopRatedDoctors = () => <RecommendedDoctors limit={3} />;

const Home = () => {
    const { user } = useContext(AuthContext);

    const features = [
        {
            icon: <Stethoscope className="w-7 h-7 text-teal-400" />,
            color: 'from-teal-500/20 to-teal-600/10 border-teal-500/20',
            title: 'Doctor Consultations',
            description: 'Book appointments with verified OB-GYN specialists, pediatricians & maternal health experts in seconds.',
        },
        {
            icon: <Baby className="w-7 h-7 text-purple-400" />,
            color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
            title: 'Pregnancy Tracking',
            description: 'Monitor your week-by-week pregnancy journey with AI-driven insights and milestone alerts.',
        },
        {
            icon: <Users className="w-7 h-7 text-blue-400" />,
            color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
            title: 'ASHA Worker Connect',
            description: 'Your assigned ASHA worker is one tap away for community visits, nutrition guidance & emergency escalation.',
        },
        {
            icon: <Shield className="w-7 h-7 text-green-400" />,
            color: 'from-green-500/20 to-green-600/10 border-green-500/20',
            title: 'Encrypted Health Records',
            description: 'Your medical data, reports and prescriptions are securely stored with cloud-grade encryption.',
        },
        {
            icon: <Bell className="w-7 h-7 text-orange-400" />,
            color: 'from-orange-500/20 to-orange-600/10 border-orange-500/20',
            title: 'Smart Reminders',
            description: 'Never miss a checkup. Get SMS and email reminders for appointments, medicines and tests.',
        },
        {
            icon: <Ambulance className="w-7 h-7 text-red-400" />,
            color: 'from-red-500/20 to-red-600/10 border-red-500/20',
            title: 'Emergency Alerts',
            description: 'One-tap emergency contact that notifies your doctor, ASHA worker and family simultaneously.',
        },
    ];

    const howItWorks = [
        { step: '01', role: 'Mother', title: 'Register & Book', desc: 'Create your profile, browse verified doctors, and book appointments in under 2 minutes.' },
        { step: '02', role: 'Doctor', title: 'Review & Confirm', desc: 'Doctors review patient details, approve or suggest rescheduling, and prepare for the consultation.' },
        { step: '03', role: 'ASHA', title: 'Community Follow-up', desc: 'ASHA workers conduct home visits, report vitals, and flag high-risk cases to doctors proactively.' },
    ];

    const stats = [
        { value: '10,000+', label: 'Mothers Served', icon: <HeartPulse size={20} className="text-teal-400" /> },
        { value: '500+', label: 'Verified Doctors', icon: <Stethoscope size={20} className="text-purple-400" /> },
        { value: '1,200+', label: 'ASHA Workers', icon: <Users size={20} className="text-blue-400" /> },
        { value: '98%', label: 'Positive Outcomes', icon: <Activity size={20} className="text-green-400" /> },
    ];

    const testimonials = [
        { name: 'Priya S.', role: 'Mother, Mumbai', text: 'MaaCare made my entire pregnancy journey stress-free. I could see my doctor anytime and my ASHA didi was always available!', avatar: 'PS' },
        { name: 'Dr. Anjali R.', role: 'Gynecologist, Delhi', text: 'Managing my patient appointments is now seamless. The system handles reminders, cancellations and records automatically.', avatar: 'DR' },
        { name: 'Sunita D.', role: 'ASHA Worker, Bihar', text: "I can now report high-risk mothers directly to doctors on the app. It's changed how we work in the field.", avatar: 'SD' },
    ];

    const forRoles = [
        {
            title: 'For Mothers',
            color: 'teal',
            border: 'border-teal-500/30',
            glow: 'shadow-teal-500/10',
            icon: <Baby size={24} className="text-teal-400" />,
            points: ['Browse & book verified doctors', 'Track appointments with unique ID', 'Cancel/reschedule with 24h notice', 'Receive email confirmations', 'View prescription history'],
        },
        {
            title: 'For Doctors',
            color: 'purple',
            border: 'border-purple-500/30',
            glow: 'shadow-purple-500/10',
            icon: <BriefcaseMedical size={24} className="text-purple-400" />,
            points: ['Create a verified public profile', 'Approve/reject appointment requests', 'Reschedule with patient notification', 'View patient health history', 'Manage availability calendar'],
        },
        {
            title: 'For ASHA Workers',
            color: 'blue',
            border: 'border-blue-500/30',
            glow: 'shadow-blue-500/10',
            icon: <MapPin size={24} className="text-blue-400" />,
            points: ['View assigned mothers\' health data', 'Report vitals and home visit outcomes', 'Flag high-risk pregnancies', 'Direct escalation to doctors', 'Community health tracking'],
        },
    ];

    return (
        <div className="overflow-x-hidden">

            {/* ── HERO ── */}
            <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4 py-20">
                {/* Ambient glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-teal-500/10 rounded-full blur-[120px]" />
                </div>

                <motion.div className="relative z-10 max-w-5xl mx-auto" {...fadeUp()}>
                    <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                        AI-Powered Maternal Healthcare · India
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6">
                        Every Mother Deserves{' '}
                        <span className="gradient-text">Expert Care</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                        MaaCare connects mothers with top doctors and ASHA health workers — from booking appointments to post-natal care, all in one platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {user ? (
                            <Link to={`/dashboard/${user.role.toLowerCase()}`}
                                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-teal-500/20 transition-all hover:-translate-y-1">
                                Go to Dashboard <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-teal-500/20 transition-all hover:-translate-y-1">
                                    Get Started Free <ArrowRight size={20} />
                                </Link>
                                <Link to="/doctors" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:-translate-y-1">
                                    Browse Doctors <ChevronRight size={20} />
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* ── STATS ── */}
            <section className="py-12 px-4 border-y border-white/5">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((s, i) => (
                        <motion.div key={i} {...fadeUp(i * 0.1)} className="text-center glass-card p-6">
                            <div className="flex justify-center mb-2">{s.icon}</div>
                            <div className="text-3xl font-extrabold text-white mb-1">{s.value}</div>
                            <div className="text-sm text-gray-500">{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp()} className="text-center mb-16">
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Platform Features</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 mb-4">Everything You Need</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">End-to-end maternal healthcare management — from first trimester to post-natal recovery.</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div key={i} {...fadeUp(i * 0.08)}
                                className={`glass-card bg-gradient-to-br ${f.color} p-7 hover:scale-[1.02] transition-transform duration-300`}>
                                <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-white/10">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">{f.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <motion.div {...fadeUp()} className="text-center mb-16">
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Simple Flow</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 mb-4">How It Works</h2>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {howItWorks.map((step, i) => (
                            <motion.div key={i} {...fadeUp(i * 0.12)} className="glass-card p-8 text-center group hover:border-teal-500/30 transition-colors">
                                <div className="text-5xl font-extrabold text-teal-500/30 group-hover:text-teal-500/50 transition-colors mb-4">{step.step}</div>
                                <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">{step.role}</span>
                                <h3 className="text-xl font-bold text-white mt-4 mb-2">{step.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOR EACH ROLE ── */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp()} className="text-center mb-16">
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Role-Based Features</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 mb-4">Built for Everyone</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Tailored dashboards for mothers, doctors and ASHA workers.</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {forRoles.map((role, i) => (
                            <motion.div key={i} {...fadeUp(i * 0.1)}
                                className={`glass-card border ${role.border} shadow-xl ${role.glow} p-8 hover:scale-[1.02] transition-transform duration-300`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">{role.icon}</div>
                                    <h3 className="text-xl font-extrabold text-white">{role.title}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {role.points.map((point, j) => (
                                        <li key={j} className="flex items-start gap-2.5 text-sm text-gray-400">
                                            <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp()} className="text-center mb-16">
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Testimonials</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3">Trusted by Thousands</h2>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div key={i} {...fadeUp(i * 0.1)} className="glass-card p-8 hover:border-teal-500/20 transition-colors">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, s) => <Star key={s} size={14} className="text-yellow-400 fill-yellow-400" />)}
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-sm">{t.name}</div>
                                        <div className="text-gray-500 text-xs">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TOP RATED DOCTORS ── */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                                ⭐ Recommended
                            </span>
                            <h2 className="text-3xl font-extrabold text-white mt-3">Top Rated Doctors</h2>
                            <p className="text-gray-500 mt-1 text-sm">Ranked by patient reviews, experience, and availability</p>
                        </div>
                        <Link to="/recommended-doctors"
                            className="hidden sm:flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300 font-bold transition-colors">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <TopRatedDoctors />
                    <div className="mt-4 text-center sm:hidden">
                        <Link to="/recommended-doctors" className="text-sm text-teal-400 font-bold">View All Doctors →</Link>
                    </div>
                </div>
            </section>

            {/* ── COMMUNITY FORUM CTA ── */}
            <section className="py-10 px-4">
                <div className="max-w-4xl mx-auto glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-500/20">
                    <div>
                        <h3 className="text-xl font-extrabold text-white">Join the Community Forum</h3>
                        <p className="text-gray-400 text-sm mt-1">Discuss pregnancy, health tips, and more with other mothers and experts.</p>
                    </div>
                    <Link to="/forum"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm">
                        Enter Forum <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto glass-card text-center p-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-purple-500/5 pointer-events-none" />
                    <div className="relative z-10">
                        <HeartPulse size={48} className="text-teal-400 mx-auto mb-6" />
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Start Your Journey Today</h2>
                        <p className="text-gray-400 mb-10 text-lg">Join thousands of families who trust MaaCare for safe pregnancy and maternal health management.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!user && (
                                <Link to="/register" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-teal-500/20 transition-all hover:-translate-y-1">
                                    Register for Free <ArrowRight size={20} />
                                </Link>
                            )}
                            <Link to="/doctors" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:-translate-y-1">
                                Browse Doctors <ChevronRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
