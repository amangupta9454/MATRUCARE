import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, Send, PhoneCall } from 'lucide-react';
import axios from 'axios';

const EmergencySOSPanel = ({ contacts }) => {
    const [status, setStatus] = useState('idle'); // idle, locating, sending, sent
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const triggerSOS = () => {
        setStatus('locating');

        if (!navigator.geolocation) {
            setErrorMsg('Geolocation is not supported by your browser.');
            setStatus('idle');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            setLocation(loc);
            setStatus('sending');

            try {
                const token = localStorage.getItem('token');
                await axios.post(`${import.meta.env.VITE_API_URL}/emergency/sos`, {
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    riskLevel: 'Critical',
                    message: 'Emergency SOS Button Activated by patient.'
                }, { headers: { Authorization: `Bearer ${token}` } });

                setStatus('sent');
                setTimeout(() => setStatus('idle'), 5000);
            } catch (err) {
                setErrorMsg('Failed to send SOS alert over network.');
                setStatus('idle');
            }
        }, (err) => {
            console.error(err);
            setErrorMsg('Location access denied or unavailable.');
            setStatus('idle');
        });
    };

    return (
        <div className="bg-red-950/40 border border-red-500/30 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl">
            {/* Blinking red background effect */}
            {status !== 'idle' && (
                <motion.div
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-red-500 pointer-events-none z-0"
                />
            )}

            <div className="relative z-10 text-center">
                <div className="flex justify-center mb-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={triggerSOS}
                        disabled={status !== 'idle'}
                        className={`w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 shadow-[0_0_50px_rgba(239,68,68,0.5)] border-4 transition-all duration-300 ${status === 'idle' ? 'bg-red-600 border-red-400 hover:bg-red-500 text-white' :
                                status === 'locating' ? 'bg-orange-500 border-orange-300 text-white' :
                                    status === 'sending' ? 'bg-yellow-500 border-yellow-300 text-white' :
                                        'bg-green-600 border-green-400 text-white shadow-[0_0_50px_rgba(34,197,94,0.5)]'
                            }`}
                    >
                        {status === 'idle' && <><AlertCircle size={48} /><span className="text-2xl font-bold uppercase tracking-wider">SOS</span></>}
                        {status === 'locating' && <><MapPin size={32} className="animate-bounce" /><span className="font-semibold text-sm">Locating...</span></>}
                        {status === 'sending' && <><Send size={32} className="animate-pulse" /><span className="font-semibold text-sm">Sending...</span></>}
                        {status === 'sent' && <><span className="text-xl font-bold uppercase tracking-wider">Sent!</span></>}
                    </motion.button>
                </div>

                <h3 className="text-xl font-bold tracking-wide text-red-100 mb-2">Emergency Assistance</h3>
                <p className="text-red-300 text-sm max-w-md mx-auto mb-6">
                    Pressing the SOS button instantly sends your location to your registered emergency contacts and nearby hospitals.
                </p>

                {errorMsg && <p className="text-red-400 text-sm font-semibold mt-4 bg-red-950/50 p-3 rounded-lg border border-red-500/20">{errorMsg}</p>}

                {status === 'sent' && location && (
                    <div className="bg-black/30 rounded-xl p-4 text-left border border-white/10 mt-6 inline-block w-full max-w-md mx-auto">
                        <div className="flex items-center gap-3 text-red-200 mb-2">
                            <MapPin size={18} className="text-red-400" /> Location Captured
                        </div>
                        <p className="text-gray-400 text-sm font-mono">{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                    </div>
                )}
            </div>

            {contacts && (
                <div className="mt-8 pt-8 border-t border-red-500/20 relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {contacts.doctorPhone && (
                        <a href={`tel:${contacts.doctorPhone}`} className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
                            <PhoneCall size={20} className="text-sky-400" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Doctor</p>
                                <p className="text-sm font-semibold text-white truncate w-24">{contacts.doctorName}</p>
                            </div>
                        </a>
                    )}
                    {contacts.familyContact?.phone && (
                        <a href={`tel:${contacts.familyContact.phone}`} className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
                            <PhoneCall size={20} className="text-pink-400" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Family</p>
                                <p className="text-sm font-semibold text-white truncate w-24">{contacts.familyContact.name}</p>
                            </div>
                        </a>
                    )}
                    {contacts.ashaWorkerPhone && (
                        <a href={`tel:${contacts.ashaWorkerPhone}`} className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
                            <PhoneCall size={20} className="text-emerald-400" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400">ASHA Worker</p>
                                <p className="text-sm font-semibold text-white truncate w-24">{contacts.ashaWorkerName}</p>
                            </div>
                        </a>
                    )}
                    {contacts.phoneNumber && (
                        <a href={`tel:${contacts.phoneNumber}`} className="flex flex-col items-center gap-2 p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl border border-red-500/30 transition-colors">
                            <PhoneCall size={20} className="text-red-400" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Ambulance</p>
                                <p className="text-sm font-bold text-red-200 truncate w-24">{contacts.phoneNumber}</p>
                            </div>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmergencySOSPanel;
