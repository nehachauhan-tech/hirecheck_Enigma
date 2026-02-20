import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Zap,
    Target,
    TrendingUp
} from 'lucide-react';

interface AuditResult {
    score: number;
    matches: string[];
    gaps: string[];
    verdict: string;
    actionableAdvice: string[];
}

interface ResumeAuditorProps {
    token: string;
    company: string;
    role: string;
    onComplete?: (result: AuditResult) => void;
}

const ResumeAuditor: React.FC<ResumeAuditorProps> = ({ token, company, role, onComplete }) => {
    const [audit, setAudit] = useState<AuditResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        performAudit();
    }, [company, role]);

    const performAudit = async () => {
        setLoading(true);
        setError(null);
        setAudit(null); // Clear previous audit results
        try {
            const response = await fetch(`${API_URL}/api/compass/audit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ company, role })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Audit failed');
            }

            const result = await response.json();
            setAudit(result);
            if (onComplete) onComplete(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-[#30D8A8]/20 border-t-[#30D8A8] rounded-full animate-spin" />
                    <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#30D8A8]" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Analyzing Resume DNA...</h3>
                    <p className="text-white/40 text-sm">Karan is scanning your experience against {company} benchmarks.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-400 mb-2">Audit Interrupted</h3>
                <p className="text-white/60 mb-6">{error}</p>
                <button
                    onClick={performAudit}
                    className="px-6 py-2 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-all"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    if (!audit) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#30D8A8]/5 blur-3xl rounded-full" />

                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 flex items-center justify-center text-[#30D8A8]">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-white/5"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (251.2 * audit.score) / 100}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <span className="absolute text-2xl font-black text-white">{audit.score}%</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-[#30D8A8]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[#30D8A8]">Karan's Verdict</span>
                        </div>
                        <p className="text-lg font-bold leading-tight text-white">{audit.verdict}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <h4 className="font-bold text-emerald-400">Skills Matched</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {audit.matches.map(skill => (
                            <span key={skill} className="px-3 py-1 rounded-lg bg-emerald-400/10 text-xs font-bold text-emerald-300">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <h4 className="font-bold text-amber-400">Critical Gaps</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {audit.gaps.map(skill => (
                            <span key={skill} className="px-3 py-1 rounded-lg bg-amber-400/10 text-xs font-bold text-amber-300">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full transition-all group-hover:scale-150" />

                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                    <h4 className="text-xl font-bold text-white">Actionable Game Plan</h4>
                </div>

                <div className="space-y-4 relative z-10">
                    {audit.actionableAdvice.map((advice, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center text-[10px] font-bold text-blue-300 mt-1 shrink-0">
                                {idx + 1}
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed font-medium">
                                {advice}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ResumeAuditor;
