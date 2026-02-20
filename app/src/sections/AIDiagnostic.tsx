import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

interface AIDiagnosticProps {
    token: string | null;
    onBack: () => void;
}

const AIDiagnostic: React.FC<AIDiagnosticProps> = ({ token, onBack }) => {
    const [results, setResults] = useState<{
        groq?: { status: string; message: string };
        loading: boolean;
    }>({ loading: false });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const runTest = async () => {
        if (!token) {
            setResults({
                loading: false,
                groq: { status: 'error', message: 'Auth token missing' }
            });
            return;
        }
        setResults({ loading: true });
        try {
            const response = await axios.post(
                `${API_URL}/api/diag/test-ai`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResults({
                groq: response.data.groq,
                loading: false
            });
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message || 'Server error';
            setResults({
                loading: false,
                groq: { status: 'error', message: msg }
            });
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold mb-4">AI Connectivity Diagnostic</h1>

            <div className="flex gap-4 mb-8">
                <Button onClick={onBack} variant="outline" className="text-white/60 hover:text-white transition-colors">
                    Back to Dashboard
                </Button>
                <Button onClick={runTest} disabled={results.loading} className="btn-primary">
                    {results.loading ? <Activity className="animate-spin mr-2" /> : 'Run AI Test'}
                </Button>
            </div>

            <div className="space-y-6">
                <Card className="p-8 card-clinical border shadow-lg bg-black/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold flex items-center gap-3">
                            <Activity className="w-6 h-6 text-purple-400" />
                            Groq AI (Llama 3.1)
                        </h2>
                    </div>

                    {results.groq ? (
                        <div className={`p-6 rounded-xl flex items-start gap-4 transition-all duration-300 ${results.groq.status === 'success'
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
                            {results.groq.status === 'success' ? (
                                <CheckCircle className="w-6 h-6 shrink-0" />
                            ) : (
                                <XCircle className="w-6 h-6 shrink-0" />
                            )}
                            <div className="flex-1">
                                <p className="font-bold text-lg">{results.groq.status === 'success' ? 'Provider Active' : 'Provider Offline'}</p>
                                <p className="text-sm mt-2 opacity-90 leading-relaxed font-mono bg-black/20 p-3 rounded border border-white/5">
                                    {results.groq.message}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                            <p className="text-white/40 italic">Waiting for diagnostic test...</p>
                        </div>
                    )}
                </Card>
            </div>

            <Alert className="mt-8 bg-purple-500/5 border-purple-500/20 backdrop-blur-sm">
                <Activity className="h-5 w-5 text-purple-400" />
                <AlertTitle className="text-purple-300 font-semibold mb-2">How it works</AlertTitle>
                <AlertDescription className="text-white/60 leading-relaxed">
                    This test executes a direct handshake with the Groq API through your secure backend.
                    It verifies that your <code>GROQ_API_KEY</code> is active and the Llama 3.1 model is responsive.
                    If the test fails, ensure your key is valid in <code>server/.env</code>.
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default AIDiagnostic;
