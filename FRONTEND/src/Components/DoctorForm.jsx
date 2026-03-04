import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';
import { User, Save, UploadCloud, Loader2, CheckCircle2, Plus, X, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorForm = () => {
    const { token } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        qualifications: '',
        experienceYears: '',
        fieldOfExperience: '',
        specialization: '',
        specialistType: 'General',
        previousOrganizations: '',
        currentOrganization: '',
        mobile: '',
        consultationFee: '',
        bio: '',
    });

    // Separate state for structured fields
    const [selectedDays, setSelectedDays] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);       // array of "HH:MM" strings
    const [newTime, setNewTime] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/doctors/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const d = res.data;
                setFormData({
                    qualifications: d.qualifications?.join(', ') || '',
                    experienceYears: d.experienceYears || '',
                    fieldOfExperience: d.fieldOfExperience || '',
                    specialization: d.specialization || '',
                    specialistType: d.specialistType || 'General',
                    previousOrganizations: d.previousOrganizations?.join(', ') || '',
                    currentOrganization: d.currentOrganization || '',
                    mobile: d.mobile || '',
                    consultationFee: d.consultationFee || '',
                    bio: d.bio || '',
                });
                setSelectedDays(d.availableDays || []);
                setTimeSlots(d.availableSlots || []);
            } catch (err) {
                console.error('Failed to load doctor profile:', err);
            }
        };
        fetchProfile();
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleDay = (day) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const addTimeSlot = () => {
        if (!newTime || timeSlots.includes(newTime)) return;
        // Store as 12-hour for display, keep 24-hour internally
        setTimeSlots(prev => [...prev, newTime].sort());
        setNewTime('');
    };

    const removeSlot = (slot) => {
        setTimeSlots(prev => prev.filter(s => s !== slot));
    };

    // Format 24h time to 12h for display
    const to12h = (t) => {
        if (!t) return '';
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            // Join arrays as comma-separated strings for the backend
            data.append('availableDays', selectedDays.join(', '));
            data.append('availableSlots', timeSlots.join(', '));
            if (profileImage) data.append('profileImage', profileImage);

            await axios.put(`${import.meta.env.VITE_API_URL}/doctors/profile`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "dark-input";
    const labelCls = "text-xs font-bold text-gray-400 uppercase tracking-wider";

    return (
        <div className="glass-card p-6 md:p-8 mt-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <div className="bg-teal-500/20 border border-teal-500/30 p-3 rounded-xl text-teal-400">
                    <User size={22} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Profile & Listing Setup</h2>
                    <p className="text-sm text-gray-500">Update your details to appear on the public doctors directory.</p>
                </div>
            </div>

            {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-500/10 text-green-400 border border-green-500/30 rounded-xl flex items-center gap-2 font-medium">
                    <CheckCircle2 size={20} /> Profile saved & you are now listed on the public directory!
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">

                {/* Profile Image */}
                <div className="space-y-1.5">
                    <label className={labelCls}>Profile Image</label>
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                        <UploadCloud className="w-7 h-7 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500 font-medium">
                            {profileImage ? profileImage.name : 'Click to upload your professional photo'}
                        </p>
                        <input type="file" className="hidden" accept="image/*" onChange={e => setProfileImage(e.target.files[0])} />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className={labelCls}>Qualifications (comma-separated)</label>
                        <input type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} placeholder="MBBS, MD" className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Experience (Years)</label>
                        <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} min="0" max="60" className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Specialist Type</label>
                        <select name="specialistType" value={formData.specialistType} onChange={handleChange} className={inputCls}>
                            <option value="General">General</option>
                            <option value="Gynecologist">Gynecologist</option>
                            <option value="Obstetrician">Obstetrician</option>
                            <option value="Fertility Expert">Fertility Expert</option>
                            <option value="Pediatrician">Pediatrician</option>
                            <option value="Nutritionist">Nutritionist</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Specialization (text)</label>
                        <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="E.g. High-risk pregnancies" className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Contact Mobile</label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Consultation Fee (₹)</label>
                        <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} required min="0" className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Current Organization</label>
                        <input type="text" name="currentOrganization" value={formData.currentOrganization} onChange={handleChange} className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Previous Organizations (comma-separated)</label>
                        <input type="text" name="previousOrganizations" value={formData.previousOrganizations} onChange={handleChange} placeholder="Hospital A, Clinic B" className={inputCls} />
                    </div>
                </div>

                {/* Available Days — checkbox grid */}
                <div className="space-y-3">
                    <label className={labelCls}>Available Days</label>
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => (
                            <button key={day} type="button" onClick={() => toggleDay(day)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${selectedDays.includes(day)
                                    ? 'bg-teal-600 border-teal-500 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}>
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Available Time Slots — time input */}
                <div className="space-y-3">
                    <label className={labelCls}>Available Time Slots</label>
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="time"
                                value={newTime}
                                onChange={e => setNewTime(e.target.value)}
                                className="dark-input pl-10"
                            />
                        </div>
                        <button type="button" onClick={addTimeSlot}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-3 rounded-xl font-bold transition-colors shrink-0">
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    {timeSlots.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {timeSlots.map(slot => (
                                <span key={slot} className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 px-3 py-1.5 rounded-xl text-sm font-medium">
                                    <Clock size={13} />{to12h(slot)}
                                    <button type="button" onClick={() => removeSlot(slot)} className="text-teal-500 hover:text-red-400 transition-colors">
                                        <X size={13} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                    <label className={labelCls}>Short Bio</label>
                    <textarea rows="3" name="bio" value={formData.bio} onChange={handleChange} className="dark-input resize-none" placeholder="Brief professional bio..." />
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-70">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save & List Profile
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorForm;
