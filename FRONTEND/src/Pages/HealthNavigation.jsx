import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import HealthNavigationAssistant from '../Components/HealthNavigationAssistant';
import EmergencySOSPanel from '../Components/EmergencySOSPanel';
import ContactEmergencyCard from '../Components/ContactEmergencyCard';

const HealthNavigation = () => {
    const [contacts, setContacts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/emergency/contacts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setContacts(res.data.contacts);
            } catch (error) {
                console.error('No contacts found', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    const handleContactsUpdate = (updatedContacts) => {
        setContacts(updatedContacts);
    };

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden text-slate-200">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                <div className="mb-16">
                    <HealthNavigationAssistant />
                </div>

                <div className="mt-20 border-t border-white/5 pt-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-2">Emergency Hub</h2>
                        <p className="text-gray-400">Manage your emergency contacts and trigger SOS alerts instantly.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Enhanced SOS */}
                        <div>
                            <EmergencySOSPanel contacts={contacts} />
                        </div>

                        {/* Contacts Form */}
                        <div>
                            {loading ? (
                                <div className="h-full bg-black/20 animate-pulse rounded-3xl min-h-[400px]" />
                            ) : (
                                <ContactEmergencyCard initialContacts={contacts} onUpdate={handleContactsUpdate} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HealthNavigation;
