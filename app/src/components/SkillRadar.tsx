import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer
} from 'recharts';

interface SkillRadarProps {
    data: Record<string, number>;
}

const SkillRadar: React.FC<SkillRadarProps> = ({ data }) => {
    const chartData = [
        { subject: 'Understanding', value: (data.understanding || 0) * 100 },
        { subject: 'Strategy', value: (data.strategy || 0) * 100 },
        { subject: 'Recovery', value: (data.recovery || 0) * 100 },
        { subject: 'Adaptability', value: (data.adaptability || 0) * 100 },
        { subject: 'Communication', value: (data.communication || 0) * 100 },
        { subject: 'Optimization', value: (data.optimization || 0) * 100 },
        { subject: 'Pressure', value: (data.pressureStability || 0) * 100 },
    ];

    return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#ffffff10" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#ffffff60', fontSize: 12, fontWeight: 600 }}
                    />
                    <Radar
                        name="Skill DNA"
                        dataKey="value"
                        stroke="#30D8A8"
                        fill="#30D8A8"
                        fillOpacity={0.3}
                        animationDuration={1500}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SkillRadar;
