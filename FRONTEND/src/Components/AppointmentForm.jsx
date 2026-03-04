import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, X, Loader2, UploadCloud } from 'lucide-react';

// Convert 24h "14:30" to 12h "2:30 PM"
const to12h = (t) => {
    if (!t) return t;
    const [h, m] = t.split(':').map(Number);
    if (isNaN(h)) return t; // Already in 12h format, return as-is
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

// Date helpers
const today = () => new Date().toISOString().split('T')[0];
const maxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
};

const AppointmentForm = ({ doctor, onClose, onSuccess }) => {
    const { user, token } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        patientName: user?.name || '',
        patientEmail: user?.email || '',
        patientMobile: '',
        address: '',
        pregnancyMonth: '',
        previousHealthProblem: '',
        mode: 'Consultation',
        date: '',
        time: '',
        notes: '',
    });

    // Cloudinary attachments supported but Optional in DB
    const [attachment, setAttachment] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setAttachment(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('doctorId', doctor._id);
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            if (attachment) {
                data.append('attachment', attachment);
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/appointments`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            onSuccess();
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert(error.response?.data?.message || 'Error booking appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card-elevated w-full max-w-3xl my-8 overflow-hidden relative"
            >
                <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full p-2 transition-colors">
                    <X size={20} />
                </button>

                <div className="px-8 py-6 border-b border-white/10 bg-teal-500/5">
                    <h2 className="text-2xl font-bold text-white">Book Appointment</h2>
                    <p className="text-teal-400 mt-1 text-sm">with Dr. {doctor.user?.name} · {doctor.specialistType || doctor.specialization}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    <div className="mb-6 pb-6 border-b border-white/10">
                        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                            <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 w-8 h-8 rounded-full flex justify-center items-center text-sm">1</span>
                            Patient Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                <input required type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="dark-input" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                                <input required type="email" name="patientEmail" value={formData.patientEmail} onChange={handleChange} className="dark-input" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Mobile Number</label>
                                <input required type="text" name="patientMobile" value={formData.patientMobile} onChange={handleChange} className="dark-input" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                                <input required type="text" name="address" value={formData.address} onChange={handleChange} className="dark-input" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Pregnancy Month</label>
                                <input type="number" name="pregnancyMonth" value={formData.pregnancyMonth} onChange={handleChange} min="1" max="9" className="dark-input" />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Previous Health Problems</label>
                                <textarea rows="2" name="previousHealthProblem" value={formData.previousHealthProblem} onChange={handleChange} className="dark-input resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 pb-6 border-b border-white/10">
                        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                            <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 w-8 h-8 rounded-full flex justify-center items-center text-sm">2</span>
                            Appointment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Mode</label>
                                <select name="mode" value={formData.mode} onChange={handleChange} className="dark-input">
                                    <option value="Regular Checkup">Regular Checkup</option>
                                    <option value="Testing">Testing</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Consultation">Consultation</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><CalendarIcon size={14} /> Select Date</label>
                                <input required type="date" name="date" value={formData.date} onChange={handleChange}
                                    min={today()} max={maxDate()} className="dark-input" />
                                <p className="text-[11px] text-gray-600 mt-1">Available: today — {new Date(maxDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Clock size={14} /> Select Time Slot</label>
                                <select required name="time" value={formData.time} onChange={handleChange} className="dark-input">
                                    <option value="">-- Select Time Slot --</option>
                                    {doctor.availableSlots?.length > 0 ? (
                                        doctor.availableSlots.map(slot => (
                                            <option key={slot} value={slot}>{to12h(slot)}</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="12:00">12:00 PM</option>
                                            <option value="14:00">2:00 PM</option>
                                            <option value="16:00">4:00 PM</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Extra Notes for Doctor</label>
                                <textarea rows="2" name="notes" value={formData.notes} onChange={handleChange} className="dark-input resize-none"></textarea>
                            </div>

                            <div className="space-y-2 md:col-span-2 mt-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Attachment / Past Reports (Optional)</label>
                                <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-6 h-6 mb-2 text-gray-500" />
                                        <p className="text-sm text-gray-500 font-medium">
                                            {attachment ? attachment.name : 'Upload Report PDF/Image'}
                                        </p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-70">
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            Confirm Booking
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
};

export default AppointmentForm;
