import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, MapPin, Calendar, BriefcaseMedical, Building2, Phone, LogIn, Lock, User, Sparkles } from 'lucide-react';
import AppointmentForm from '../Components/AppointmentForm';
import { Link } from 'react-router-dom';

const Doctors = () => {
    const { user } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showGuard, setShowGuard] = useState(false);
    const [genderFilter, setGenderFilter] = useState('Any'); // Any | Female | Male
    const [reviewStats, setReviewStats] = useState({}); // doctorId -> { avgRating, reviewCount }

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/doctors`);
                const listed = res.data.filter(d => d.isListed);
                setDoctors(listed);
                // Fetch review stats in bulk via recommendations endpoint
                const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/recommendations`);
                const map = {};
                statsRes.data.forEach(d => { map[d._id] = { avgRating: d.avgRating, reviewCount: d.reviewCount }; });
                setReviewStats(map);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const specialties = ['All', ...new Set(doctors.map(d => d.specialistType).filter(Boolean))];

    const filteredDoctors = doctors.filter(doc => {
        const name = doc.user?.name?.toLowerCase() || '';
        const spec = (doc.specialization || '').toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase()) || spec.includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || doc.specialistType === selectedSpecialty;
        const matchesGender = genderFilter === 'Any' || doc.gender === genderFilter;
        return matchesSearch && matchesSpecialty && matchesGender;
    });

    // Sort: preferred gender first, then by avg rating desc
    const sortedDoctors = [...filteredDoctors].sort((a, b) => {
        const ra = reviewStats[a._id]?.avgRating || 0;
        const rb = reviewStats[b._id]?.avgRating || 0;
        return rb - ra;
    });

    const handleBookingSuccess = () => {
        setSelectedDoctor(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    const handleBookClick = (doc) => {
        if (!user) {
            setShowGuard(true);
            return;
        }
        if (user.role !== 'Mother') {
            setShowGuard(true);
            return;
        }
        setSelectedDoctor(doc);
    };

    return (
        <div className="min-h-screen py-12 px-4">

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-8 py-4 rounded-full shadow-2xl shadow-teal-500/30 z-50 flex items-center gap-3 font-bold"
                    >
                        <Star className="text-yellow-300 fill-current" size={20} />
                        Appointment Booked! Check your email for confirmation.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Guard Modal – non-Mother users */}
            <AnimatePresence>
                {showGuard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card-elevated p-10 w-full max-w-sm text-center">
                            <div className="bg-teal-500/20 border border-teal-500/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
                                <Lock size={28} className="text-teal-400" />
                            </div>
                            <h3 className="text-xl font-extrabold text-white mb-2">
                                {user ? 'Patients Only' : 'Login Required'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-7">
                                {user
                                    ? `Only registered mothers can book appointments. You are logged in as ${user.role}.`
                                    : 'Please log in with a Mother account to book an appointment.'}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowGuard(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors">
                                    Close
                                </button>
                                {!user && (
                                    <Link to="/register" className="flex-1 py-3 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white transition-colors text-center">
                                        Register
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedDoctor && (
                    <AppointmentForm
                        doctor={selectedDoctor}
                        onClose={() => setSelectedDoctor(null)}
                        onSuccess={handleBookingSuccess}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <span className="inline-block text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                        Verified Specialists
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Find Your <span className="gradient-text">Specialist</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Connect with India's top maternal healthcare professionals. Get expert care for every stage of motherhood.
                    </p>
                </motion.div>
            </div>

            {/* Search + Filters */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none text-white placeholder-gray-500 dark-input"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto custom-scrollbar">
                    {specialties.map(spec => (
                        <button
                            key={spec}
                            onClick={() => setSelectedSpecialty(spec)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${selectedSpecialty === spec
                                ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-500/20'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {spec}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gender filter */}
            <div className="max-w-7xl mx-auto mb-6 flex items-center gap-3">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1"><User size={12} /> Doctor Gender:</span>
                {['Any', 'Female', 'Male'].map(g => (
                    <button key={g} onClick={() => setGenderFilter(g)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${genderFilter === g ? 'bg-teal-600 border-teal-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                        {g === 'Female' ? '👩 Female' : g === 'Male' ? '👨 Male' : '🌐 Any'}
                    </button>
                ))}
                <Link to="/recommended-doctors" className="ml-auto flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-bold transition-colors">
                    <Sparkles size={12} /> Smart Recommendations →
                </Link>
            </div>

            {/* Doctors Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                    </div>
                ) : sortedDoctors.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <p className="text-gray-500 text-lg">No doctors found.</p>
                        {doctors.length === 0 && <p className="text-gray-600 text-sm mt-2">Doctors will appear here once they complete their profile.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedDoctors.map((doc, idx) => (
                            <motion.div
                                key={doc._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.07 }}
                                className="glass-card overflow-hidden flex flex-col group hover:border-teal-500/30 transition-all duration-300"
                            >
                                {/* Card Top */}
                                <div className="p-6 flex gap-5 items-start">
                                    <div className="relative shrink-0">
                                        <img
                                            src={doc.user?.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${doc.user?.name}`}
                                            alt={doc.user?.name}
                                            className="w-20 h-20 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <span className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-[#060d14] flex items-center justify-center">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="font-bold text-lg text-white truncate">Dr. {doc.user?.name}</h2>
                                        <p className="text-teal-400 text-sm font-medium flex items-center gap-1 mt-0.5">
                                            <BriefcaseMedical size={13} /> {doc.specialistType || doc.specialization || 'Specialist'}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1 truncate">
                                            {doc.qualifications?.length > 0 ? doc.qualifications.join(', ') : 'MBBS'}
                                        </p>
                                        <div className="flex gap-2 mt-3 flex-wrap">
                                            {doc.experienceYears > 0 && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1">
                                                    <Star size={10} className="text-yellow-400 fill-current" /> {doc.experienceYears} Yrs
                                                </span>
                                            )}
                                            {doc.consultationFee > 0 && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300">
                                                    ₹{doc.consultationFee}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Info */}
                                <div className="px-6 pb-4 space-y-2 flex-1 border-t border-white/5 pt-4">
                                    {doc.currentOrganization && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Building2 size={13} className="text-gray-600 shrink-0" />
                                            <span className="truncate">{doc.currentOrganization}</span>
                                        </div>
                                    )}
                                    {doc.availableDays?.length > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar size={13} className="text-gray-600 shrink-0" />
                                            <span className="truncate">{doc.availableDays.join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-4 pt-0 flex gap-3">
                                    {doc.mobile && (
                                        <a href={`tel:${doc.mobile}`} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/30 transition-all shrink-0">
                                            <Phone size={16} />
                                        </a>
                                    )}
                                    <Link to={`/doctors/${doc._id}/reviews`}
                                        className="flex items-center justify-center px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-yellow-400 hover:border-yellow-500/30 transition-all text-xs font-bold gap-1">
                                        <Star size={12} className="fill-yellow-400" />
                                        {reviewStats[doc._id]?.avgRating?.toFixed(1) || '—'}
                                    </Link>
                                    <button
                                        onClick={() => handleBookClick(doc)}
                                        className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all"
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;
