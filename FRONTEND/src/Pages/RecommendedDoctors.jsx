import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, User, BriefcaseMedical, Search } from 'lucide-react';
import RecommendationCard from '../Components/RecommendationCard';
import AppointmentForm from '../Components/AppointmentForm';
import { AnimatePresence } from 'framer-motion';

const GENDER_OPTS = ['Any', 'Female', 'Male'];
const SPECIALIZATIONS = [
    'All', 'Gynecologist', 'Obstetrician', 'Pediatrician', 'General Physician',
    'Cardiologist', 'Dermatologist', 'Psychiatrist', 'Nutritionist', 'Orthopedic',
];

const RecommendedDoctors = ({ limit }) => {
    const { user } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gender, setGender] = useState(user?.gender === 'Male' ? 'Male' : user?.gender === 'Female' ? 'Female' : 'Any');
    const [specialization, setSpec] = useState('All');
    const [searchLoc, setSearchLoc] = useState('');
    const [searchLocInput, setLocInput] = useState('');
    const [selectedDoctor, setSelected] = useState(null);
    const [showSuccess, setSuccess] = useState(false);

    const fetchDoctors = async (g = gender, spec = specialization, loc = searchLoc) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...(g !== 'Any' && { gender: g }),
                ...(spec !== 'All' && { specialization: spec }),
                ...(loc && { location: loc }),
            });
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/recommendations?${params}`);
            setDoctors(limit ? data.slice(0, limit) : data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchDoctors(); }, []);

    const handleGender = g => { setGender(g); fetchDoctors(g, specialization, searchLoc); };
    const handleSpec = s => { setSpec(s); fetchDoctors(gender, s, searchLoc); };
    const handleLocSearch = () => { setSearchLoc(searchLocInput); fetchDoctors(gender, specialization, searchLocInput); };

    const handleBookSuccess = () => { setSelected(null); setSuccess(true); setTimeout(() => setSuccess(false), 5000); };

    // ── Compact mode (used in Home page) ────────────────────────────────
    if (limit) return (
        <div className="space-y-3">
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
                </div>
            ) : doctors.map((d, i) => (
                <RecommendationCard key={d._id} doctor={d} index={i}
                    onBook={user?.role === 'Mother' ? setSelected : undefined} />
            ))}
        </div>
    );

    // ── Full page mode ───────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                    <div className="bg-teal-500/20 border border-teal-500/30 p-2.5 rounded-xl">
                        <Sparkles size={22} className="text-teal-400" />
                    </div>
                    Smart Doctor Recommendations
                </h1>
                <p className="text-gray-500 text-sm mt-1">Ranked by rating, experience, and availability</p>
            </div>

            {showSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                    ✅ Appointment booked successfully! Check your dashboard.
                </div>
            )}

            {/* Filters */}
            <div className="glass-card p-5 space-y-4 border border-white/10">
                {/* Gender preference */}
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <User size={12} /> Preferred Doctor Gender
                    </p>
                    <div className="flex gap-2">
                        {GENDER_OPTS.map(g => (
                            <button key={g} onClick={() => handleGender(g)}
                                className={`px-4 py-1.5 rounded-xl text-sm font-bold border transition-all ${gender === g ? 'bg-teal-600 border-teal-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                                {g === 'Female' ? '👩 Female' : g === 'Male' ? '👨 Male' : '🌐 Any'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Specialization */}
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <BriefcaseMedical size={12} /> Specialization
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        {SPECIALIZATIONS.map(s => (
                            <button key={s} onClick={() => handleSpec(s)}
                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${specialization === s ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location search */}
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Search size={12} /> Hospital / Location
                    </p>
                    <div className="flex gap-2">
                        <input value={searchLocInput} onChange={e => setLocInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleLocSearch(); }}
                            placeholder="Search by hospital name…" className="dark-input flex-1 text-sm py-2" />
                        <button onClick={handleLocSearch}
                            className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl transition-all">
                            <Search size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{doctors.length} doctors found</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-14">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
                </div>
            ) : doctors.length === 0 ? (
                <div className="glass-card p-14 text-center">
                    <Sparkles className="mx-auto h-12 w-12 text-gray-700 mb-3" />
                    <p className="text-white font-bold">No doctors found</p>
                    <p className="text-sm text-gray-500 mt-1">Try changing your filters</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {doctors.map((d, i) => (
                        <RecommendationCard key={d._id} doctor={d} index={i}
                            onBook={user?.role === 'Mother' ? setSelected : undefined} />
                    ))}
                </div>
            )}

            {/* Appointment modal */}
            <AnimatePresence>
                {selectedDoctor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }} className="glass-card-elevated p-0 w-full max-w-2xl">
                            <AppointmentForm doctor={selectedDoctor} onSuccess={handleBookSuccess}
                                onClose={() => setSelected(null)} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RecommendedDoctors;
