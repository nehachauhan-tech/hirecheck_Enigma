import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User as UserIcon,
    Zap,
    Trophy,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Code2,
    Database,
    Globe,
    Monitor,
    Shield,
    Target,
    Bug,
    FileCode2,
    Compass,
    Award
} from 'lucide-react';

interface InterviewSetupProps {
    problem: {
        id: string;
        title: string;
        difficulty: string;
        mode?: string;
    };
    onBack: () => void;
    onStart: (setupData: {
        persona: 'Priya' | 'Arjun' | 'Vikram' | 'Karan';
        mode: 'marathon' | 'sprint' | 'debug' | 'review' | 'compass';
        targetTopic?: string;
        marathonDifficulty?: 'easy' | 'intermediate' | 'hard' | 'advanced';
        targetCompany?: string;
        targetRole?: string;
        experienceLevel?: string;
    }) => void;
    targetCompany?: string;
    targetRole?: string;
    experienceLevel?: string;
}

const PERSONAS = [
    {
        id: 'Priya',
        name: 'Priya',
        role: 'The Mentor',
        description: 'Supportive, encouraging, and perfect for warming up.',
        color: 'from-blue-500 to-cyan-400',
        difficulty: 'Easy'
    },
    {
        id: 'Vikram',
        name: 'Vikram',
        role: 'The Lead',
        description: 'Direct, practical, and focuses on production-ready code.',
        color: 'from-[#30D8A8] to-emerald-400',
        difficulty: 'Medium'
    },
    {
        id: 'Arjun',
        name: 'Arjun',
        role: 'The Architect',
        description: 'Strict, demanding, and obsessed with optimization.',
        color: 'from-orange-500 to-red-400',
        difficulty: 'Hard'
    },
    {
        id: 'Karan',
        name: 'Karan',
        role: 'The Corporate Master',
        description: 'Unlocks the secrets of MNC & Startup hiring loops.',
        color: 'from-blue-600 to-indigo-600',
        difficulty: 'Adaptive',
        isCompassOnly: true
    }
];

const MODES = [
    {
        id: 'marathon',
        name: 'The Marathon',
        description: 'Full 4-round experience. Intro, Theory, Practical, Review.',
        icon: Trophy,
        color: 'border-[#30D8A8]/30'
    },
    {
        id: 'sprint',
        name: 'Topic Sprint',
        description: 'Targeted practice on one specific stack component.',
        icon: Zap,
        color: 'border-orange-500/30'
    },
    {
        id: 'debug',
        name: 'Debugger Mode',
        description: 'Fix broken code and resolve complex bugs.',
        icon: Bug,
        color: 'border-red-500/30'
    },
    {
        id: 'review',
        name: 'Code Review',
        description: 'Critique bad code and refactor for best practices.',
        icon: FileCode2,
        color: 'border-purple-500/30'
    },
    {
        id: 'compass',
        name: 'Company Compass',
        description: 'Targeted company simulation and career navigation.',
        icon: Compass,
        color: 'border-blue-500/30'
    },
    {
        id: 'expert-sprint',
        name: 'Expert Sprint',
        description: '2 Progressive Hard Problems. Stricter evaluation & quality audits.',
        icon: Award,
        color: 'border-yellow-500/30'
    }
];

const TOPICS = [
    { id: 'JavaScript', icon: Globe, label: 'JavaScript' },
    { id: 'React.js', icon: Monitor, label: 'React.js' },
    { id: 'Node/Express', icon: Code2, label: 'Node/Express' },
    { id: 'MongoDB', icon: Database, label: 'MongoDB' }
];

const MARATHON_DIFFICULTIES = [
    {
        id: 'easy',
        name: 'Easy',
        description: '3 Easy Problems. Good for warming up.',
        icon: Shield,
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/30'
    },
    {
        id: 'intermediate',
        name: 'Intermediate',
        description: '1 Easy + 2 Medium. The standard interview loop.',
        icon: Target,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/30'
    },
    {
        id: 'hard',
        name: 'Hard',
        description: '2 Medium + 1 Hard. For senior roles.',
        icon: Zap,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/30'
    },
    {
        id: 'advanced',
        name: 'Advanced',
        description: '1 Medium + 2 Hard. Prepare for FAANG.',
        icon: Trophy,
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/30'
    }
];

export default function InterviewSetup({ problem: _problem, onBack, onStart, targetCompany, targetRole, experienceLevel }: InterviewSetupProps) {
    const [step, setStep] = useState(targetCompany ? 3 : 1);
    const [selectedPersona, setSelectedPersona] = useState(targetCompany ? PERSONAS[3] : PERSONAS[1]);

    // Pre-select mode from problem data if available
    const initialModeId = _problem.mode || (targetCompany ? MODES[4].id : MODES[0].id);
    const initialMode = MODES.find(m => m.id === initialModeId) || MODES[0];

    const [selectedMode, setSelectedMode] = useState(initialMode);
    const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
    const [selectedMarathonDiff, setSelectedMarathonDiff] = useState(MARATHON_DIFFICULTIES[1]);

    const handleStart = () => {
        onStart({
            persona: selectedPersona.id as any,
            mode: selectedMode.id as any,
            targetTopic: selectedMode.id === 'sprint' ? selectedTopic.id : undefined,
            marathonDifficulty: selectedMode.id === 'marathon' ? selectedMarathonDiff.id as any : undefined,
            targetCompany,
            targetRole,
            experienceLevel
        });
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <div className="min-h-screen bg-[#07080A] text-white p-6 flex items-center justify-center">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl w-full"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={step === 1 ? onBack : () => setStep(step - 1)}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <div className="flex items-center gap-4">
                        <div className={`h-1 w-12 rounded-full ${step >= 1 ? 'bg-[#30D8A8]' : 'bg-white/10'}`} />
                        <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-[#30D8A8]' : 'bg-white/10'}`} />
                        <div className={`h-1 w-12 rounded-full ${step >= 3 ? 'bg-[#30D8A8]' : 'bg-white/10'}`} />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h1 className="text-4xl font-display font-bold mb-2">Choose Your Interviewer</h1>
                            <p className="text-white/50 mb-8">Each interviewer has a different personality and focus area.</p>

                            <div className="grid md:grid-cols-3 gap-6">
                                {PERSONAS.filter(p => {
                                    if (selectedMode.id === 'compass') return (p as any).isCompassOnly;
                                    return !(p as any).isCompassOnly;
                                }).map((p) => (
                                    <motion.div
                                        key={p.id}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedPersona(p)}
                                        className={`relative p-6 rounded-2xl cursor-pointer border-2 transition-all ${selectedPersona.id === p.id
                                            ? 'border-[#30D8A8] bg-[#30D8A8]/5 shadow-[0_0_30px_-10px_#30D8A8]'
                                            : 'border-white/5 bg-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}>
                                            <UserIcon className="w-6 h-6 text-black" />
                                        </div>
                                        {selectedPersona.id === p.id && (
                                            <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-[#30D8A8]" />
                                        )}
                                        <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                                        <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                                            {p.role} • {p.difficulty}
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            {p.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={() => setStep(2)}
                                    className="btn-primary group"
                                >
                                    Continue to Mode
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h1 className="text-4xl font-display font-bold mb-2">Select Interview Mode</h1>
                            <p className="text-white/50 mb-8">Decide if you want a full marathon or a targeted sprint.</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                {MODES.filter(m => m.id === 'marathon' || m.id === 'sprint').map((m) => (
                                    <motion.div
                                        key={m.id}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedMode(m)}
                                        className={`relative p-8 rounded-2xl cursor-pointer border-2 transition-all flex gap-6 items-start ${selectedMode.id === m.id
                                            ? 'border-[#30D8A8] bg-[#30D8A8]/5'
                                            : 'border-white/10 bg-white/5'
                                            }`}
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                            <m.icon className={`w-8 h-8 ${selectedMode.id === m.id ? 'text-[#30D8A8]' : 'text-white/40'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-2">{m.name}</h3>
                                            <p className="text-white/50 leading-relaxed">
                                                {m.description}
                                            </p>
                                        </div>
                                        {selectedMode.id === m.id && (
                                            <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-[#30D8A8]" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={() => setStep(3)}
                                    className="btn-primary group"
                                >
                                    {selectedMode.id === 'sprint' ? 'Select Topic' : selectedMode.id === 'marathon' ? 'Select Difficulty' : 'Start Challenge'}
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (selectedMode.id === 'debug' || selectedMode.id === 'review' || selectedMode.id === 'compass' || selectedMode.id === 'expert-sprint') && (
                        <motion.div
                            key="step3-specialist"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h1 className="text-4xl font-display font-bold mb-2">
                                {selectedMode.id === 'debug' ? 'Debugger Challenge' :
                                    selectedMode.id === 'review' ? 'Code Review' :
                                        selectedMode.id === 'expert-sprint' ? 'Expert Sprint Challenge' :
                                            `Target: ${targetCompany}`}
                            </h1>
                            <p className="text-white/50 mb-8">
                                {selectedMode.id === 'debug'
                                    ? 'You will be presented with broken code. Your task is to find the bug and fix it.'
                                    : selectedMode.id === 'review'
                                        ? 'You will see code that works but smells. Refactor it to be clean and performant.'
                                        : selectedMode.id === 'expert-sprint'
                                            ? 'Two back-to-back hard problems with strict time limits and code quality audits.'
                                            : `Simulating a real ${targetCompany} interview loop for a ${targetRole} role.`}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${selectedMode.id === 'debug' ? 'bg-red-500/20 text-red-500' :
                                        selectedMode.id === 'review' ? 'bg-purple-500/20 text-purple-500' :
                                            selectedMode.id === 'expert-sprint' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {selectedMode.id === 'debug' ? <Bug className="w-6 h-6" /> :
                                            selectedMode.id === 'review' ? <FileCode2 className="w-6 h-6" /> :
                                                selectedMode.id === 'expert-sprint' ? <Award className="w-6 h-6" /> :
                                                    <Compass className="w-6 h-6" />}
                                    </div>
                                    <h3 className="text-lg font-bold mb-1 text-white select-none uppercase tracking-wider">Final Verification</h3>
                                    <p className="text-xs text-[#30D8A8]/60 font-medium">
                                        You are fully audited and cleared for launch.
                                    </p>
                                </div>

                                {selectedMode.id === 'compass' && (
                                    <motion.div
                                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(48, 216, 168, 0.08)' }}
                                        className="bg-[#30D8A8]/5 border border-[#30D8A8]/20 rounded-2xl p-6 transition-colors cursor-default"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <Shield className="w-6 h-6 text-[#30D8A8]" />
                                            <h3 className="text-lg font-bold text-[#30D8A8]">Mentorship Briefing</h3>
                                        </div>
                                        <ul className="space-y-4 text-sm text-white/70">
                                            <motion.li
                                                whileHover={{ x: 4, color: '#30D8A8' }}
                                                className="flex items-start gap-2 cursor-help transition-colors p-2 rounded-lg hover:bg-white/5"
                                                title="The AI will verify your claims by asking depth-first questions about your stack."
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#30D8A8] mt-1.5 shrink-0" />
                                                <span>AI will audit your resume in real-time.</span>
                                            </motion.li>
                                            <motion.li
                                                whileHover={{ x: 4, color: '#30D8A8' }}
                                                className="flex items-start gap-2 cursor-help transition-colors p-2 rounded-lg hover:bg-white/5"
                                                title="We target the specific 'Secret Triggers' that corporate evaluators use to filter candidates."
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#30D8A8] mt-1.5 shrink-0" />
                                                <span>Focus on {targetCompany} "Secret Triggers".</span>
                                            </motion.li>
                                        </ul>
                                    </motion.div>
                                )}
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={handleStart}
                                    className={`btn-primary group ${selectedMode.id === 'debug' ? 'bg-red-500 hover:bg-red-600' :
                                        selectedMode.id === 'review' ? 'bg-purple-500 hover:bg-purple-600' :
                                            'bg-[#30D8A8] text-[#07080A]'
                                        }`}
                                >
                                    Launch {selectedMode.id === 'compass' ? 'Company Compass' :
                                        selectedMode.id === 'expert-sprint' ? 'Expert Sprint' :
                                            selectedMode.name}
                                    <Zap className="w-5 h-5 ml-2 fill-current" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && selectedMode.id === 'sprint' && (
                        <motion.div
                            key="step3-sprint"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h1 className="text-4xl font-display font-bold mb-2">Select Your Sprint Topic</h1>
                            <p className="text-white/50 mb-8">Focus your 15-minute practice on a specific technology.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {TOPICS.map((t) => (
                                    <motion.div
                                        key={t.id}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedTopic(t)}
                                        className={`p-6 rounded-2xl cursor-pointer border-2 text-center transition-all ${selectedTopic.id === t.id
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-white/5 bg-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <t.icon className={`w-10 h-10 mx-auto mb-4 ${selectedTopic.id === t.id ? 'text-orange-500' : 'text-white/40'}`} />
                                        <span className={`font-bold ${selectedTopic.id === t.id ? 'text-white' : 'text-white/60'}`}>
                                            {t.label}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={handleStart}
                                    className="btn-primary bg-orange-500 hover:bg-orange-600 group"
                                >
                                    Launch Topic Sprint
                                    <Zap className="w-5 h-5 ml-2 fill-current" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && selectedMode.id === 'marathon' && (
                        <motion.div
                            key="step3-marathon"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h1 className="text-4xl font-display font-bold mb-2">Marathon Difficulty</h1>
                            <p className="text-white/50 mb-8">Choose the intensity of your interview session.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {MARATHON_DIFFICULTIES.map((d) => (
                                    <motion.div
                                        key={d.id}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedMarathonDiff(d)}
                                        className={`p-6 rounded-2xl cursor-pointer border-2 transition-all relative ${selectedMarathonDiff.id === d.id
                                            ? d.bg
                                            : 'border-white/5 bg-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 ${d.color}`}>
                                                <d.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold mb-1">{d.name}</h3>
                                                <p className="text-sm text-white/60">{d.description}</p>
                                            </div>
                                        </div>

                                        {selectedMarathonDiff.id === d.id && (
                                            <CheckCircle2 className={`absolute top-4 right-4 w-5 h-5 ${d.color}`} />
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button
                                    onClick={handleStart}
                                    className="btn-primary group"
                                >
                                    Start Marathon
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
