import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Trophy,
  Code2,
  Compass,
  Microscope,
  LogOut,
  BarChart3,
  Award,
  Zap,
  ChevronRight,
  TrendingUp,
  Clock,
  Target,
  Star
} from 'lucide-react';
import type { User } from '../types';
import { ResumeUploadDialog } from '../components/ResumeUploadDialog';
import SkillRadar from '../components/SkillRadar';

gsap.registerPlugin(ScrollTrigger);

interface DashboardProps {
  user: User | null;
  token: string | null;
  onStartInterview: (problemId: string, difficulty: 'easy' | 'medium' | 'hard', mode?: string) => void;
  onLogout: () => void;
  onBack: () => void;
  onDiagnose: () => void;
  onNavigate: (view: string) => void;
}

export default function Dashboard({ user, token, onStartInterview, onLogout, onBack, onDiagnose, onNavigate }: DashboardProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const challengeRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  // State for real data
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    marathons: 0,
    sprints: 0,
    xp: 0,
    dailyStreak: 0,
    strengths: ['React', 'MongoDB', 'Node.js'],
    improving: ['Algorithms', 'System Design']
  });

  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [dna, setDNA] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [dailyChallenge, setDailyChallenge] = useState({
    title: 'Loading Challenge...',
    topics: ['Algorithm'],
    difficulty: 'Medium',
    time: '30 min',
    reward: '100 XP',
    badge: 'Daily Streak',
    id: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const [overviewRes, recentRes, skillsRes, dnaRes] = await Promise.all([
          fetch(`${API_URL}/api/stats/overview`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/stats/recent`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/stats/skills`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/stats/dna`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (overviewRes.ok) setStats(await overviewRes.json());
        if (recentRes.ok) setRecentInterviews(await recentRes.json());
        if (skillsRes.ok) setSkills(await skillsRes.json());
        if (dnaRes.ok) setDNA(await dnaRes.json());
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDaily = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/leetcode/daily`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data && !data.error) {
          setDailyChallenge({
            title: data.title,
            topics: [data.category || 'Algorithms'],
            difficulty: data.difficulty,
            time: '25 min',
            reward: '50 XP',
            badge: 'Daily Solver',
            id: data.id
          });
        }
      } catch (err) {
        console.error('Failed to load daily challenge', err);
      }
    };

    fetchStats();
    fetchDaily();
  }, [token]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Section Animation
      gsap.from(heroRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });

      gsap.from('.hero-button', {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        delay: 0.3,
        ease: 'back.out(1.7)'
      });

      // Stats Animation
      gsap.from(statsRef.current, {
        x: -100,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power2.out'
      });

      // Animate numbers counting up
      const statNumbers = document.querySelectorAll('.stat-number');
      statNumbers.forEach((el) => {
        gsap.from(el, {
          textContent: 0,
          duration: 2,
          delay: 0.5,
          ease: 'power1.out',
          snap: { textContent: 1 },
          onUpdate: function () {
            el.textContent = Math.ceil(gsap.getProperty(el, 'textContent') as number).toString();
          }
        });
      });

      // Recent Interviews Stagger
      gsap.from('.recent-item', {
        x: -50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.4,
        ease: 'power2.out'
      });

      // Daily Challenge Glow
      gsap.from(challengeRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: 'back.out(1.2)'
      });

      // Skills Progress Bars
      gsap.from('.skill-bar', {
        width: 0,
        duration: 1.5,
        delay: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
      });

    });

    return () => ctx.revert();
  }, []);

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? 'fill-[#30D8A8] text-[#30D8A8]' : 'text-white/20'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#30D8A8] flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-[#07080A]" />
                </div>
                <span className="font-display font-bold">HireCheck</span>
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-2 h-2 rounded-full bg-[#30D8A8]" />
                <span>{user?.plan || 'free'} plan</span>
              </div>

              <ResumeUploadDialog token={token || ''} />


              <button
                onClick={onDiagnose}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <Microscope className="w-4 h-4" />
                Diagnose
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Hero Section */}
        <div ref={heroRef} className="text-center py-12">
          <h1 className="font-display text-5xl font-bold mb-4 bg-gradient-to-r from-[#30D8A8] to-[#20B898] bg-clip-text text-transparent">
            Ready to Ace Your Interview? 🚀
          </h1>
          <p className="text-white/60 text-lg mb-8">Choose your challenge and start practicing</p>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => onStartInterview('random', 'easy', 'marathon')}
              className="hero-button group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#30D8A8] to-[#20B898] text-[#07080A] font-bold text-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Start Marathon
              </div>
            </button>

            <button
              onClick={() => onStartInterview('random', 'easy', 'sprint')}
              className="hero-button group relative px-8 py-4 rounded-2xl bg-white/10 border-2 border-[#30D8A8]/50 font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#30D8A8]" />
                Start Sprint
              </div>
            </button>
          </div>
        </div>
        <button
          onClick={() => onNavigate('compass')}
          className="hero-button relative group flex items-center gap-4 px-8 py-5 rounded-2xl bg-[#07080A] border border-blue-500/30 hover:border-blue-500/60 transition-all overflow-hidden"
        >
          {/* Animated Glow Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-emerald-500/5 to-transparent group-hover:opacity-100 transition-opacity opacity-50" />

          <div className="relative w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]">
            <Compass className="w-7 h-7 text-blue-400" />
          </div>

          <div className="relative text-left">
            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-1">Gate: Placement Mode</div>
            <div className="text-xl font-black italic tracking-tighter">COMPANY COMPASS</div>
          </div>

          <div className="relative ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
            <ChevronRight className="w-5 h-5 text-blue-400" />
          </div>
        </button>
        {/* Performance Overview */}
        <div ref={statsRef} className="card-clinical glass p-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#30D8A8]/5 blur-3xl rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />

          <h2 className="font-display text-2xl font-semibold mb-8 flex items-center gap-2 relative z-10">
            <TrendingUp className="w-6 h-6 text-[#30D8A8]" />
            Your Performance Profile
          </h2>

          <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
            {/* Skill Radar */}
            <div className="w-full lg:w-2/5 aspect-square max-w-[350px]">
              <div className="text-center mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Behavioral DNA</span>
              </div>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#30D8A8]/20 border-t-[#30D8A8] rounded-full animate-spin" />
                </div>
              ) : (
                <SkillRadar data={{
                  understanding: (dna?.understanding || 50) / 100,
                  strategy: (dna?.strategy || 50) / 100,
                  recovery: (dna?.recovery || 50) / 100,
                  adaptability: (dna?.adaptability || 50) / 100,
                  communication: (dna?.communication || 50) / 100,
                  optimization: (dna?.optimization || 50) / 100,
                  pressureStability: (dna?.pressure || 50) / 100
                }} />
              )}
            </div>

            {/* Stats Grid */}
            <div className="w-full lg:w-3/5">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center group hover:border-[#30D8A8]/30 transition-colors">
                  <div className="stat-number text-4xl font-black text-[#30D8A8] mb-1" data-target={stats.totalInterviews}>{stats.totalInterviews}</div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Total Interviews</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center group hover:border-[#30D8A8]/30 transition-colors">
                  <div className="stat-number text-4xl font-black text-[#30D8A8] mb-1" data-target={stats.avgScore}>{stats.avgScore}%</div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Average Score</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center group hover:border-[#30D8A8]/30 transition-colors">
                  <div className="stat-number text-4xl font-black text-yellow-400 mb-1" data-target={stats.xp}>{stats.xp}</div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Total XP</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center group hover:border-[#30D8A8]/30 transition-colors">
                  <div className="stat-number text-4xl font-black text-orange-400 mb-1" data-target={stats.dailyStreak}>{stats.dailyStreak}</div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Day Streak</div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('analytics')}
                className="w-full py-4 rounded-2xl bg-[#30D8A8]/5 border border-[#30D8A8]/20 text-[#30D8A8] font-bold hover:bg-[#30D8A8]/10 transition-all flex items-center justify-center gap-2 group"
              >
                Detailed Growth Track
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 relative z-10">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-[#30D8A8] mb-4">💪 Primary Strengths</div>
              <div className="flex flex-wrap gap-2">
                {stats.strengths.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-xl bg-[#30D8A8]/10 text-[#30D8A8] text-xs font-bold border border-[#30D8A8]/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-4">📈 Growth Areas</div>
              <div className="flex flex-wrap gap-2">
                {stats.improving.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-xl bg-yellow-400/10 text-yellow-400 text-xs font-bold border border-yellow-400/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Recent Interviews */}
          <div ref={recentRef} className="card-clinical glass p-6">
            <h2 className="font-display text-2xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#30D8A8]" />
              Recent Interviews
            </h2>

            <div className="space-y-3">
              {recentInterviews.map((interview) => (
                <div
                  key={interview.id}
                  onClick={() => onStartInterview(interview.problemId, interview.difficulty)}
                  className="recent-item bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-white/50">{interview.date}</div>
                    <div className="flex gap-1">{renderStars(interview.stars)}</div>
                  </div>
                  <div className="font-medium mb-2">{interview.type}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-[#30D8A8]">{interview.score}%</div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(`verdict/${interview.id}`);
                        }}
                        className="px-3 py-1 rounded-lg bg-white/10 text-sm hover:bg-white/20 transition-colors"
                      >
                        View Report
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartInterview(interview.problemId, interview.difficulty);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#30D8A8]/20 text-[#30D8A8] text-sm hover:bg-[#30D8A8]/30 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Challenge */}
          <div ref={challengeRef} className="card-clinical glass p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#30D8A8]/10 to-transparent pointer-events-none"></div>

            <h2 className="font-display text-2xl font-semibold mb-6 flex items-center gap-2 relative">
              <Target className="w-6 h-6 text-[#30D8A8]" />
              Today's Challenge
            </h2>

            <div className="relative space-y-4">
              <h3 className="text-xl font-bold">{dailyChallenge.title}</h3>

              <div className="flex flex-wrap gap-2">
                {dailyChallenge.topics.map((topic) => (
                  <span key={topic} className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    {topic}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/50">Difficulty</div>
                  <div className="font-medium text-red-400">{dailyChallenge.difficulty}</div>
                </div>
                <div>
                  <div className="text-white/50">Time</div>
                  <div className="font-medium">{dailyChallenge.time}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-sm text-white/50 mb-1">Reward</div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#30D8A8]" />
                  <span className="font-medium">{dailyChallenge.reward} + "{dailyChallenge.badge}" Badge</span>
                </div>
              </div>

              <button
                onClick={() => dailyChallenge.id && onStartInterview(dailyChallenge.id, 'hard')}
                disabled={!dailyChallenge.id}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#30D8A8] to-[#20B898] text-[#07080A] font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                Accept Challenge
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Skill Progress */}
        <div ref={skillsRef} className="card-clinical glass p-6">
          <h2 className="font-display text-2xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#30D8A8]" />
            Your MERN Skills
          </h2>

          <div className="space-y-6">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{skill.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/50">{skill.level}%</span>
                    <span className={`text-sm ${skill.trend.includes('+') ? 'text-green-400' : skill.trend.includes('-') ? 'text-red-400' : 'text-white/50'}`}>
                      {skill.trend}
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="skill-bar h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${skill.level}%`,
                      background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onStartInterview('two-sum', 'easy')}
            className="mt-6 w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium"
          >
            Practice Weak Areas
          </button>
        </div>

      </div>
    </div>
  );
}
