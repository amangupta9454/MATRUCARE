import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Shield, Globe, Users, Award } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 py-8 text-slate-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl glass-card-elevated p-8 md:p-12 w-full border border-sky-200"
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-sky-100 p-3.5 rounded-2xl border border-sky-200 text-sky-600 shadow-xs">
                        <HeartPulse size={36} />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 text-center tracking-tight">
                    About <span className="gradient-text">MaaCare</span>
                </h1>
                <p className="text-center text-slate-500 max-w-xl mx-auto mb-10 text-sm font-medium">
                    Pioneering AI-driven hospital ecosystem & healthcare infrastructure for maternal and infant well-being across India.
                </p>

                <div className="space-y-8 text-base text-slate-700 leading-relaxed">
                    <div className="glass-card p-6 border border-sky-200 bg-white/80">
                        <p className="text-lg text-slate-700">
                            Welcome to <strong className="text-sky-700">MaaCare</strong>, a comprehensive AI-powered medical platform designed specifically to revolutionize maternal healthcare. Our mission is to bridge the gap between expectant mothers, hospital specialists, and community ASHA workers, ensuring accessible, timely, and quality care for everyone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                        <div className="tilt-card p-6 border border-sky-200 bg-gradient-to-br from-white to-sky-50/80">
                            <div className="flex items-center gap-3 mb-3">
                                <Award className="text-sky-600" size={24} />
                                <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                We envision a world where every mother has access to vital healthcare resources right at her fingertips. By integrating advanced technology with compassionate medical care, MaaCare aims to reduce maternal mortality rates and promote holistic well-being.
                            </p>
                        </div>

                        <div className="tilt-card p-6 border border-teal-200 bg-gradient-to-br from-white to-teal-50/80">
                            <div className="flex items-center gap-3 mb-3">
                                <Shield className="text-teal-600" size={24} />
                                <h2 className="text-xl font-bold text-slate-900">Hospital Standards</h2>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Engineered with enterprise clinical encryption and ISO-compliant data storage, guaranteeing privacy and rapid access for doctors during emergency consultations.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                            <Users className="text-sky-600" size={24} /> Core Principles
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
                                <h3 className="font-bold text-sky-800 mb-1">Accessibility</h3>
                                <p className="text-xs text-slate-600">Breaking geographical barriers to provide expert consultations via an intuitive online platform.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
                                <h3 className="font-bold text-sky-800 mb-1">Security</h3>
                                <p className="text-xs text-slate-600">Implementing rigorous encryption protocols to safeguard sensitive medical and personal data.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
                                <h3 className="font-bold text-sky-800 mb-1">Collaboration</h3>
                                <p className="text-xs text-slate-600">Creating a unified ecosystem where Doctors, Mothers, and ASHA Workers can interact seamlessly.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs">
                                <h3 className="font-bold text-sky-800 mb-1">Inclusivity</h3>
                                <p className="text-xs text-slate-600">Offering multi-language support to cater to diverse demographic groups and ensure no one is left behind.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default About;
