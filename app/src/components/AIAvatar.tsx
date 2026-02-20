import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAvatarProps {
    persona: 'Karan' | 'Priya';
    isThinking?: boolean;
    isSpeaking?: boolean;
    isSimple?: boolean;
    emotion?: 'neutral' | 'impressed' | 'critical' | 'smiling';
    liveStats?: {
        stress: number;
        dnaMatch: number;
        emotionalState: string;
    };
}

const AIAvatar: React.FC<AIAvatarProps> = ({
    persona,
    isThinking,
    isSpeaking,
    isSimple = false,
    emotion = 'neutral',
    liveStats = { stress: 0, dnaMatch: 50, emotionalState: 'Scanning...' }
}) => {
    const isKaran = persona === 'Karan';
    const primaryColor = isKaran ? '#30D8A8' : '#A855F7'; // Green for Karan, Purple for Priya
    const secondaryColor = isKaran ? '#07080A' : '#1A1B1E';

    if (isSimple) {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Minimalist Glowing Core */}
                <motion.div
                    animate={{
                        boxShadow: isSpeaking
                            ? [`0 0 20px ${primaryColor}40`, `0 0 40px ${primaryColor}60`, `0 0 20px ${primaryColor}40`]
                            : `0 0 15px ${primaryColor}20`
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="relative w-16 h-16 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden"
                >
                    <svg viewBox="0 0 100 100" className="w-12 h-12">
                        {/* Eyes Only */}
                        <motion.circle
                            cx="35" cy="50" r="3"
                            fill={primaryColor}
                            animate={{
                                scaleY: isThinking ? [1, 0.1, 1] : 1,
                                opacity: isSpeaking ? [0.6, 1, 0.6] : 1
                            }}
                            transition={{ repeat: Infinity, duration: 2, times: [0, 0.05, 0.1] }}
                        />
                        <motion.circle
                            cx="65" cy="50" r="3"
                            fill={primaryColor}
                            animate={{
                                scaleY: isThinking ? [1, 0.1, 1] : 1,
                                opacity: isSpeaking ? [0.6, 1, 0.6] : 1
                            }}
                            transition={{ repeat: Infinity, duration: 2, times: [0, 0.05, 0.1], delay: 0.1 }}
                        />
                        {/* Subtle Scanner Line */}
                        <motion.rect
                            width="40" height="1"
                            x="30" y="55"
                            fill={primaryColor}
                            opacity="0.2"
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    </svg>
                </motion.div>

                {/* Minimal HUD overlay if needed, but keeping it very clean */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 flex justify-between px-2 pt-1">
                        <span className="text-[6px] font-mono text-white/20 uppercase tracking-tighter">
                            DNA: {liveStats.dnaMatch}%
                        </span>
                        <span className="text-[6px] font-mono text-white/20 uppercase tracking-tighter">
                            STRESS: {liveStats.stress}%
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-square flex items-center justify-center group">
            {/* Background Pulse */}
            <AnimatePresence>
                {(isThinking || isSpeaking) && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 0.15 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                    />
                )}
            </AnimatePresence>

            {/* Main Avatar SVG */}
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full relative z-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Tactical HUD Elements for Karan */}
                {isKaran && (
                    <g className="hud-elements">
                        {/* Outer Glow Ring */}
                        <circle
                            cx="50" cy="50" r="48"
                            stroke={primaryColor}
                            strokeWidth="0.5"
                            strokeDasharray="4 4"
                            opacity="0.2"
                        >
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0 50 50"
                                to="360 50 50"
                                dur="20s"
                                repeatCount="indefinite"
                            />
                        </circle>
                        {/* Inner Bracket HUD */}
                        <path d="M 20,20 L 10,20 L 10,10 L 20,10" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
                        <path d="M 80,20 L 90,20 L 90,10 L 80,10" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
                        <path d="M 20,80 L 10,80 L 10,90 L 20,90" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
                        <path d="M 80,80 L 90,80 L 90,90 L 80,90" stroke={primaryColor} strokeWidth="1" opacity="0.5" />

                        {/* Scanning Line */}
                        <motion.rect
                            width="80" height="1"
                            x="10"
                            fill={primaryColor}
                            opacity="0.3"
                            animate={{ y: [20, 80, 20] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        />
                    </g>
                )}

                {/* Face Shape / Data Core */}
                <motion.path
                    d={isKaran
                        ? "M 30,50 Q 30,30 50,30 Q 70,30 70,50 L 70,70 Q 70,80 50,80 Q 30,80 30,70 Z"
                        : "M 20,50 Q 20,20 50,20 Q 80,20 80,50 L 80,70 Q 80,90 50,90 Q 20,90 20,70 Z"
                    }
                    fill={secondaryColor}
                    stroke={primaryColor}
                    strokeWidth={isKaran ? "1.5" : "2"}
                    animate={{
                        y: isSpeaking ? [0, -2, 0] : 0,
                        opacity: isKaran ? [0.8, 1, 0.8] : 1
                    }}
                    transition={{ repeat: Infinity, duration: isKaran ? 2 : 0.5 }}
                />

                {/* Eyes - Reimagined as Sensors for Karan */}
                <g className="eyes">
                    <motion.circle
                        cx={isKaran ? "40" : "35"} cy="50" r={isKaran ? "2" : "3"}
                        stroke={primaryColor}
                        strokeWidth="1.5"
                        animate={{
                            scaleY: isThinking ? [1, 0.1, 1] : 1,
                        }}
                        transition={{ repeat: Infinity, duration: 3, times: [0, 0.05, 0.1] }}
                    />
                    <motion.circle
                        cx={isKaran ? "60" : "65"} cy="50" r={isKaran ? "2" : "3"}
                        stroke={primaryColor}
                        strokeWidth="1.5"
                        animate={{
                            scaleY: isThinking ? [1, 0.1, 1] : 1,
                        }}
                        transition={{ repeat: Infinity, duration: 3, times: [0, 0.05, 0.1], delay: 0.1 }}
                    />
                </g>

                {/* Mouth / Data Spectrum */}
                {isKaran && isSpeaking ? (
                    <g>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <motion.rect
                                key={i}
                                x={42 + i * 3.5}
                                y="65"
                                width="2"
                                height="8"
                                fill={primaryColor}
                                animate={{ height: [4, 12, 4] }}
                                transition={{ repeat: Infinity, duration: 0.2, delay: i * 0.05 }}
                            />
                        ))}
                    </g>
                ) : (
                    <motion.path
                        d={
                            emotion === 'smiling' ? "M 40,70 Q 50,75 60,70" :
                                emotion === 'impressed' ? "M 42,72 Q 50,78 58,72" :
                                    emotion === 'critical' ? "M 42,75 Q 50,72 58,75" :
                                        "M 45,75 L 55,75" // neutral
                        }
                        stroke={primaryColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={{
                            d: isSpeaking && !isKaran
                                ? ["M 45,75 L 55,75", "M 45,70 Q 50,85 55,70", "M 45,75 L 55,75"]
                                : undefined
                        }}
                        transition={{ repeat: Infinity, duration: 0.2 }}
                    />
                )}

                {/* Accessory Detail */}
                {!isKaran && (
                    <circle cx="20" cy="70" r="1.5" fill={primaryColor} opacity="0.8" />
                )}
            </svg>

            {/* Persona Label */}
            <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur shadow-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                    {persona}
                </span>
            </div>

            {/* Tactical HUD Overlay for Karan */}
            {isKaran && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                    {/* Stress Level HUD */}
                    <div className="absolute top-2 left-6 flex flex-col items-start">
                        <span className="text-[7px] font-mono text-white/40 uppercase">Stress</span>
                        <div className="flex items-center gap-1">
                            <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-red-500"
                                    animate={{ width: `${liveStats.stress}%` }}
                                />
                            </div>
                            <span className="text-[8px] font-mono" style={{ color: liveStats.stress > 70 ? '#EF4444' : primaryColor }}>
                                {liveStats.stress}%
                            </span>
                        </div>
                    </div>

                    {/* DNA Match HUD */}
                    <div className="absolute top-2 right-6 flex flex-col items-end">
                        <span className="text-[7px] font-mono text-white/40 uppercase">DNA Match</span>
                        <span className="text-[8px] font-mono" style={{ color: primaryColor }}>
                            {liveStats.dnaMatch}%
                        </span>
                    </div>

                    {/* Vitals Pulse */}
                    <div className="absolute bottom-6 left-6 flex flex-col items-start translate-y-2">
                        <div className="flex items-center gap-1">
                            <motion.div
                                className="w-1 h-1 rounded-full bg-red-500"
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            />
                            <span className="text-[6px] font-mono text-white/40 uppercase">Vitals</span>
                        </div>
                        <span className="text-[8px] font-mono text-white/60 truncate max-w-[60px]">
                            {liveStats.emotionalState.split('/')[0]}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAvatar;
