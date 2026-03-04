import React, { useState } from 'react';
import { Phone, Users, Shield, Save } from 'lucide-react';
import axios from 'axios';

const ContactEmergencyCard = ({ initialContacts, onUpdate }) => {
    const [formData, setFormData] = useState({
        doctorName: initialContacts?.doctorName || '',
        doctorPhone: initialContacts?.doctorPhone || '',
        familyContactName: initialContacts?.familyContact?.name || '',
        familyContactPhone: initialContacts?.familyContact?.phone || '',
        ashaWorkerName: initialContacts?.ashaWorkerName || '',
        ashaWorkerPhone: initialContacts?.ashaWorkerPhone || '',
        phoneNumber: initialContacts?.phoneNumber || '108'
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/emergency/contacts`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onUpdate) onUpdate(res.data.contactInfo);
        } catch (error) {
            console.error('Failed to update emergency contacts', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="p-3 bg-white/5 text-rose-400 rounded-xl">
                    <Shield size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Emergency Contacts</h3>
                    <p className="text-gray-400 text-sm">Quick access numbers for emergencies</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Doctor */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-semibold">Primary Doctor</label>
                        <input name="doctorName" value={formData.doctorName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-rose-500 focus:outline-none" placeholder="Name" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-semibold">Doctor Phone</label>
                        <div className="relative">
                            <Phone size={14} className="absolute left-3 top-3 text-gray-500" />
                            <input name="doctorPhone" value={formData.doctorPhone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white focus:border-rose-500 focus:outline-none" placeholder="+91..." />
                        </div>
                    </div>
                </div>

                {/* Family */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-semibold">Family Member</label>
                        <div className="relative">
                            <Users size={14} className="absolute left-3 top-3 text-gray-500" />
                            <input name="familyContactName" value={formData.familyContactName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white focus:border-rose-500 focus:outline-none" placeholder="Name" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-semibold">Family Phone</label>
                        <div className="relative">
                            <Phone size={14} className="absolute left-3 top-3 text-gray-500" />
                            <input name="familyContactPhone" value={formData.familyContactPhone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white focus:border-rose-500 focus:outline-none" placeholder="+91..." />
                        </div>
                    </div>
                </div>

                {/* ASHA */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-semibold">ASHA Worker</label>
                        <input name="ashaWorkerName" value={formData.ashaWorkerName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-rose-500 focus:outline-none" placeholder="Name" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-semibold">ASHA Phone</label>
                        <div className="relative">
                            <Phone size={14} className="absolute left-3 top-3 text-gray-500" />
                            <input name="ashaWorkerPhone" value={formData.ashaWorkerPhone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white focus:border-rose-500 focus:outline-none" placeholder="+91..." />
                        </div>
                    </div>
                </div>

                {/* General Emergency Number */}
                <div className="space-y-1 pt-2 border-t border-white/5">
                    <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">General Ambulance / Helpline</label>
                    <div className="relative">
                        <Phone size={14} className="absolute left-3 top-[14px] text-gray-500" />
                        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-rose-500/10 border border-rose-500/30 rounded-xl pl-9 pr-4 py-3 text-rose-200 font-bold tracking-wider focus:border-rose-500 focus:outline-none" placeholder="108" />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={saving}
                className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/20 flex justify-center items-center gap-2"
            >
                {saving ? 'Saving...' : <><Save size={18} /> Save Contacts</>}
            </button>
        </form>
    );
};

export default ContactEmergencyCard;
