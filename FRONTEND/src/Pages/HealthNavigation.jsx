import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
        <div className="min-h-screen relative overflow-hidden text-slate-800">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200/30 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200/30 blur-[120px] rounded-full pointer-events-none" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="mb-12">
                    <HealthNavigationAssistant />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                        <EmergencySOSPanel />
                    </div>
                    <div>
                        <ContactEmergencyCard contacts={contacts} onUpdate={handleContactsUpdate} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HealthNavigation;
