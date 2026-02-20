import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Play,
  ChevronRight,
  Code2,
  Brain,
  Activity,
  BarChart3,
  Clock,
  CheckCircle2,
  MessageSquare,
  Zap,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  user: { email: string; plan: string } | null;
  onStartInterview: () => void;
  onLogin: () => void;
  onDashboard: () => void;
  onNavigate?: (view: string) => void;
}

// Animated section wrapper
function AnimatedSection({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Navigation
function Navigation({ user, onStartInterview, onLogin, onDashboard, onNavigate }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#07080A]/90 backdrop-blur-lg border-b border-white/5' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#30D8A8] flex items-center justify-center">
            <Code2 className="w-5 h-5 text-[#07080A]" />
          </div>
          <span className="font-display font-bold text-xl">HireCheck</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button onClick={onDashboard} className="text-white/70 hover:text-white transition-colors">
                Dashboard
              </button>
              <button
                onClick={() => onNavigate?.('compass')}
                className="text-white/70 hover:text-white transition-colors"
              >
                Compass
              </button>
              <button onClick={onStartInterview} className="btn-primary text-sm">
                Start Interview
              </button>
            </>
          ) : (
            <>
              <button onClick={onLogin} className="text-white/70 hover:text-white transition-colors">
                Sign In
              </button>
              <button onClick={onStartInterview} className="btn-primary text-sm">
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection({ onStartInterview }: { onStartInterview: () => void }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#30D8A8]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#30D8A8]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#30D8A8]/10 border border-[#30D8A8]/20 text-[#30D8A8] text-sm mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Interview Simulation</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
        >
          HireCheck predicts whether you will{' '}
          <span className="text-gradient">pass a real interview</span>{' '}
          before you take it.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-white/60 max-w-2xl mx-auto mb-10"
        >
          HireCheck does not teach solutions. It verifies readiness through behavioral analysis,
          measuring how you think when your plan fails.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button onClick={onStartInterview} className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Take the interview you can't fake
          </button>
          <a href="#how-it-works" className="btn-secondary flex items-center gap-2">
            See how it works
            <ChevronRight className="w-5 h-5" />
          </a>
        </motion.div>

        {/* Live preview card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#30D8A8]/20 to-[#30D8A8]/5 rounded-3xl blur-xl" />
            <div className="relative card-clinical p-6 overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center text-sm text-white/40">Interview Room Preview</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-xl p-4 font-mono text-sm">
                  <div className="text-white/40 mb-2">// Interviewer</div>
                  <div className="text-[#30D8A8]">Can you walk me through your approach?</div>
                  <div className="text-white/60 mt-2">I'm thinking of using a hash map...</div>
                </div>
                <div className="bg-black/30 rounded-xl p-4 font-mono text-sm">
                  <div className="text-white/40 mb-2">// Code Editor</div>
                  <div className="text-purple-400">function</div>
                  <div className="text-blue-400"> twoSum</div>
                  <div className="text-white">(nums, target) {'{'}</div>
                  <div className="text-white/60 pl-4">const map = new Map();</div>
                </div>
              </div>

              {/* Animated metrics */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Activity className="w-4 h-4 text-[#30D8A8]" />
                  <span>Analyzing behavior...</span>
                </div>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#30D8A8]"
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      icon: Code2,
      title: 'Real Coding Environment',
      description: 'Solve problems in a full-featured IDE with syntax highlighting, autocompletion, and real execution.'
    },
    {
      icon: Brain,
      title: 'AI Interviewer',
      description: 'Experience adaptive questioning that responds to your approach, not just your solution.'
    },
    {
      icon: BarChart3,
      title: 'Behavioral Analysis',
      description: 'Get insights on thinking patterns, recovery from failures, and pressure response.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold mb-4">How HireCheck Works</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            A three-step pipeline that simulates real interview pressure and measures what actually matters.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <AnimatedSection key={step.title} style={{ transitionDelay: `${index * 0.1}s` }}>
              <div className="card-clinical card-clinical-hover p-8 h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#30D8A8]/10 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-[#30D8A8]" />
                </div>
                <div className="text-[#30D8A8] text-sm font-medium mb-2">Step {index + 1}</div>
                <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-white/60">{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// AI Questioning Section
function AIQuestioningSection() {
  const messages = [
    { role: 'interviewer', content: 'Walk me through your approach to this problem.' },
    { role: 'candidate', content: 'I\'m thinking of using a hash map to store complements...' },
    { role: 'interviewer', content: 'What\'s the time complexity? Can we optimize further?' },
    { role: 'candidate', content: 'Currently O(n), but we could use two pointers if sorted.' }
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30D8A8]/10 text-[#30D8A8] text-sm mb-6">
              <MessageSquare className="w-4 h-4" />
              Structured Interviewing
            </div>
            <h2 className="font-display text-4xl font-bold mb-6">
              AI That Questions Like a Real Interviewer
            </h2>
            <p className="text-white/60 mb-6">
              Our AI doesn't just evaluate your final answer. It probes your thinking, challenges
              your assumptions, and adapts to your skill level in real-time.
            </p>
            <ul className="space-y-3">
              {[
                'Clarifying questions about requirements',
                'Follow-ups on time/space complexity',
                'Edge case exploration',
                'Optimization challenges'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70">
                  <CheckCircle2 className="w-5 h-5 text-[#30D8A8] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>

          <AnimatedSection>
            <div className="card-clinical p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#30D8A8] animate-pulse" />
                <span className="text-sm text-white/40">Live Interview Transcript</span>
              </div>

              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: msg.role === 'interviewer' ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className={`flex ${msg.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'interviewer'
                        ? 'bg-white/5 text-white'
                        : 'bg-[#30D8A8]/20 text-[#30D8A8]'
                      }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// Code Execution Section
function CodeExecutionSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimatedSection className="order-2 lg:order-1">
            <div className="card-clinical p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-sm text-white/40 ml-2">solution.js</span>
              </div>

              <div className="p-4 font-mono text-sm">
                <div className="text-purple-400">function</div>
                <div className="text-blue-400"> twoSum</div>
                <div className="text-white">(nums, target) {'{'}</div>
                <div className="text-white/60 pl-4">const map = <span className="text-purple-400">new</span> <span className="text-yellow-400">Map</span>();</div>
                <div className="text-purple-400 pl-4">for</div>
                <div className="text-white pl-4">(<span className="text-purple-400">let</span> i = 0; i {'<'} nums.length; i++) {'{'}</div>
                <div className="text-white/60 pl-8">const complement = target - nums[i];</div>
                <div className="text-purple-400 pl-8">if</div>
                <div className="text-white/60 pl-8">(map.has(complement)) {'{'}</div>
                <div className="text-purple-400 pl-12">return</div>
                <div className="text-white/60 pl-12">[map.get(complement), i];</div>
                <div className="text-white/60 pl-8">{'}'}</div>
                <div className="text-white/60 pl-8">map.set(nums[i], i);</div>
                <div className="text-white pl-4">{'}'}</div>
                <div className="text-purple-400 pl-4">return</div>
                <div className="text-white/60 pl-4">[];</div>
                <div className="text-white">{'}'}</div>
              </div>

              <div className="px-4 py-3 bg-[#30D8A8]/10 border-t border-[#30D8A8]/20">
                <div className="flex items-center gap-2 text-[#30D8A8] text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All test cases passed (3/3)</span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30D8A8]/10 text-[#30D8A8] text-sm mb-6">
              <Zap className="w-4 h-4" />
              Real Execution
            </div>
            <h2 className="font-display text-4xl font-bold mb-6">
              Run Your Code in a Real Environment
            </h2>
            <p className="text-white/60 mb-6">
              Don't just guess if your solution works. Execute it against hidden test cases
              and see real output, just like in a real technical interview.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Languages', value: '5+' },
                { label: 'Test Cases', value: 'Multiple' },
                { label: 'Time Limit', value: '4s' },
                { label: 'Memory', value: '256MB' }
              ].map((stat) => (
                <div key={stat.label} className="card-clinical p-4 text-center">
                  <div className="text-2xl font-bold text-[#30D8A8]">{stat.value}</div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// Behavioral Signals Section
function BehavioralSignalsSection() {
  const metrics = [
    { name: 'Thinking Latency', value: 0.75, description: 'Time spent understanding before coding' },
    { name: 'Approach Consistency', value: 0.82, description: 'Steady progress vs erratic changes' },
    { name: 'Recovery Speed', value: 0.68, description: 'How quickly you bounce back from errors' },
    { name: 'Pressure Response', value: 0.71, description: 'Behavior under time constraints' }
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30D8A8]/10 text-[#30D8A8] text-sm mb-6">
            <Brain className="w-4 h-4" />
            Behavioral Analysis
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">
            We Measure How You Think, Not Just What You Code
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Every keystroke, pause, and revision tells a story. Our signal analyzer
            captures behavioral patterns that predict real interview success.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {metrics.map((metric, index) => (
            <AnimatedSection key={metric.name} style={{ transitionDelay: `${index * 0.1}s` }}>
              <div className="card-clinical p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold">{metric.name}</h3>
                  <span className="text-[#30D8A8] font-bold">{Math.round(metric.value * 100)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#30D8A8] to-[#20B894]"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${metric.value * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  />
                </div>
                <p className="text-sm text-white/50">{metric.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// Evaluation Engine Section
function EvaluationEngineSection() {
  const dimensions = [
    { name: 'Understanding', weight: 0.18, score: 0.82 },
    { name: 'Strategy', weight: 0.20, score: 0.76 },
    { name: 'Recovery', weight: 0.14, score: 0.71 },
    { name: 'Adaptability', weight: 0.12, score: 0.68 },
    { name: 'Communication', weight: 0.16, score: 0.79 },
    { name: 'Optimization', weight: 0.08, score: 0.65 },
    { name: 'Pressure Stability', weight: 0.12, score: 0.74 }
  ];

  const totalScore = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30D8A8]/10 text-[#30D8A8] text-sm mb-6">
              <BarChart3 className="w-4 h-4" />
              Deterministic Scoring
            </div>
            <h2 className="font-display text-4xl font-bold mb-6">
              Transparent, Weighted Evaluation
            </h2>
            <p className="text-white/60 mb-6">
              No black boxes. Our scoring model uses seven weighted dimensions with
              clear formulas. You know exactly what you're being measured on.
            </p>
            <div className="card-clinical p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60">Overall Score</span>
                <span className="text-3xl font-bold text-[#30D8A8]">{Math.round(totalScore * 100)}%</span>
              </div>
              <div className="text-sm text-white/40">
                Confidence: 87% • Archetype: Strategic Thinker
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="card-clinical p-6">
              <h3 className="font-display font-semibold mb-6">Scoring Breakdown</h3>
              <div className="space-y-4">
                {dimensions.map((dim, index) => (
                  <div key={dim.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/70">{dim.name}</span>
                      <span className="text-white/40">{Math.round(dim.weight * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#30D8A8]"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${dim.score * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// Failure Replay Section
function FailureReplaySection() {
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30D8A8]/10 text-[#30D8A8] text-sm mb-6">
            <Clock className="w-4 h-4" />
            Failure Replay
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">
            See Exactly Where Your Reasoning Broke Down
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Our timeline replay shows you the exact moment your approach shifted,
            helping you understand your failure patterns.
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="card-clinical p-8">
            <div className="mb-8">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="timeline-slider"
              />
              <div className="flex justify-between text-sm text-white/40 mt-2">
                <span>Start</span>
                <span>Thinking Phase</span>
                <span>Implementation</span>
                <span>Optimization</span>
                <span>Submit</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-white/40 mb-2">Code State</div>
                <div className="font-mono text-sm text-white/60">
                  {sliderValue < 30 ? '// Planning phase...' :
                    sliderValue < 60 ? 'function twoSum(nums, target) {' :
                      sliderValue < 80 ? '  const map = new Map();' :
                        '  return [i, j];'}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-white/40 mb-2">Behavioral Signal</div>
                <div className={`text-sm ${sliderValue > 40 && sliderValue < 60 ? 'text-yellow-400' : 'text-[#30D8A8]'
                  }`}>
                  {sliderValue < 20 ? 'High thinking latency' :
                    sliderValue < 40 ? 'Approach formulation' :
                      sliderValue < 60 ? 'Rewrite spike detected' :
                        sliderValue < 80 ? 'Steady implementation' :
                          'Optimization phase'}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-white/40 mb-2">Interviewer Action</div>
                <div className="text-sm text-white/70">
                  {sliderValue < 30 ? 'Waiting for approach...' :
                    sliderValue < 50 ? 'Probing for complexity analysis' :
                      sliderValue < 70 ? 'Observing implementation' :
                        sliderValue < 85 ? 'Suggesting optimization' :
                          'Final review'}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection({ onStartInterview }: { onStartInterview: () => void }) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Get a taste of the interview experience',
      features: [
        '1 interview per month',
        'Basic verdict score',
        '3 practice problems',
        'Community support'
      ],
      cta: 'Start Free',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'Full analysis for serious candidates',
      features: [
        'Unlimited interviews',
        'Full behavioral report',
        'Failure replay timeline',
        'Progress tracking',
        'Priority support'
      ],
      cta: 'Get Pro',
      highlighted: true
    },
    {
      name: 'Pro+',
      price: '$49',
      period: '/month',
      description: 'For teams and advanced analytics',
      features: [
        'Everything in Pro',
        'Analytics dashboard',
        'Team collaboration',
        'API access',
        'Custom problems'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Start free, upgrade when you're ready for deeper insights.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <AnimatedSection key={plan.name} style={{ transitionDelay: `${index * 0.1}s` }}>
              <div className={`card-clinical p-8 h-full flex flex-col ${plan.highlighted ? 'border-[#30D8A8]/50 glow-mint' : ''
                }`}>
                <div className="mb-6">
                  <h3 className="font-display text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-white/50">{plan.period}</span>
                  </div>
                  <p className="text-white/50 text-sm mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-[#30D8A8] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onStartInterview}
                  className={plan.highlighted ? 'btn-primary w-full' : 'btn-secondary w-full'}
                >
                  {plan.cta}
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: 'How is HireCheck different from LeetCode?',
      answer: 'LeetCode teaches you solutions. HireCheck verifies your readiness by simulating real interview pressure and analyzing your behavioral patterns. We measure how you think when things go wrong, not just whether you can solve the problem.'
    },
    {
      question: 'Is the AI interviewer realistic?',
      answer: 'Yes. Our AI is trained on thousands of real interview transcripts and adapts to your responses. It asks follow-up questions, probes your reasoning, and introduces constraints just like a human interviewer would.'
    },
    {
      question: 'How accurate is the verdict?',
      answer: 'Our scoring model has been validated against real hiring outcomes with 85%+ correlation. The more interviews you complete, the more accurate your profile becomes.'
    },
    {
      question: 'Can I use my own problems?',
      answer: 'Pro+ users can upload custom problems and create private interview sets for their team or study group.'
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-3xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold mb-4">Frequently Asked</h2>
        </AnimatedSection>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AnimatedSection key={index} style={{ transitionDelay: `${index * 0.1}s` }}>
              <div className="card-clinical p-6">
                <h3 className="font-display font-semibold mb-2">{faq.question}</h3>
                <p className="text-white/60 text-sm">{faq.answer}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ onStartInterview }: { onStartInterview: () => void }) {
  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedSection>
          <div className="card-clinical p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#30D8A8]/10 to-transparent" />

            <div className="relative z-10">
              <h2 className="font-display text-4xl font-bold mb-4">
                Ready to Face the Interview You Can't Fake?
              </h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">
                Take your first simulated interview now and discover what real hiring managers
                will see when they evaluate you.
              </p>
              <button onClick={onStartInterview} className="btn-primary text-lg px-8 py-4">
                Start Your Interview
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#30D8A8] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-[#07080A]" />
            </div>
            <span className="font-display font-bold text-xl">HireCheck</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="text-sm text-white/30">
            © 2024 HireCheck. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function LandingPage(props: LandingPageProps) {
  return (
    <div className="noise-overlay">
      <Navigation {...props} />
      <HeroSection onStartInterview={props.onStartInterview} />
      <HowItWorksSection />
      <AIQuestioningSection />
      <CodeExecutionSection />
      <BehavioralSignalsSection />
      <EvaluationEngineSection />
      <FailureReplaySection />
      <PricingSection onStartInterview={props.onStartInterview} />
      <FAQSection />
      <CTASection onStartInterview={props.onStartInterview} />
      <Footer />
    </div>
  );
}
