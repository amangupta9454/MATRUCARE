import React, { useState } from 'react';
import { Calendar as CalIcon, Clock, X, Check } from 'lucide-react';

const DoctorAvailabilityCalendar = ({ schedule, onUpdate }) => {
    // Expected schedule format: [{ day: 'Monday', slots: [{time: '09:00 AM', isBlocked: false}], isBlocked: false }]
    const [localSchedule, setLocalSchedule] = useState(schedule || [
        { day: 'Monday', slots: [{ time: '09:00 AM', isBlocked: false }, { time: '11:00 AM', isBlocked: false }], isBlocked: false },
        { day: 'Tuesday', slots: [{ time: '10:00 AM', isBlocked: false }, { time: '02:00 PM', isBlocked: false }], isBlocked: false },
        { day: 'Wednesday', slots: [{ time: '09:00 AM', isBlocked: false }, { time: '04:00 PM', isBlocked: false }], isBlocked: false },
    ]);

    const toggleDayBlock = (index) => {
        const newSched = [...localSchedule];
        newSched[index].isBlocked = !newSched[index].isBlocked;
        setLocalSchedule(newSched);
        if (onUpdate) onUpdate(newSched);
    };

    const toggleSlotBlock = (dayIndex, slotIndex) => {
        const newSched = [...localSchedule];
        newSched[dayIndex].slots[slotIndex].isBlocked = !newSched[dayIndex].slots[slotIndex].isBlocked;
        setLocalSchedule(newSched);
        if (onUpdate) onUpdate(newSched);
    };

    return (
        <div className="glass-card border border-white/10 p-5 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalIcon className="text-blue-400" size={20} /> Availability Calendar
            </h3>

            <div className="space-y-3">
                {localSchedule.map((dayObj, dIndex) => (
                    <div key={dIndex} className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all hover:border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className={`font-semibold ${dayObj.isBlocked ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {dayObj.day}
                            </h4>
                            <button
                                onClick={() => toggleDayBlock(dIndex)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${dayObj.isBlocked ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                            >
                                {dayObj.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                        </div>

                        {!dayObj.isBlocked && (
                            <div className="flex flex-wrap gap-2">
                                {dayObj.slots.map((slot, sIndex) => (
                                    <button
                                        key={sIndex}
                                        onClick={() => toggleSlotBlock(dIndex, sIndex)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${slot.isBlocked ? 'bg-red-500/10 border-red-500/30 text-red-400 line-through' : 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20'}`}
                                    >
                                        <Clock size={12} /> {slot.time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorAvailabilityCalendar;
