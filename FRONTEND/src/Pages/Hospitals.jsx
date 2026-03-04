import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2 } from 'lucide-react';
import HospitalCard from '../Components/HospitalCard';
import EmergencyHospitalAlert from '../Components/EmergencyHospitalAlert';

const Hospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/hospitals`);
            const data = await res.json();
            if (data.success) {
                setHospitals(data.hospitals);
            }
        } catch (error) {
            console.error('Error fetching hospitals', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = hospitals.filter(h =>
        h.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-24 md:pb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-teal-900/10 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-6 relative z-10 pt-16 md:pt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 flex items-center gap-3">
                            <Building2 size={36} className="text-teal-500" />
                            Registered Hospitals
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm lg:text-base max-w-xl">
                            Find top maternal care hospitals, view bed availability, and book services instantly.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search Bar */}
                        <div className="glass-card border border-white/10 p-2 rounded-2xl flex items-center gap-3 relative z-20">
                            <Search className="text-gray-500 ml-3" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, city, or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none text-white focus:outline-none placeholder-gray-600 text-sm py-2"
                            />
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                            </div>
                        ) : filtered.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filtered.map((hospital, idx) => (
                                    <HospitalCard key={hospital._id} hospital={hospital} index={idx} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No hospitals found matching your search.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <EmergencyHospitalAlert />

                        <div className="glass-card border border-white/10 p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-white mb-4">Why Book with MaaCare?</h3>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                    <span>Verified maternal care specialists and hospitals.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                    <span>Real-time bed availability tracking for emergencies.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                                    <span>Seamless booking and digital health records.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Hospitals;
