import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Award,
    Zap,
    ChevronRight,
    CheckCircle2,
    Cpu,
    Layers,
    ShieldCheck,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface Milestone {
    label: string;
    description: string;
    difficulty: 'Basic' | 'Expert' | 'Elite';
}

interface BlueprintPhase {
    title: string;
    duration: string;
    focus: string;
    goal: string;
    icon: any;
    color: string;
    milestones: Milestone[];
}

const phases: BlueprintPhase[] = [
    {
        title: 'Phase 1: Zero-to-One Foundation',
        duration: 'Month 1-2',
        focus: 'Core DSA & JS Internals',
        goal: 'Surviving "AI-Off" rounds with First Principles.',
        icon: Target,
        color: '#30D8A8',
        milestones: [
            { label: 'JS Execution Stack', description: 'Mastery of libuv, event loop phases, and V8 optimization.', difficulty: 'Expert' },
            { label: 'DSA Logic Flow', description: 'Solving Hard LC problems without IDE assistance.', difficulty: 'Elite' },
            { label: 'Prototypes & Closures', description: 'Deep knowledge of memory management and heap snapshots.', difficulty: 'Expert' }
        ]
    },
    {
        title: 'Phase 2: Modern Full-Stack mastery',
        duration: 'Month 3-4',
        focus: 'React 19 RSCs & Node 23',
        goal: 'Building high-fidelity production engines.',
        icon: Zap,
        color: '#60A5FA',
        milestones: [
            { label: 'React 19 Compiler', description: 'Implementing RSCs, Server Actions, and useOptimistic.', difficulty: 'Elite' },
            { label: 'Node.js 23 Concurrency', description: 'Worker threads and sub-process orchestration at scale.', difficulty: 'Expert' },
            { label: 'Event-Driven Arch', description: 'Kafka/Redis stream integration for real-time systems.', difficulty: 'Expert' }
        ]
    },
    {
        title: 'Phase 3: Architecting for Scale',
        duration: 'Month 5',
        focus: 'System Design & Machine Coding',
        goal: 'Defending $1M+ impact architectural decisions.',
        icon: Layers,
        color: '#A855F7',
        milestones: [
            { label: 'High Availability', description: 'Designing for 99.99% uptime with failover strategies.', difficulty: 'Elite' },
            { label: 'Machine Coding Gauntlet', description: 'Vanilla JS DOM engines built in < 45 minutes.', difficulty: 'Elite' },
            { label: 'Database Hardening', description: 'Single-table DynamoDB and SQL window function mastery.', difficulty: 'Expert' }
        ]
    },
    {
        title: 'Phase 4: Behavioral Elite',
        duration: 'Month 6',
        focus: 'STAR Method & Engineering Judgment',
        goal: 'Commanding any Boardroom or Bar Raiser loop.',
        icon: Award,
        color: '#FACC15',
        milestones: [
            { label: 'STAR Story Arch', description: 'Quantifying $1M+ business impact with metrics.', difficulty: 'Expert' },
            { label: 'Conflict Simulation', description: 'Handling peer-to-peer friction with leadership logic.', difficulty: 'Expert' },
            { label: 'Strategy Defense', description: 'Justifying technical tradeoffs to non-tech founders.', difficulty: 'Elite' }
        ]
    }
];

export const PrepBlueprint: React.FC = () => {
    const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white">MASTERY ROADMAP 2026</h2>
                    <p className="text-[#30D8A8] text-[10px] uppercase tracking-widest font-bold">Expert-Level Engineering Blueprint</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="px-3 py-1 rounded-full bg-[#30D8A8]/10 border border-[#30D8A8]/20 text-[#30D8A8] text-[10px] font-bold mb-1">
                        MISSION STATUS: ACTIVE
                    </div>
                    <div className="text-[9px] text-white/30 font-mono tracking-tighter">ID: ALPHA-001-ROADMAP</div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                {phases.map((phase, index) => (
                    <motion.div
                        key={phase.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative rounded-3xl transition-all duration-300 ${expandedPhase === index
                            ? 'bg-white/[0.08] border border-white/20'
                            : 'bg-white/5 border border-white/5 hover:border-white/10'
                            } overflow-hidden`}
                    >
                        {/* Phase Header */}
                        <button
                            onClick={() => setExpandedPhase(expandedPhase === index ? null : index)}
                            className="w-full text-left p-6 flex items-start gap-4"
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black/40 border border-white/10 group-hover:scale-110 transition-transform">
                                    <phase.icon className="w-6 h-6" style={{ color: phase.color }} />
                                </div>
                                {expandedPhase === index && (
                                    <motion.div
                                        layoutId="glow"
                                        className="absolute inset-0 blur-lg"
                                        style={{ backgroundColor: phase.color, opacity: 0.2 }}
                                    />
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{phase.duration}</span>
                                    <span className="text-white/20">•</span>
                                    <span className="text-[10px] font-bold text-[#30D8A8] uppercase tracking-widest">{phase.focus}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{phase.title}</h3>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-white/40 uppercase">Goal</span>
                                    <span className="text-xs text-[#30D8A8] font-medium italic">{phase.goal}</span>
                                </div>
                                {expandedPhase === index ? <ChevronUp className="w-5 h-5 opacity-40" /> : <ChevronDown className="w-5 h-5 opacity-40" />}
                            </div>
                        </button>

                        {/* Expanded Milestones */}
                        <AnimatePresence>
                            {expandedPhase === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/5">
                                        {phase.milestones.map((m, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-[#30D8A8]/30 transition-all">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${m.difficulty === 'Elite' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                                        }`}>
                                                        {m.difficulty}
                                                    </span>
                                                    <CheckCircle2 className="w-3 h-3 opacity-20 group-hover:opacity-100 group-hover:text-[#30D8A8] transition-all" />
                                                </div>
                                                <h4 className="text-sm font-bold text-white mb-1">{m.label}</h4>
                                                <p className="text-[11px] text-white/40 leading-relaxed">{m.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* AI HUD Overlay */}
            <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-[#30D8A8]/5 via-[#60A5FA]/5 to-purple-500/5 border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-black/40 border border-[#30D8A8]/20 flex items-center justify-center overflow-hidden">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                className="absolute inset-0 opacity-20"
                            >
                                <Cpu className="w-full h-full p-2 text-[#30D8A8]" />
                            </motion.div>
                            <ShieldCheck className="w-8 h-8 text-[#30D8A8]" />
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-[#30D8A8] rounded-full blur-[2px]"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            <h4 className="text-lg font-bold text-white tracking-tight">Karan's Tracking Module Active</h4>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed max-w-xl">
                            Our AI Engine monitors your <span className="text-[#30D8A8] font-bold">DNA Match Intensity</span> for each milestone. Achievement of Elite difficulty items triggers high-tier corporate "Secret Signals".
                        </p>
                    </div>

                    <button className="px-6 py-3 rounded-2xl bg-[#30D8A8] text-[#07080A] font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group shadow-[0_0_20px_rgba(48,216,168,0.3)]">
                        Deep Analytics
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};
