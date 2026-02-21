import Verdict from '../models/Verdict';
import { ISession } from '../models/Session';
import Session from '../models/Session';
import TrainingProfile from '../models/TrainingProfile';

interface ScoringWeights {
  understanding: number;
  strategy: number;
  recovery: number;
  adaptability: number;
  communication: number;
  optimization: number;
  pressureStability: number;
}

interface VerdictReport {
  understanding: number;
  strategy: number;
  recovery: number;
  adaptability: number;
  communication: number;
  optimization: number;
  pressureStability: number;
  leadership: number;
}

interface VerdictResult {
  score: number;
  confidence: number;
  confidenceBand: number;
  signalDensity: number;
  pushbackScore: number;
  provenance: Record<string, string>;
  recoveryNarrative: string;
  archetype: string;
  leadershipCredits: string[];
  report: VerdictReport;
  explanation: string;
  recommendations: string[];
}

const WEIGHTS: ScoringWeights = {
  understanding: 0.18,
  strategy: 0.20,
  recovery: 0.14,
  adaptability: 0.12,
  communication: 0.16,
  optimization: 0.08,
  pressureStability: 0.12
};

export class VerdictEngine {
  calculateVerdict(session: ISession, signals: any[]): VerdictResult {
    // Aggregated multi-round verdict
    const roundScores = session.roundHistory.map(r =>
      Object.values(r.scorecard).reduce((a, b) => a + b, 0) / Object.values(r.scorecard).length
    );

    const averageRawScore = roundScores.length > 0
      ? roundScores.reduce((a, b) => a + b, 0) / roundScores.length
      : 0;

    const report: VerdictReport = {
      understanding: this.calculateUnderstanding(this.signalsToMetrics(signals)),
      strategy: this.calculateStrategy(this.signalsToMetrics(signals)),
      recovery: this.calculateRecovery(this.signalsToMetrics(signals)),
      adaptability: this.calculateAdaptability(this.signalsToMetrics(signals)),
      communication: this.calculateCommunication(this.signalsToMetrics(signals)),
      optimization: this.calculateOptimization(this.signalsToMetrics(signals)),
      pressureStability: this.calculatePressureStability(this.signalsToMetrics(signals)),
      leadership: this.calculateLeadership(this.signalsToMetrics(signals))
    };

    // Apply Market-Lens Calibration
    const metadata = session.metadata as any;
    const calibratedWeights = this.getCalibratedWeights(metadata.targetCompanyContext || 'Enterprise');

    let score = averageRawScore * 0.5 + (Object.entries(calibratedWeights).reduce((total, [key, weight]) => {
      return total + report[key as keyof VerdictReport] * weight;
    }, 0)) * 0.5;

    // Hard fail if any round was a hard fail
    const hasHardFail = session.roundHistory.some(r => r.verdict === 'FAIL');
    if (hasHardFail) {
      score = Math.min(score, 0.3);
    }

    const metrics = this.signalsToMetrics(signals);
    const confidence = this.calculateConfidence(signals, report, metrics);
    const signalDensity = metrics.get('signalDensity') || 0;
    const pushbackScore = metrics.get('pushbackScore') || 0;

    // Confidence Band Calculation (±%)
    const confidenceBand = Math.max(0.05, 0.3 * (1 - confidence)); // Range [5%, 30%]

    const archetype = this.determineArchetype(report, score);
    const explanation = this.generateExplanation(report, archetype, session.roundHistory);
    const recommendations = this.generateRecommendations(report);
    const provenance = this.generateProvenanceLabels(report, metrics);
    const recoveryNarrative = this.generateRecoveryNarrative(session.roundHistory, metrics);
    const leadershipCredits = this.generateLeadershipCredits(report, metrics);

    return {
      score: Math.min(Math.max(score, 0), 1),
      confidence: Math.min(Math.max(confidence, 0), 1),
      confidenceBand,
      signalDensity,
      pushbackScore,
      provenance,
      recoveryNarrative,
      archetype,
      leadershipCredits,
      report,
      explanation,
      recommendations
    };
  }

  calculateRoundVerdict(session: ISession, signals: any[]): {
    scorecard: Record<string, number>;
    verdict: 'PASS' | 'FAIL';
    notes: string;
    rejectionSignals: string[];
  } {
    const metrics = this.signalsToMetrics(signals);
    const scorecard: Record<string, number> = {
      technical: this.calculateTechnicalDepth(metrics, session.code),
      communication: this.calculateCommunication(metrics),
      problemSolving: this.calculateStrategy(metrics),
      pressureStability: this.calculatePressureStability(metrics),
      leadership: this.calculateLeadership(metrics)
    };

    const avgScore = Object.values(scorecard).reduce((a, b) => a + b, 0) / Object.values(scorecard).length;

    // Hard fail threshold (Expert Rule 1)
    const failThreshold = 0.45;
    const rejectionSignals: string[] = [];

    if (scorecard.technical < 0.3) rejectionSignals.push('Critical technical deficiency');
    if (scorecard.communication < 0.3) rejectionSignals.push('Inability to articulate thought process');

    // FORENSIC RED FLAGS
    if (session.chatHistory.some(m => m.role === 'candidate' && m.content.toLowerCase().includes('we '))) {
      rejectionSignals.push('Pedigree reliance / Low personal ownership ("We" vs "I")');
    }

    if (scorecard.technical > 0.9 && scorecard.communication < 0.4) {
      rejectionSignals.push('High probability of "Vibe Coding" / AI Proxy usage');
    }

    const verdict = (avgScore < failThreshold || rejectionSignals.length > 0) ? 'FAIL' : 'PASS';

    return {
      scorecard,
      verdict,
      rejectionSignals,
      notes: this.generateInternalNotes(scorecard, rejectionSignals)
    };
  }

  private calculateTechnicalDepth(metrics: Map<string, number>, code: string): number {
    const codeLength = code.trim().length;
    if (codeLength < 50) return 0.2;
    // Logic for complexity, async usage etc would go here
    return Math.min(0.5 + (codeLength / 1000), 1);
  }

  private generateInternalNotes(scorecard: Record<string, number>, signals: string[]): string {
    if (signals.length > 0) {
      return `Candidate flagged for: ${signals.join(', ')}. Performance below the bar.`;
    }
    return `Candidate demonstrates stable ${Object.entries(scorecard).filter(([_, v]) => v > 0.7).map(([k]) => k).join(', ')}. Proceeding with caution.`;
  }

  private signalsToMetrics(signals: any[]): Map<string, number> {
    const map = new Map<string, number>();

    // Aggregate signals by metric (take average)
    const metricGroups: Record<string, number[]> = {};

    for (const signal of signals) {
      if (!metricGroups[signal.metric]) {
        metricGroups[signal.metric] = [];
      }
      metricGroups[signal.metric].push(signal.value);
    }

    for (const [metric, values] of Object.entries(metricGroups)) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      map.set(metric, avg);
    }

    return map;
  }

  private calculateUnderstanding(metrics: Map<string, number>): number {
    const thinkingLatency = metrics.get('thinkingLatency') || 0;
    const pauseFrequency = metrics.get('pauseFrequency') || 0;

    // Good understanding: adequate thinking time, not rushing
    return Math.min((thinkingLatency * 0.7 + (1 - pauseFrequency) * 0.3), 1);
  }

  private calculateStrategy(metrics: Map<string, number>): number {
    const approachConsistency = metrics.get('approachConsistency') || 0;
    const codeChurn = metrics.get('codeChurn') || 0;

    // Good strategy: consistent approach, low churn
    return Math.min((approachConsistency * 0.6 + (1 - codeChurn) * 0.4), 1);
  }

  private calculateRecovery(metrics: Map<string, number>): number {
    const rewriteDensity = metrics.get('rewriteDensity') || 0;
    const approachConsistency = metrics.get('approachConsistency') || 0;

    // Good recovery: controlled rewrites, maintaining consistency
    return Math.min(((1 - rewriteDensity) * 0.5 + approachConsistency * 0.5), 1);
  }

  private calculateAdaptability(metrics: Map<string, number>): number {
    const pressureResponseShift = metrics.get('pressureResponseShift') || 0;
    const typingSpeed = metrics.get('typingSpeed') || 0;

    // Good adaptability: minimal negative shift under pressure, maintained productivity
    return Math.min(((1 - pressureResponseShift) * 0.6 + typingSpeed * 0.4), 1);
  }

  private calculateCommunication(metrics: Map<string, number>): number {
    const thinkingLatency = metrics.get('thinkingLatency') || 0;
    const pauseFrequency = metrics.get('pauseFrequency') || 0;

    // Good communication: structured thinking, appropriate pauses
    return Math.min((thinkingLatency * 0.4 + (1 - Math.abs(pauseFrequency - 0.3)) * 0.6), 1);
  }

  private calculateOptimization(metrics: Map<string, number>): number {
    const typingSpeed = metrics.get('typingSpeed') || 0;
    const approachConsistency = metrics.get('approachConsistency') || 0;

    // Good optimization: efficient coding, consistent progress
    return Math.min((typingSpeed * 0.4 + approachConsistency * 0.6), 1);
  }

  private calculatePressureStability(metrics: Map<string, number>): number {
    const pressureResponseShift = metrics.get('pressureResponseShift') || 0;
    const rewriteDensity = metrics.get('rewriteDensity') || 0;

    // Good pressure stability: minimal behavioral shift under pressure
    return Math.min(((1 - pressureResponseShift) * 0.5 + (1 - rewriteDensity) * 0.5), 1);
  }

  private calculateConfidence(signals: any[], report: VerdictReport, metrics: Map<string, number>): number {
    // Signal density: enough data points
    const densityVal = metrics.get('signalDensity') || (signals.length / 50);
    const signalDensity = Math.min(densityVal, 1);

    // Consistency: low variance across dimensions
    const values = Object.values(report);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const consistency = Math.max(0, 1 - variance);

    // Completion: all dimensions have values
    const completion = values.filter(v => v > 0).length / values.length;

    // Oracle Humility (Expert Rule: Insufficient Signal)
    if (signalDensity < 0.1) {
      return 0; // Confidence 0 = Insufficient Signal
    }

    return signalDensity * consistency * completion;
  }

  private determineArchetype(report: VerdictReport, score: number): string {
    if (score === 0 || score === undefined) return 'System Uncertain (Insufficient Signal)';
    if (score < 0.4) return 'Strong No Hire';
    if (score < 0.6) return 'No Hire';
    if (score < 0.75) return 'Hire (with concerns)';

    const { understanding, strategy, recovery, adaptability, communication, optimization, pressureStability } = report;

    // Define archetypes based on dimension patterns
    if (strategy > 0.8 && understanding > 0.7 && pressureStability > 0.7) {
      return 'Strong Hire (Strategic)';
    }
    return 'Strong Hire';
  }

  private generateExplanation(report: VerdictReport, archetype: string, history: any[]): string {
    const failedRounds = history.filter(h => h.verdict === 'FAIL');
    let explanation = `Internal Evaluation: ${archetype}. `;

    if (failedRounds.length > 0) {
      explanation += `Hiring risk confirmed in rounds: ${failedRounds.map(r => r.roundName).join(', ')}. `;
    }

    const strengths = Object.entries(report).filter(([_, s]) => s > 0.7).map(([k]) => k);
    if (strengths.length > 0) {
      explanation += `Observed strengths in ${strengths.join(', ')}. `;
    }

    return explanation;
  }

  private generateRecommendations(report: VerdictReport): string[] {
    const recommendations = [];

    if (report.understanding < 0.6) {
      recommendations.push('Practice clarifying requirements before coding');
    }
    if (report.strategy < 0.6) {
      recommendations.push('Work on outlining your approach before implementation');
    }
    if (report.recovery < 0.6) {
      recommendations.push('Develop strategies for recovering from implementation errors');
    }
    if (report.adaptability < 0.6) {
      recommendations.push('Practice handling unexpected constraints during problem-solving');
    }
    if (report.communication < 0.6) {
      recommendations.push('Focus on verbalizing your thought process more clearly');
    }
    if (report.optimization < 0.6) {
      recommendations.push('Study common optimization patterns and time/space complexity');
    }
    if (report.pressureStability < 0.6) {
      recommendations.push('Practice coding under time pressure to build confidence');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue practicing to maintain your strong performance');
      recommendations.push('Consider mentoring others to solidify your understanding');
    }

    return recommendations;
  }

  async saveVerdict(sessionId: string, userId: string, verdict: VerdictResult): Promise<void> {
    const newVerdict = new Verdict({
      sessionId,
      userId,
      score: verdict.score,
      confidence: verdict.confidence,
      confidenceBand: verdict.confidenceBand,
      signalDensity: verdict.signalDensity,
      pushbackScore: verdict.pushbackScore,
      provenance: verdict.provenance,
      recoveryNarrative: verdict.recoveryNarrative,
      archetype: verdict.archetype,
      report: verdict.report,
      explanation: verdict.explanation,
      recommendations: verdict.recommendations
    });

    await newVerdict.save();

    // Update Training Profile with History
    try {
      const session = await Session.findById(sessionId);
      if (session) {
        const profile = await TrainingProfile.findOne({ userId });
        const existingDNA = profile?.behavioralDNA || {
          understanding: 50,
          strategy: 50,
          recovery: 50,
          adaptability: 50,
          communication: 50,
          optimization: 50,
          pressure: 50
        };

        // Exponential Moving Average for DNA
        const alpha = 0.3; // Weight for new data
        const updatedDNA = {
          understanding: Math.round(existingDNA.understanding * (1 - alpha) + verdict.report.understanding * 100 * alpha),
          strategy: Math.round(existingDNA.strategy * (1 - alpha) + verdict.report.strategy * 100 * alpha),
          recovery: Math.round(existingDNA.recovery * (1 - alpha) + verdict.report.recovery * 100 * alpha),
          adaptability: Math.round(existingDNA.adaptability * (1 - alpha) + verdict.report.adaptability * 100 * alpha),
          communication: Math.round(existingDNA.communication * (1 - alpha) + verdict.report.communication * 100 * alpha),
          optimization: Math.round(existingDNA.optimization * (1 - alpha) + verdict.report.optimization * 100 * alpha),
          pressure: Math.round(existingDNA.pressure * (1 - alpha) + verdict.report.pressureStability * 100 * alpha)
        };

        // Update Skill Progress based on Problem Category
        const skillCategory = session.metadata.problemCategory || 'General';
        const existingSkillProgress = profile?.skillProgress || {};
        const currentSkillLevel = existingSkillProgress[skillCategory] || 50;
        const updatedSkillLevel = Math.min(100, Math.max(0, Math.round(currentSkillLevel * (1 - alpha) + verdict.score * 100 * alpha)));

        // Calculate XP and Streak awards
        let xpGained = Math.round(verdict.score * 100);
        const mode = session.interviewMode as string;
        if (mode === 'expert-sprint') xpGained *= 2;
        if (mode === 'marathon') xpGained *= 1.5;

        // Daily Streak Logic
        let streakUpdate = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (profile) {
          const lastDate = profile.lastDailyChallengeDate ? new Date(profile.lastDailyChallengeDate) : null;
          if (lastDate) {
            lastDate.setHours(0, 0, 0, 0);
            const diff = (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

            if (diff === 1) {
              // Consecutive day
              streakUpdate = { $inc: { dailyStreak: 1 }, $set: { lastDailyChallengeDate: new Date() } };
            } else if (diff > 1) {
              // Streak broken
              streakUpdate = { $set: { dailyStreak: 1, lastDailyChallengeDate: new Date() } };
            }
          } else {
            // First time or long time ago
            streakUpdate = { $set: { dailyStreak: 1, lastDailyChallengeDate: new Date() } };
          }
        }

        await TrainingProfile.updateOne(
          { userId },
          {
            $set: {
              behavioralDNA: updatedDNA,
              [`skillProgress.${skillCategory}`]: updatedSkillLevel,
              updatedAt: new Date()
            },
            $inc: { xp: xpGained },
            $push: {
              history: {
                sessionId,
                problemId: session.problemId,
                problemCategory: session.metadata.problemCategory,
                score: verdict.score,
                weaknessesIdentified: Object.keys(verdict.report).filter(k => verdict.report[k as keyof VerdictReport] < 0.5),
                date: new Date()
              }
            },
            ...streakUpdate
          },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error('Failed to update training profile:', error);
    }
  }

  async getVerdict(sessionId: string): Promise<any> {
    return Verdict.findOne({ sessionId }).sort({ createdAt: -1 });
  }

  private generateProvenanceLabels(report: VerdictReport, metrics: Map<string, number>): Record<string, string> {
    return {
      'Keystroke Latency': 'deterministic',
      'Pause Pattern': 'deterministic',
      'Stress Level': 'inferred',
      'Archetype Assignment': 'generative',
      'Pushback Signal': (metrics.get('pushbackScore') || 0) > 0.5 ? 'deterministic' : 'inferred'
    };
  }

  private generateRecoveryNarrative(history: any[], metrics: Map<string, number>): string {
    const recoveryVel = metrics.get('recoveryVelocity') || 0;
    if (recoveryVel > 0.7) {
      return "Candidate encountered friction but recovered stability rapidly, demonstrating high technical resilience.";
    }
    return "Candidate maintained a steady performance profile throughout the session.";
  }

  private calculateLeadership(metrics: Map<string, number>): number {
    const pushback = metrics.get('pushbackScore') || 0;
    const negotiation = metrics.get('negotiationDensity') || 0;
    const communication = metrics.get('communication') || 0;
    // Reward pushback/negotiation as the primary signal of senior leadership
    return Math.min(pushback * 0.4 + negotiation * 0.4 + communication * 0.2, 1);
  }

  private generateLeadershipCredits(report: VerdictReport, metrics: Map<string, number>): string[] {
    const credits: string[] = [];
    if (report.leadership > 0.7) {
      if ((metrics.get('pushbackScore') || 0) > 0.6) credits.push('Active Constraint Negotiation');
      if ((metrics.get('negotiationDensity') || 0) > 0.6) credits.push('Trade-off Transparency');
      credits.push('Authority over Agreement');
    }
    return credits;
  }

  private getCalibratedWeights(context: string): Record<string, number> {
    const defaultWeights = { ...WEIGHTS, leadership: 0.1 };

    const lenses: Record<string, Record<string, number>> = {
      'Startup': {
        adaptability: 0.30,
        optimization: 0.25,
        strategy: 0.15,
        understanding: 0.10,
        communication: 0.05,
        recovery: 0.05,
        pressureStability: 0.05,
        leadership: 0.05
      },
      'Enterprise': {
        understanding: 0.30,
        pressureStability: 0.25,
        communication: 0.15,
        leadership: 0.10,
        strategy: 0.10,
        recovery: 0.05,
        adaptability: 0.03,
        optimization: 0.02
      },
      'Scale-up': {
        strategy: 0.30,
        communication: 0.25,
        leadership: 0.15,
        optimization: 0.10,
        adaptability: 0.10,
        understanding: 0.05,
        recovery: 0.03,
        pressureStability: 0.02
      }
    };

    return lenses[context] || defaultWeights;
  }
}

function thinkingLatency(report: VerdictReport): number {
  // Proxy for thinking latency based on other metrics
  return (report.understanding + report.communication) / 2;
}

function averageScore(report: VerdictReport): number {
  const values = Object.values(report);
  return values.reduce((a, b) => a + b, 0) / values.length;
}
