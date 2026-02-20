
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

interface OutcomeAppealProps {
    onSumbit: (reason: string) => void;
    status: 'PENDING' | 'SUBMITTED' | 'IDLE';
}

export const OutcomeAppeal: React.FC<OutcomeAppealProps> = ({ onSumbit, status }) => {
    const [reason, setReason] = useState('');

    return (
        <div className="card-clinical p-6 border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-yellow-500/10">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-1">Human-in-the-Loop Appeal</h3>
                    <p className="text-sm text-white/50">Did the measurement fail to capture your intent? Provide technical context below to trigger a human audit.</p>
                </div>
            </div>

            {status === 'SUBMITTED' ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                >
                    <ShieldCheck className="w-12 h-12 text-[#30D8A8] mb-4" />
                    <h4 className="text-xl font-bold mb-2">Appeal Transmitted</h4>
                    <p className="text-sm text-white/50 max-w-xs">Your technical context has been appended to the Master Report for senior engineering review.</p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain why a specific signal (e.g., lack of metrics) was an architectural choice rather than a gap..."
                        className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-[#30D8A8]/50 focus:ring-1 focus:ring-[#30D8A8]/50 outline-none transition-all resize-none"
                    />

                    <button
                        onClick={() => onSumbit(reason)}
                        disabled={!reason.trim() || status === 'PENDING'}
                        className="w-full py-3 rounded-xl bg-yellow-500 text-black font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50"
                    >
                        {status === 'PENDING' ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Sumbit Appeal Context
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
