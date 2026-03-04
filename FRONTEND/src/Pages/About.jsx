import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl bg-white/70 dark:bg-gray-800/80 backdrop-blur-lg p-10 rounded-3xl shadow-xl border border-teal-100 dark:border-gray-700 w-full"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-teal-700 dark:text-teal-400 mb-6 text-center">
                    About MaaCare
                </h1>

                <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                        Welcome to <strong>MaaCare</strong>, a comprehensive AI-powered platform designed specifically to revolutionize maternal healthcare. Our mission is to bridge the gap between expectant mothers, healthcare professionals, and ASHA workers, ensuring accessible, timely, and quality care for everyone.
                    </p>

                    <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-300 mt-8 mb-4">Our Vision</h2>
                    <p>
                        We envision a world where every mother has access to vital healthcare resources right at her fingertips. By integrating advanced technology with compassionate care, MaaCare aims to reduce maternal mortality rates and promote holistic well-being during pregnancy and beyond.
                    </p>

                    <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-300 mt-8 mb-4">Core Principles</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Accessibility:</strong> Breaking geographical barriers to provide expert consultations via an intuitive online platform.</li>
                        <li><strong>Security:</strong> Implementing rigorous encryption protocols to safeguard sensitive medical and personal data.</li>
                        <li><strong>Collaboration:</strong> Creating a unified ecosystem where Doctors, Mothers, and ASHA Workers can interact seamlessly.</li>
                        <li><strong>Inclusivity:</strong> Offering multi-language support to cater to diverse demographic groups and ensure no one is left behind.</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default About;
