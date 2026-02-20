import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Brain,
  Target,
  Zap,
  MessageSquare,
  BarChart3,
  Award,
  ChevronRight,
  Download,
  Compass
} from 'lucide-react';
import type { Verdict } from '../types';
import SkillRadar from '../components/SkillRadar';
import { MasterReportCard } from '../components/MasterReportCard';
import { OutcomeAppeal } from './OutcomeAppeal';

interface VerdictReportProps {
  verdict: Verdict;
  onDashboard: () => void;
  onRetry: () => void;
  onNavigate?: (view: string) => void;
}

export default function VerdictReport({ verdict, onDashboard, onRetry, onNavigate }: VerdictReportProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'recommendations'>('overview');

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.8) return 'bg-green-400';
    if (score >= 0.6) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const dimensions = [
    { key: 'understanding', label: 'Understanding', icon: Brain, weight: 0.18 },
    { key: 'strategy', label: 'Strategy', icon: Target, weight: 0.20 },
    { key: 'recovery', label: 'Recovery', icon: RefreshCw, weight: 0.14 },
    { key: 'adaptability', label: 'Adaptability', icon: Zap, weight: 0.12 },
    { key: 'communication', label: 'Communication', icon: MessageSquare, weight: 0.16 },
    { key: 'optimization', label: 'Optimization', icon: TrendingUp, weight: 0.08 },
    { key: 'pressureStability', label: 'Pressure Stability', icon: BarChart3, weight: 0.12 }
  ];

  return (
    <div className="min-h-screen bg-[#07080A]">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onDashboard}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {verdict.archetype.toLowerCase().includes('corporate') || onNavigate ? 'Back to Compass' : 'Back to Dashboard'}
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate?.('compass')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <Compass className="w-4 h-4 text-blue-400" />
                Compass
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Main Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-clinical p-8 mb-8"
        >
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Score Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-white/10"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    initial={{ strokeDashoffset: `${2 * Math.PI * 70}` }}
                    animate={{ strokeDashoffset: `${2 * Math.PI * 70 * (1 - verdict.score)}` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={getScoreColor(verdict.score)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(verdict.score)}`}>
                    {Math.round(verdict.score * 100)}%
                  </span>
                  <span className="text-sm text-white/50">Overall</span>
                </div>
              </div>
            </div>

            {/* Verdict Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30D8A8]/10 text-[#30D8A8] text-sm">
                  <Award className="w-4 h-4" />
                  {verdict.archetype}
                </div>
                <div className="text-sm text-white/50">
                  Confidence: {Math.round(verdict.confidence * 100)}%
                </div>
              </div>

              <h1 className="font-display text-3xl font-bold mb-4">
                Interview Complete
              </h1>

              <p className="text-white/70 leading-relaxed mb-6">
                {verdict.explanation}
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={onRetry}
                  className="btn-primary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {verdict.archetype.toLowerCase().includes('corporate') ? 'Retake Compass Loop' : 'Try Another Problem'}
                </button>
                <button
                  onClick={onDashboard}
                  className="btn-secondary"
                >
                  {verdict.archetype.toLowerCase().includes('corporate') ? 'Exit to Compass' : 'Go to Dashboard'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(['overview', 'breakdown', 'recommendations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab
                ? 'bg-[#30D8A8] text-[#07080A]'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="card-clinical p-8 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#30D8A8]/5 blur-3xl rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />

                  <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="w-full md:w-1/2 aspect-square max-w-[400px]">
                      <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#30D8A8]" />
                        Behavioral Skill DNA
                      </h3>
                      <SkillRadar data={verdict.report} />
                    </div>

                    <div className="w-full md:w-1/2">
                      <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-400" />
                        Key Dimension Overview
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {dimensions.slice(0, 4).map((dim) => {
                          const score = verdict.report[dim.key as keyof typeof verdict.report];
                          return (
                            <div key={dim.key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5">
                                  <dim.icon className="w-4 h-4 text-[#30D8A8]" />
                                </div>
                                <span className="text-sm font-medium text-white/70">{dim.label}</span>
                              </div>
                              <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                                {Math.round(score * 100)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXPERT: Master Report Card Integration */}
                <MasterReportCard
                  history={[
                    { timestamp: Date.now(), score: verdict.score, company: verdict.archetype.split(' ')[0] },
                    { timestamp: Date.now() - 86400000, score: 0.65, company: 'Google' },
                    { timestamp: Date.now() - 172800000, score: 0.45, company: 'Amazon' }
                  ]}
                  dnaMatch={verdict.report}
                  velocity={0.12}
                  verdict={verdict.explanation}
                />

                <div className="card-clinical p-6">
                  <h3 className="font-display font-semibold mb-4">What This Means</h3>
                  <div className="space-y-4 text-white/70">
                    <p>
                      Your <strong className="text-white">{verdict.archetype}</strong> profile indicates
                      that you approach problems with a {verdict.report.strategy > 0.7 ? 'strategic mindset' : 'practical focus'},
                      {' '}{verdict.report.recovery > 0.7 ? 'recovering quickly from setbacks' : 'with room to improve in error recovery'}.
                    </p>
                    <p>
                      Under pressure, you {verdict.report.pressureStability > 0.7 ? 'maintain composure' : 'show some stress response'},
                      which is {verdict.report.pressureStability > 0.6 ? 'a positive indicator' : 'an area for development'} for real interview performance.
                    </p>
                  </div>
                </div>

                {/* EXPERT: Outcome Appeal Layer */}
                {verdict.score < 0.7 && (
                  <OutcomeAppeal
                    onSumbit={(reason) => console.log('Appeal submitted:', reason)}
                    status="IDLE"
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'breakdown' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-clinical p-6"
              >
                <h3 className="font-display font-semibold mb-6">Detailed Scoring Breakdown</h3>

                <div className="space-y-6">
                  {dimensions.map((dim, index) => {
                    const score = verdict.report[dim.key as keyof typeof verdict.report];
                    return (
                      <motion.div
                        key={dim.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                              <dim.icon className="w-5 h-5 text-[#30D8A8]" />
                            </div>
                            <div>
                              <div className="font-medium">{dim.label}</div>
                              <div className="text-xs text-white/50">
                                Weight: {Math.round(dim.weight * 100)}%
                              </div>
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                            {Math.round(score * 100)}%
                          </div>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${getScoreBg(score)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${score * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'recommendations' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="card-clinical p-6">
                  <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#30D8A8]" />
                    Recommended Next Steps
                  </h3>

                  <div className="space-y-4">
                    {verdict.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 bg-white/5 rounded-xl"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#30D8A8]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-[#30D8A8] font-medium">{index + 1}</span>
                        </div>
                        <p className="text-white/70">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="card-clinical p-6">
                  <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#30D8A8]" />
                    Suggested Practice Problems
                  </h3>

                  <div className="space-y-3">
                    {[
                      { title: 'Valid Parentheses', difficulty: 'easy', category: 'Stack' },
                      { title: 'Merge Intervals', difficulty: 'medium', category: 'Arrays' },
                      { title: 'LRU Cache', difficulty: 'medium', category: 'Design' }
                    ].map((problem) => (
                      <div
                        key={problem.title}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{problem.title}</div>
                          <div className="text-sm text-white/50">
                            {problem.category} • {problem.difficulty}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card-clinical p-6">
              <h3 className="font-display font-semibold mb-4">Interview Stats</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Duration</span>
                  <span className="font-mono">45:32</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Code Changes</span>
                  <span className="font-mono">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Test Runs</span>
                  <span className="font-mono">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Lines Written</span>
                  <span className="font-mono">42</span>
                </div>
              </div>
            </div>

            <div className="card-clinical p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#30D8A8]" />
                Key Insights
              </h3>

              <div className="space-y-3 text-sm">
                {verdict.report.understanding > 0.7 && (
                  <div className="flex items-start gap-2 text-green-400">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Good problem understanding - you take time to analyze before coding</span>
                  </div>
                )}
                {verdict.report.strategy > 0.7 && (
                  <div className="flex items-start gap-2 text-green-400">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Strong strategic approach - clear problem decomposition</span>
                  </div>
                )}
                {verdict.report.recovery < 0.5 && (
                  <div className="flex items-start gap-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Recovery time could be improved - practice error handling</span>
                  </div>
                )}
                {verdict.report.pressureStability < 0.5 && (
                  <div className="flex items-start gap-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Pressure response detected - work on timed practice</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card-clinical p-6 border-[#30D8A8]/30">
              <h3 className="font-display font-semibold mb-3">Upgrade to Pro</h3>
              <p className="text-sm text-white/60 mb-4">
                Get detailed failure replay, unlimited interviews, and personalized training plans.
              </p>
              <button className="btn-primary w-full text-sm">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
