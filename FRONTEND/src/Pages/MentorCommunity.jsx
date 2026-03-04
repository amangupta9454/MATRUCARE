import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, HeartHandshake } from 'lucide-react';
import MentorMotherCard from '../Components/MentorMotherCard';

const MentorCommunity = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/mentors`);
            const data = await res.json();
            if (data.success) {
                setMentors(data.mentors);
            }
        } catch (error) {
            console.error('Error fetching mentors', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-24 md:pb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-pink-900/10 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-6 relative z-10 pt-16 md:pt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-500 flex items-center gap-3">
                            <HeartHandshake size={36} className="text-pink-500" />
                            Mentor Mothers
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm lg:text-base max-w-xl">
                            Connect with experienced mothers for emotional support, postpartum care, and baby care advice.
                        </p>
                    </div>
                    <button className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20 w-full md:w-auto">
                        Become a Mentor
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div></div>
                ) : mentors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentors.map((mentor, idx) => (
                            <MentorMotherCard key={mentor._id} mentor={mentor} index={idx} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                        <Users size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Mentors Available</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">Be the first to join the community and guide new mothers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorCommunity;
