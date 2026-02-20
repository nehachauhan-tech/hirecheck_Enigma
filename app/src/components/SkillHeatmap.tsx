import React from 'react';
import { motion } from 'framer-motion';

interface SkillHeatmapProps {
    data: Record<string, number>; // Date string YYYY-MM-DD -> count
}

const SkillHeatmap: React.FC<SkillHeatmapProps> = ({ data }) => {
    // Generate last 12 weeks of dates
    const weeks = 12;
    const daysPerWeek = 7;
    const totalDays = weeks * daysPerWeek;

    const today = new Date();
    const dates = Array.from({ length: totalDays }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (totalDays - 1 - i));
        return d.toISOString().split('T')[0];
    });

    const getColor = (count: number) => {
        if (!count) return 'bg-white/5';
        if (count === 1) return 'bg-[#30D8A8]/20';
        if (count === 2) return 'bg-[#30D8A8]/40';
        if (count === 3) return 'bg-[#30D8A8]/60';
        return 'bg-[#30D8A8]';
    };

    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Activity Heatmap</h3>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/20 uppercase font-bold">Less</span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map(v => (
                            <div key={v} className={`w-3 h-3 rounded-sm ${getColor(v)}`} />
                        ))}
                    </div>
                    <span className="text-[10px] text-white/20 uppercase font-bold">More</span>
                </div>
            </div>

            <div className="flex gap-1.5">
                {Array.from({ length: weeks }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1.5">
                        {Array.from({ length: daysPerWeek }).map((_, dayIndex) => {
                            const dateIdx = weekIndex * daysPerWeek + dayIndex;
                            const date = dates[dateIdx];
                            const count = data[date] || 0;

                            return (
                                <motion.div
                                    key={date}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (dateIdx / totalDays) * 0.5 }}
                                    className={`w-4 h-4 rounded-sm ${getColor(count)} transition-colors hover:ring-2 hover:ring-white/20 cursor-help relative group`}
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {count} interviews on {new Date(date).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="flex justify-between mt-4 px-1">
                <span className="text-[10px] font-bold text-white/20 uppercase">Last 3 Months</span>
                <span className="text-[10px] font-bold text-white/20 uppercase">Today</span>
            </div>
        </div>
    );
};

export default SkillHeatmap;
