import Signal from '../models/Signal';

interface EditorEvent {
  type: string;
  code?: string;
  cursorPosition?: { line: number; column: number };
  timestamp: number;
  metadata?: any;
}

export interface BehavioralMetrics {
  thinkingLatency: number;
  rewriteDensity: number;
  approachConsistency: number;
  failureRecoveryTime: number;
  pressureResponseShift: number;
  typingSpeed: number;
  pauseFrequency: number;
  codeChurn: number;
  timeSpoken: number;
  meceDetected: boolean;
  responseLatency: number; // For System 1 vs 2 detection
  recoveryVelocity: number; // For resilience measurement
  signalDensity: number;    // Evidence bits per minute
  pushbackScore: number;    // Reward for requirement questioning
  negotiationDensity: number; // Ratio of trade-off discussion to total dialogue
  pauseMetrics: {
    micro: number; // < 15s
    short: number; // 15-180s
    long: number;  // > 180s
  };
}

interface SessionSignals {
  events: EditorEvent[];
  metrics: BehavioralMetrics;
  latestCode: string;
  lastUpdate: number;
}

export class SignalAnalyzer {
  private sessions: Map<string, SessionSignals> = new Map();
  private readonly STABILITY_WINDOW = 12000; // 12 seconds
  private readonly NOISE_THRESHOLD = 40; // 40ms

  trackEvent(sessionId: string, event: EditorEvent): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        events: [],
        metrics: this.getDefaultMetrics(),
        latestCode: '',
        lastUpdate: Date.now()
      });
    }

    const session = this.sessions.get(sessionId)!;

    // Update latest code if provided
    if (event.type === 'code_update' && event.code !== undefined) {
      session.latestCode = event.code;
    }

    // Filter noise events (< 40ms), but allow init and audio_chunk
    const isCriticalEvent = event.type === 'init' || event.type === 'audio_chunk';
    if (!isCriticalEvent && event.timestamp - session.lastUpdate < this.NOISE_THRESHOLD) {
      return;
    }

    session.events.push(event);
    session.lastUpdate = event.timestamp;

    // Keep only events within stability window
    const cutoff = Date.now() - this.STABILITY_WINDOW;
    session.events = session.events.filter(e => e.timestamp > cutoff);

    // Track audio chunks (Phase 1)
    if (event.type === 'audio_chunk') {
      session.metrics.timeSpoken += 0.3; // Approx 300ms chunks

      // MVP MECE Detection (Rule-based)
      const transcript = (event.metadata?.transcript || "").toLowerCase();
      const meceKeywords = ['price', 'volume', 'demand', 'supply', 'segment', 'categories'];
      const matches = meceKeywords.filter(k => transcript.includes(k));

      if (matches.length >= 2) {
        session.metrics.meceDetected = true;
      }
    }

    // Recalculate metrics
    this.calculateMetrics(sessionId);
  }

  private getDefaultMetrics(): BehavioralMetrics {
    return {
      thinkingLatency: 0,
      rewriteDensity: 0,
      approachConsistency: 1,
      failureRecoveryTime: 0,
      pressureResponseShift: 0,
      typingSpeed: 0,
      pauseFrequency: 0,
      codeChurn: 0,
      timeSpoken: 0,
      meceDetected: false,
      responseLatency: 0,
      recoveryVelocity: 1,
      signalDensity: 0,
      pushbackScore: 0,
      negotiationDensity: 0,
      pauseMetrics: { micro: 0, short: 0, long: 0 }
    };
  }

  private calculateMetrics(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.events.length < 2) return;

    const events = session.events;
    const metrics = session.metrics;

    // Thinking latency: time between reading problem and first code
    const firstCodeEvent = events.find(e => e.type === 'code_update' && e.code && e.code.length > 5);
    if (firstCodeEvent) {
      const startTime = events[0].timestamp;
      metrics.thinkingLatency = Math.min((firstCodeEvent.timestamp - startTime) / 1000, 300) / 300;
    }

    // Rewrite density: ratio of delete/insert events
    const codeEvents = events.filter(e => e.type === 'code_update');
    if (codeEvents.length > 1) {
      let rewrites = 0;
      for (let i = 1; i < codeEvents.length; i++) {
        const prev = codeEvents[i - 1].code?.length || 0;
        const curr = codeEvents[i].code?.length || 0;
        if (curr < prev * 0.7) rewrites++;
      }
      metrics.rewriteDensity = rewrites / codeEvents.length;
    }

    // Approach consistency: measure of steady progress vs jumps
    const codeLengths = codeEvents.map(e => e.code?.length || 0);
    if (codeLengths.length > 2) {
      const diffs = [];
      for (let i = 1; i < codeLengths.length; i++) {
        diffs.push(Math.abs(codeLengths[i] - codeLengths[i - 1]));
      }
      const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const variance = diffs.reduce((sum, d) => sum + Math.pow(d - avgDiff, 2), 0) / diffs.length;
      metrics.approachConsistency = Math.max(0, 1 - variance / 1000);
    }

    // Typing speed: characters per second
    const timeSpan = (events[events.length - 1].timestamp - events[0].timestamp) / 1000;
    if (timeSpan > 0) {
      const totalChars = codeEvents.reduce((sum, e) => sum + (e.code?.length || 0), 0);
      metrics.typingSpeed = Math.min(totalChars / timeSpan / 10, 1);
    }

    // Pause frequency: Classified by duration (Shrestha et al.)
    let micro = 0, short = 0, long = 0;
    for (let i = 1; i < events.length; i++) {
      const gap = events[i].timestamp - events[i - 1].timestamp;
      if (gap > 40 && gap < 15000) micro++;
      else if (gap >= 15000 && gap < 180000) short++;
      else if (gap >= 180000) long++;
    }
    metrics.pauseMetrics = { micro, short, long };
    metrics.pauseFrequency = Math.min((short + long) / events.length, 1);

    // Code churn: frequent large changes
    if (codeEvents.length > 1) {
      let churn = 0;
      for (let i = 1; i < codeEvents.length; i++) {
        const prev = codeEvents[i - 1].code || '';
        const curr = codeEvents[i].code || '';
        const diff = Math.abs(curr.length - prev.length);
        if (diff > 50) churn++;
      }
      metrics.codeChurn = churn / codeEvents.length;
    }

    // BLUEPRINT: Response Latency (System 1 vs 2)
    // Measure time between round start or last probe and first meaningful activity
    const activityEvents = events.filter(e => e.type === 'code_update' || e.type === 'audio_chunk');
    if (activityEvents.length > 0) {
      const firstActivityTime = activityEvents[0].timestamp;
      const startTime = events[0].timestamp;
      metrics.responseLatency = Math.min((firstActivityTime - startTime) / 1000, 60) / 60;
    }

    // BLUEPRINT: Signal Density (Evidence vs Noise)
    const totalEvents = events.length;
    const durationMins = timeSpan / 60;
    if (durationMins > 0) {
      metrics.signalDensity = Math.min(totalEvents / durationMins / 50, 1); // Normalized (50 events/min = 1.0)
    }

    // BLUEPRINT: Pushback Detection (Leadership Signaling)
    const transcript = events
      .filter(e => e.type === 'audio_chunk')
      .map(e => (e.metadata?.transcript || "").toLowerCase())
      .join(" ");

    const pushbackKeywords = ['why', 'tradeoff', 'trade-off', 'constraint', 'unrealistic', 'alternative', 'actually', 'instead', 'however', 'wait', 'negotiate'];
    const transcriptArray = transcript.split(/\s+/);
    const pushbackCount = pushbackKeywords.filter(k => transcript.includes(k)).length;

    metrics.pushbackScore = Math.min(pushbackCount / 5, 1);

    // Negotiation Density: Frequency of trade-off keywords relative to total speech
    if (transcriptArray.length > 5) {
      metrics.negotiationDensity = Math.min(pushbackCount / (transcriptArray.length / 10), 1);
    }

    // Save signals to database
    this.saveSignals(sessionId, metrics);
  }

  private async saveSignals(sessionId: string, metrics: BehavioralMetrics): Promise<void> {
    const signals = Object.entries(metrics).map(([metric, value]) => ({
      sessionId,
      metric,
      value,
      time: new Date()
    }));

    try {
      await Signal.insertMany(signals);
    } catch (error) {
      console.error('Error saving signals:', error);
    }
  }

  getMetrics(sessionId: string): BehavioralMetrics {
    const session = this.sessions.get(sessionId);
    return session?.metrics || this.getDefaultMetrics();
  }

  getLatestCode(sessionId: string): string {
    return this.sessions.get(sessionId)?.latestCode || '';
  }

  getAllSignals(sessionId: string): any[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return Object.entries(session.metrics).map(([metric, value]) => ({
      metric,
      value,
      timestamp: session.lastUpdate
    }));
  }

  detectLoop(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const events = session.events.filter(e => e.type === 'code_update');
    if (events.length < 10) return false;

    // Check for repeating patterns in recent events
    const recent = events.slice(-10);
    const codeHashes = recent.map(e => this.hashCode(e.code || ''));

    // Simple loop detection: same code appearing multiple times
    const uniqueCodes = new Set(codeHashes);
    return uniqueCodes.size < codeHashes.length * 0.7;
  }

  detectPanic(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const metrics = session.metrics;

    // Panic indicators
    return (
      metrics.rewriteDensity > 0.5 ||
      metrics.codeChurn > 0.4 ||
      metrics.pauseFrequency > 0.3
    );
  }

  detectSilence(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const lastEvent = session.events[session.events.length - 1];
    if (!lastEvent) return true;

    const silenceDuration = Date.now() - lastEvent.timestamp;
    return silenceDuration > 10000; // 10 seconds of silence
  }

  detectConfidence(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const metrics = session.metrics;

    // High confidence indicators
    return (
      metrics.approachConsistency > 0.7 &&
      metrics.thinkingLatency > 0.3 &&
      metrics.rewriteDensity < 0.2 &&
      metrics.typingSpeed > 0.3
    );
  }

  getEmotionalContext(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) return 'Neutral/Focused';

    if (this.detectPanic(sessionId)) {
      if (session.metrics.codeChurn > 0.6) return 'Highly Frustrated/Struggling';
      return 'Anxious/Pressured';
    }

    if (this.detectConfidence(sessionId)) {
      if (session.metrics.typingSpeed > 0.6) return 'Flow State/Extremely Confident';
      return 'Confident/Steady';
    }

    if (this.detectSilence(sessionId)) return 'Deep Thinking/Stuck';

    if (session.metrics.rewriteDensity > 0.3) return 'Hesitant/Second-guessing';

    return 'Calm/Focused';
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  getLiveHUDData(sessionId: string): { stress: number; dnaMatch: number; emotionalState: string } {
    const session = this.sessions.get(sessionId);
    if (!session) return { stress: 0, dnaMatch: 50, emotionalState: 'Calm/Focused' };

    const metrics = session.metrics;

    // Stress calculation (0-100)
    // High rewrite density, high code churn, and panic detection increase stress
    let stress = (metrics.rewriteDensity * 40) + (metrics.codeChurn * 40) + (metrics.pauseFrequency * 20);
    if (this.detectPanic(sessionId)) stress += 20;
    stress = Math.min(Math.max(stress, 0), 100);

    // DNA Match calculation (0-100)
    // High approach consistency and confidence increase match
    let dnaMatch = (metrics.approachConsistency * 60) + (metrics.typingSpeed * 20) + (metrics.thinkingLatency * 20);
    if (this.detectConfidence(sessionId)) dnaMatch += 10;
    dnaMatch = Math.min(Math.max(dnaMatch, 0), 100);

    return {
      stress: Math.round(stress),
      dnaMatch: Math.round(dnaMatch),
      emotionalState: this.getEmotionalContext(sessionId)
    };
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
