import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, CalendarPlus, BedDouble, Activity } from 'lucide-react';

const HospitalDashboard = () => {
    const [hospital, setHospital] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
        fetchBookings();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/hospitals/dashboard/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setHospital(data.hospital);
            }
        } catch (error) {
            console.error('Error fetching dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/hospital-bookings/hospital-bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings', error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-24 md:pb-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-6 relative z-10 pt-16 md:pt-4">
                <div className="flex items-center gap-4 mb-8">
                    <LayoutDashboard size={32} className="text-teal-400" />
                    <h1 className="text-3xl font-black">{hospital?.hospitalName} Dashboard</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={<BedDouble size={24} />} title="Total Beds" value={hospital?.numberOfBeds} color="text-blue-400" bg="bg-blue-500/10" />
                    <StatCard icon={<CalendarPlus size={24} />} title="Bookings" value={bookings.length} color="text-teal-400" bg="bg-teal-500/10" />
                    <StatCard icon={<Users size={24} />} title="Doctors" value={hospital?.doctors?.length || 0} color="text-purple-400" bg="bg-purple-500/10" />
                    <StatCard icon={<Activity size={24} />} title="Emergencies" value={0} color="text-red-400" bg="bg-red-500/10" />
                </div>

                <div className="glass-card border border-white/10 rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Patient</th>
                                    <th className="px-4 py-3">Service</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b._id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-4 py-4 font-medium text-white">{b.patientName}</td>
                                        <td className="px-4 py-4">{b.serviceSelected}</td>
                                        <td className="px-4 py-4">{new Date(b.preferredDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button className="text-teal-400 hover:text-teal-300 mr-3">Approve</button>
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center">No recent bookings</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color, bg }) => (
    <div className="glass-card border border-white/10 p-6 rounded-2xl flex items-center justify-between">
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <h3 className="text-3xl font-black mt-1 text-white">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl ${bg} ${color}`}>
            {icon}
        </div>
    </div>
);

export default HospitalDashboard;
