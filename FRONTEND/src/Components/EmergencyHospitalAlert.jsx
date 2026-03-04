import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, PhoneCall } from 'lucide-react';

const EmergencyHospitalAlert = () => {
    const [loading, setLoading] = useState(false);

    const handleEmergencyAlert = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const location = `Lat: ${latitude}, Lng: ${longitude}`;
                const res = await fetch(`${import.meta.env.VITE_API_URL}/hospitals/emergency`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        patientName: 'Emergency User',
                        location: location,
                        pregnancyWeek: 'Not Specified',
                        riskLevel: 'High Risk Alert'
                    })
                });
                const data = await res.json();
                if (data.success) {
                    alert('Emergency alert sent to nearby hospitals!');
                } else {
                    alert('Failed to send emergency alert');
                }
            } catch (error) {
                alert('Failed to send emergency alert');
            } finally {
                setLoading(false);
            }
        }, () => {
            alert('Failed to get location. Please allow location access.');
            setLoading(false);
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl -mr-10 -mt-10 rounded-full" />

            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 relative z-10 animate-pulse">
                <AlertTriangle size={32} className="text-red-500" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Smart Emergency Mode</h3>
            <p className="text-gray-400 text-sm mb-6 relative z-10 max-w-sm">
                Instantly find nearest hospitals, send emergency alerts, and notify your regular doctor and emergency contacts.
            </p>

            <button
                onClick={handleEmergencyAlert}
                disabled={loading}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 relative z-10"
            >
                {loading ? 'Sending...' : <><PhoneCall className="animate-pulse" size={20} /> TRIGGER EMERGENCY</>}
            </button>
        </motion.div>
    );
};

export default EmergencyHospitalAlert;
