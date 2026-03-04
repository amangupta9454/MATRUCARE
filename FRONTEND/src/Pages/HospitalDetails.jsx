import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, BedDouble, ArrowLeft, Stethoscope, Users } from 'lucide-react';
import HospitalServiceCard from '../Components/HospitalServiceCard';
import HospitalBookingForm from '../Components/HospitalBookingForm';

const HospitalDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [services, setServices] = useState([]);
    const [beds, setBeds] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null); // For booking modal

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/hospitals/${id}`);
            const data = await res.json();
            if (data.success) {
                setHospital(data.hospital);
                setServices(data.services);
                setBeds(data.beds);
            }
        } catch (error) {
            console.error('Error fetching details', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;
    if (!hospital) return <div className="min-h-screen flex items-center justify-center text-white bg-gray-950">Hospital not found</div>;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-24 md:pb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-96 bg-blue-900/10 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10 pt-16 md:pt-4">
                <button
                    onClick={() => navigate('/hospitals')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold"
                >
                    <ArrowLeft size={16} /> Back to Hospitals
                </button>

                {/* Header Profile */}
                <div className="glass-card border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                    <img
                        src={hospital.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${hospital.hospitalName}`}
                        alt={hospital.hospitalName}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-2 border-white/20 shadow-2xl shrink-0"
                    />
                    <div className="flex-1">
                        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">{hospital.hospitalName}</h1>
                        <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm lg:text-base">
                            <MapPin size={16} className="text-teal-500" /> {hospital.address}, {hospital.city}, {hospital.state}
                        </p>
                        <p className="text-gray-400 mt-1 flex items-center gap-2 text-sm lg:text-base mb-4">
                            <Phone size={16} className="text-blue-500" /> +91 {hospital.phone}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {hospital.specialties?.map((spec, i) => (
                                <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                                    {spec}
                                </span>
                            ))}
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed">
                            {hospital.hospitalDescription || 'Providing priority maternal care and comprehensive medical services.'}
                        </p>
                    </div>

                    <div className="glass-card bg-black/40 border border-white/5 p-4 rounded-2xl md:w-64 shrink-0 text-center">
                        <BedDouble size={32} className="text-blue-400 mx-auto mb-2" />
                        <h3 className="text-2xl font-black text-white">{hospital.numberOfBeds}</h3>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Total Capacity</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Col: Services & Doctors */}
                    <div className="xl:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Stethoscope className="text-teal-400" /> Available Services
                            </h2>
                            {services.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {services.map((svc) => (
                                        <HospitalServiceCard key={svc._id} service={svc} onBook={(s) => setSelectedService(s)} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No specific services listed currently.</p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Users className="text-blue-400" /> Featured Doctors
                            </h2>
                            {hospital.doctors && hospital.doctors.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {hospital.doctors.map((doc, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                                            <img src={doc.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${doc.doctorName}`} className="w-12 h-12 rounded-full object-cover border border-white/10" alt={doc.doctorName} />
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{doc.doctorName}</h4>
                                                <p className="text-xs text-gray-400">{doc.specialization} • {doc.experience} Yrs</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No doctors listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Bed Availability */}
                    <div className="space-y-6">
                        <div className="glass-card border border-white/10 p-6 rounded-3xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <BedDouble className="text-pink-400" /> Real-time Bed Status
                            </h3>

                            {beds ? (
                                <div className="space-y-4">
                                    <BedStat label="General Beds" data={beds.generalBeds} color="bg-teal-500" />
                                    <BedStat label="Delivery Beds" data={beds.deliveryBeds} color="bg-pink-500" />
                                    <BedStat label="ICU Beds" data={beds.ICUBeds} color="bg-red-500" />
                                    <BedStat label="Emergency Beds" data={beds.emergencyBeds} color="bg-orange-500" />
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Bed tracking not updated.</p>
                            )}

                            <button
                                onClick={() => setSelectedService({ serviceName: 'General Admission / Emergency' })}
                                className="w-full mt-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Request Admission
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedService && (
                <HospitalBookingForm
                    hospitalId={hospital._id}
                    service={selectedService}
                    onClose={() => setSelectedService(null)}
                />
            )}
        </div>
    );
};

const BedStat = ({ label, data, color }) => {
    const available = (data?.total || 0) - (data?.occupied || 0);
    const percent = data?.total ? (data?.occupied / data?.total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-300 font-medium">{label}</span>
                <span className="font-bold text-white">{available} Available</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{data?.total || 0} Total</span>
                <span>{data?.occupied || 0} Occupied</span>
            </div>
        </div>
    );
};

export default HospitalDetails;
