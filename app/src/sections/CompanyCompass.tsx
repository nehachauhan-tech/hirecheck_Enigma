import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Compass,
    ArrowLeft,
    Building2,
    ChevronRight,
    Search,
    TrendingUp
} from 'lucide-react';
import ResumeAuditor from '../components/ResumeAuditor';
import { PrepBlueprint } from '../components/PrepBlueprint';
import { X } from 'lucide-react';

interface CompanyCompassProps {
    token: string;
    onBack: () => void;
    onStartInterview: (data: any) => void;
}

const companies = [
    {
        id: 'TCS',
        name: 'TATA Consultancy Services',
        shortName: 'TCS',
        category: 'Service MNC',
        color: 'blue',
        description: 'NQT based entry and foundation focused technical interviews.',
        traits: ['NQT Filtered', 'DBMS & OOPs Focus', 'Reliability'],
        expectations: ['Core JS', 'SQL Fundamentals', 'Project Detail']
    },
    {
        id: 'Deloitte',
        name: 'Deloitte',
        shortName: 'Deloitte',
        category: 'Consulting',
        color: 'emerald',
        description: 'Hypothesis-driven case interviews and consultative architecture screens.',
        traits: ['Case Analysis', 'Client Readiness', 'Structured Logic'],
        expectations: ['MECE Framework', '3-Tier Architecture', 'Defensibility']
    },
    {
        id: 'Amazon',
        name: 'Amazon',
        shortName: 'Amazon',
        category: 'Product MNC',
        color: 'amber',
        description: 'Bar Raiser loops and extreme focus on Leadership Principles.',
        traits: ['Leadership Principles', 'Bar Raisers', 'Scalability'],
        expectations: ['STAR Stories', 'DSA Optimization', '$1M+ Impact']
    },
    {
        id: 'Google',
        name: 'Google',
        shortName: 'Google',
        category: 'Product MNC',
        color: 'red',
        description: 'First-principles engineering focusing on complexity and performance optimization.',
        traits: ['Big O Mastery', 'Theoretical Depth', 'Scale'],
        expectations: ['LRU Design', 'Graph Algorithms', 'Complexity Proofs']
    },
    {
        id: 'Meta',
        name: 'Meta',
        shortName: 'Meta',
        category: 'Product MNC',
        color: 'blue',
        description: 'Product-focused loops with emphasis on frontend efficiency and data-driven UI.',
        traits: ['React Internals', 'Relay/GraphQL', 'UX Performance'],
        expectations: ['Feed Virtualization', 'Optimistic UI', 'State Resilience']
    },
    {
        id: 'Netflix',
        name: 'Netflix',
        shortName: 'Netflix',
        category: 'Product MNC',
        color: 'rose',
        description: 'High-stakes resilience engineering and radical candor culture alignment.',
        traits: ['Chaos Engineering', 'Resilience', 'Radical Candor'],
        expectations: ['Circuit Breakers', 'Backpressure', 'Observability']
    },
    {
        id: 'Microsoft',
        name: 'Microsoft',
        shortName: 'Microsoft',
        category: 'Product MNC',
        color: 'indigo',
        description: 'Engineering judgment focused on extensibility and growth mindset.',
        traits: ['Design Maturity', 'Extensibility', 'Authentic Ownership'],
        expectations: ['Backward Compatibility', 'System Design', 'Honesty']
    },
    {
        id: 'Accenture',
        name: 'Accenture',
        shortName: 'Accenture',
        category: 'Service MNC',
        color: 'purple',
        description: 'Gamified cognitive screening and automated communication tests.',
        traits: ['Gamified Rounds', 'Verbal Fluency', 'Digital Fluency'],
        expectations: ['SOAR Method', 'Pattern Matching', 'Clear Voice']
    },
    {
        id: 'Startup (Seed-Growth)',
        name: 'Modern Startups',
        shortName: 'Startups',
        category: 'Startup',
        color: 'rose',
        description: 'High-velocity shipping ability and zero-to-one product thinking.',
        traits: ['Founder Mindset', 'Velocity', 'Generalist Power'],
        expectations: ['Pair Programming', 'Build-from-scratch', 'Ownership']
    },
    {
        id: 'Zomato',
        name: 'Zomato',
        shortName: 'Zomato',
        category: 'Startup',
        color: 'red',
        description: 'Product-centric engineering focusing on AI Agents and single-table DynamoDB design.',
        traits: ['AI Agents', 'DynamoDB', 'RAG Context'],
        expectations: ['Product Engineering', 'Zero-to-One', 'Outcome Driven']
    },
    {
        id: 'Swiggy',
        name: 'Swiggy',
        shortName: 'Swiggy',
        category: 'Startup',
        color: 'orange',
        description: 'Machine coding rigorous rounds with emphasis on Vanilla JS and sub-second latency.',
        traits: ['Machine Coding', 'Vanilla JS', 'Kafka Streaming'],
        expectations: ['Performance', 'Code-compiles-first', 'Observability']
    },
    {
        id: 'Razorpay',
        name: 'Razorpay',
        shortName: 'Razorpay',
        category: 'Product MNC',
        color: 'sky',
        description: 'Architectural rigor in fintech with zero-tolerance for security or integrity flaws.',
        traits: ['Fintech Security', 'Idempotency', 'RBAC'],
        expectations: ['Transactional Integrity', 'Compliance', 'Security First']
    }
];

const CompanyCompass: React.FC<CompanyCompassProps> = ({ token, onBack, onStartInterview }) => {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [step, setStep] = useState<'grid' | 'details' | 'audit'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('Full-Stack (MERN)');
    const [selectedExp, setSelectedExp] = useState('Fresher');
    const [showBlueprint, setShowBlueprint] = useState(false);

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#07080A] text-white selection:bg-[#30D8A8]/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#30D8A8]/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <motion.button
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        onClick={onBack}
                        className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Dashboard</span>
                    </motion.button>

                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex items-center gap-4"
                    >
                        <button
                            onClick={() => setShowBlueprint(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Mastery Roadmap
                        </button>

                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <Compass className="w-5 h-5 text-[#30D8A8]" />
                            <span className="text-sm font-bold tracking-wider uppercase opacity-80">Company Compass 2026</span>
                        </div>
                    </motion.div>
                </div>

                {/* Intro Section */}
                <div className="mb-16">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight"
                    >
                        Target <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30D8A8] to-blue-500">Industry Leaders.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-white/60 max-w-2xl leading-relaxed"
                    >
                        Switch from generic practice to precision targeting. Meet <span className="text-white font-bold">Karan</span>, our Lead Corporate Interviewer, trained on the specific hiring blueprints of top MNCs and Startups.
                    </motion.p>
                </div>

                {/* Search Bar */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative mb-12"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search company or category (e.g., Deloitte, Startup)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-[#30D8A8]/50 focus:bg-white/10 transition-all text-lg placeholder:text-white/20"
                    />
                </motion.div>

                {/* Company Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredCompanies.map((company) => (
                        <motion.button
                            key={company.id}
                            variants={itemVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setSelectedCompany(company.id);
                                setStep('details');
                            }}
                            className="group text-left p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#30D8A8]/30 hover:bg-white/[0.07] transition-all relative overflow-hidden"
                        >
                            {/* Card Glow */}
                            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${company.color}-500/10 blur-2xl rounded-full group-hover:scale-150 transition-transform`} />

                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-${company.color}-500/20 flex items-center justify-center border border-${company.color}-500/30`}>
                                    <Building2 className={`w-7 h-7 text-${company.color}-400`} />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    {company.category}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-3 group-hover:text-[#30D8A8] transition-colors">{company.name}</h3>
                            <p className="text-sm text-white/50 mb-6 leading-relaxed">
                                {company.description}
                            </p>

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {company.traits.map(trait => (
                                        <span key={trait} className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-bold text-white/60">
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5 text-[#30D8A8] font-bold text-sm tracking-wide">
                                <span>Enter Compass Loop</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Experience Level & Role Modal (Future) */}
                <AnimatePresence>
                    {step === 'details' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-lg"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-[#0C0D0F] border border-white/10 w-full max-w-2xl rounded-[32px] p-10 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#30D8A8] to-blue-500" />

                                <h2 className="text-4xl font-bold mb-2">Simulate {selectedCompany}</h2>
                                <p className="text-white/40 mb-8 font-medium">Select your target profile to begin the Karan loop.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest text-[#30D8A8]">Target Role</label>
                                        <div className="space-y-2">
                                            {['Frontend Developer', 'Backend Developer', 'Full-Stack (MERN)', 'Data Analyst'].map(role => (
                                                <button
                                                    key={role}
                                                    onClick={() => setSelectedRole(role)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedRole === role ? 'border-[#30D8A8] bg-[#30D8A8]/10' : 'border-white/5 bg-white/5 hover:border-[#30D8A8]'}`}
                                                >
                                                    <span className="font-semibold">{role}</span>
                                                    <div className={`w-2 h-2 rounded-full transition-all ${selectedRole === role ? 'bg-[#30D8A8]' : 'bg-white/10 group-hover:bg-[#30D8A8]'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest text-blue-400">Experience</label>
                                        <div className="space-y-2">
                                            {['Fresher', '1-3 Years', '3-5 Years', '5+ Years'].map(exp => (
                                                <button
                                                    key={exp}
                                                    onClick={() => setSelectedExp(exp)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedExp === exp ? 'border-blue-400 bg-blue-400/10' : 'border-white/5 bg-white/5 hover:border-blue-400'}`}
                                                >
                                                    <span className="font-semibold">{exp}</span>
                                                    <div className={`w-2 h-2 rounded-full transition-all ${selectedExp === exp ? 'bg-blue-400' : 'bg-white/10 group-hover:bg-blue-400'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#15171B] rounded-2xl p-6 border border-white/5 mb-8 flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-[#30D8A8]/10">
                                        <TrendingUp className="w-6 h-6 text-[#30D8A8]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Deep Resume Audit Available</h4>
                                        <p className="text-sm text-white/40 leading-relaxed">Karan is ready to perform a high-fidelity audit of your resume against {selectedCompany} standards.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep('grid')}
                                        className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setStep('audit')}
                                        className="flex-[2] py-4 rounded-xl bg-blue-600 text-white font-bold hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all"
                                    >
                                        Run Deep Audit
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {step === 'audit' && selectedCompany && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-lg"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-[#0C0D0F] border border-white/10 w-full max-w-2xl rounded-[32px] p-10 relative overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#30D8A8] to-blue-500" />

                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-3xl font-bold mb-1">Audit Results</h2>
                                        <p className="text-white/40 font-medium">{selectedCompany} Loop Preparation</p>
                                    </div>
                                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60">
                                        {selectedRole} • {selectedExp}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-8">
                                    <ResumeAuditor
                                        token={token}
                                        company={selectedCompany}
                                        role={selectedRole}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => setStep('details')}
                                        className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all text-white/60"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => onStartInterview({
                                            company: selectedCompany,
                                            role: selectedRole,
                                            experience: selectedExp
                                        })}
                                        className="flex-[2] py-4 rounded-xl bg-[#30D8A8] text-[#07080A] font-bold hover:shadow-[0_0_30px_rgba(48,216,168,0.4)] transition-all"
                                    >
                                        Accept Verdict & Start Loop
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Prep Blueprint Modal */}
                    {showBlueprint && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 40 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-[#07080A] border border-white/10 w-full max-w-4xl rounded-[40px] p-12 relative overflow-hidden"
                            >
                                <button
                                    onClick={() => setShowBlueprint(false)}
                                    className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <PrepBlueprint />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CompanyCompass;
