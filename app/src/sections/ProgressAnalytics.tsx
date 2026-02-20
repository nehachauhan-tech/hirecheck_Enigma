import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    ArrowLeft,
    TrendingUp,
    Calendar,
    Target,
    Zap,
    Compass
} from 'lucide-react';
import SkillHeatmap from '../components/SkillHeatmap';

interface ProgressAnalyticsProps {
    token: string;
    onBack: () => void;
    onNavigate?: (view: string) => void;
}

interface BehavioralDNA {
    understanding: number;
    strategy: number;
    recovery: number;
    adaptability: number;
    communication: number;
    optimization: number;
    pressure: number;
}

interface Skill {
    name: string;
    level: number;
    trend: string;
    color: string;
}

interface Overview {
    totalInterviews: number;
    avgScore: number;
    marathons: number;
    sprints: number;
    strengths: string[];
    improving: string[];
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ token, onBack, onNavigate }) => {
    const [trends, setTrends] = useState<Trend[]>([]);
    const [heatmap, setHeatmap] = useState<Record<string, number>>({});
    const [dna, setDNA] = useState<BehavioralDNA | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [overview, setOverview] = useState<Overview | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendsRes, heatmapRes, dnaRes, skillsRes, overviewRes] = await Promise.all([
                    fetch(`${API_URL}/api/stats/trends`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/stats/heatmap`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/stats/dna`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/stats/skills`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/stats/overview`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (trendsRes.ok) setTrends(await trendsRes.json());
                if (heatmapRes.ok) setHeatmap(await heatmapRes.json());
                if (dnaRes.ok) setDNA(await dnaRes.json());
                if (skillsRes.ok) setSkills(await skillsRes.json());
                if (overviewRes.ok) setOverview(await overviewRes.json());
            } catch (err) {
                console.error('Failed to fetch analytics data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07080A] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#30D8A8]/20 border-t-[#30D8A8] rounded-full animate-spin" />
            </div>
        );
    }

    const avgScore = overview?.avgScore || 0;
    const totalInterviews = overview?.totalInterviews || 0;

    return (
        <div className="min-h-screen bg-[#07080A] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#07080A]/95 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Dashboard</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigate?.('compass')}
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                        >
                            <Compass className="w-4 h-4 text-blue-400" />
                            <span>Compass</span>
                        </button>
                    </div>
                    <div className="w-24" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Top Summary Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#30D8A8]/5 blur-3xl rounded-full" />
                        <div className="relative z-10">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Average Score</span>
                            <div className="text-5xl font-black text-[#30D8A8]">{avgScore}%</div>
                            <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-bold">
                                <TrendingUp className="w-4 h-4" />
                                <span>Recent Trajectory</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                        <div className="relative z-10">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Total Interviews</span>
                            <div className="text-5xl font-black text-white">{totalInterviews}</div>
                            <div className="mt-4 flex items-center gap-2 text-white/40 text-xs font-bold">
                                <Calendar className="w-4 h-4" />
                                <span>{overview?.marathons} Marathons · {overview?.sprints} Sprints</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full" />
                        <div className="relative z-10">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Top Skills</span>
                            <div className="space-y-1">
                                {overview?.strengths.map(s => (
                                    <div key={s} className="text-xl font-bold text-yellow-400">{s}</div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Behavioral DNA Visualization */}
                {dna && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-[2.5rem] bg-[#111218] border border-white/5"
                    >
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Target className="w-6 h-6 text-purple-400" />
                            Behavioral DNA Profile
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Object.entries(dna).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                        <span className="text-white/40">{key}</span>
                                        <span className="text-white">{value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${value}%` }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Historical Trends Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-[#30D8A8]" />
                                Performance Trajectory
                            </h2>
                            <p className="text-white/40 text-sm">Historical score progression based on interview verdicts.</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#30D8A8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#30D8A8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#ffffff20"
                                    tick={{ fill: '#ffffff40', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#ffffff20"
                                    tick={{ fill: '#ffffff40', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A1B1E', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#30D8A8', fontWeight: '900' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#30D8A8"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Heatmap & Skills Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SkillHeatmap data={heatmap} />

                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            MERN Skills Matrix
                        </h3>
                        <div className="space-y-6">
                            {skills.map((skill) => (
                                <div key={skill.name} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold">{skill.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white/40">{skill.trend}</span>
                                            <span className="text-sm font-black" style={{ color: skill.color }}>{skill.level}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.level}%` }}
                                            className="h-full"
                                            style={{ backgroundColor: skill.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProgressAnalytics;
