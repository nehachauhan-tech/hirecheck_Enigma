interface BehavioralMetrics {
  thinkingLatency: number;
  rewriteDensity: number;
  approachConsistency: number;
  failureRecoveryTime: number;
  pressureResponseShift: number;
  typingSpeed: number;
  pauseFrequency: number;
  codeChurn: number;
  pauseMetrics?: {
    micro: number;
    short: number;
    long: number;
  };
}

interface PressureAction {
  type: 'constraint' | 'interrupt' | 'explanation_demand' | 'probe' | 'none';
  message?: string;
  data?: any;
}

export class AdaptivePressureEngine {
  private sessionHistory: Map<string, PressureAction[]> = new Map();

  evaluate(metrics: BehavioralMetrics, sessionId: string): PressureAction | null {
    const historicalPressure = this.calculatePressureLevel(sessionId);

    // BLUEPRINT: INTEGRITY OVERLAY (Scripted/Too-Perfect detection)
    if (this.isIntegrityOverlayTrigger(metrics)) {
      return {
        type: 'probe',
        message: 'Level 300 Integrity Overlay: Your solution is unusually polished. I am triggering a 2-minute Depth Drill. Walk me through the exact memory lifecycle of your partition function.',
        data: { level: 300, reason: 'scripted_detection' }
      };
    }

    // YERKES-DODSON ESCALATION GATE
    // If pressure is moderate but metrics show stability, push harder
    // If metrics show distress (panic/long pauses), back off or pivot to SOS
    const isDistressed = metrics.rewriteDensity > 0.6 || (metrics.pauseMetrics?.short || 0) > 2;

    // LEVEL 400: STRESSOR (High confidence + stable arousal)
    if (this.isLevel400Trigger(metrics) && !isDistressed && historicalPressure < 0.7) {
      return {
        type: 'constraint',
        message: 'Level 400 Stressor: Optimal arousal reached. Let\'s tighten the requirements: What if we need to optimize for space complexity and zero memory allocations?',
        data: { level: 400, reason: 'high_confidence_optimal_arousal' }
      };
    }

    // LEVEL SOS: RECOVERY (Distress detected - High Arousal / Low Performance)
    if (this.isLevelSOSTrigger(metrics) || (isDistressed && historicalPressure > 0.5)) {
      return {
        type: 'explanation_demand',
        message: 'Level SOS Recovery: Yerkes-Dodson peak exceeded. Let\'s pause. Walk me through the high-level goal from first principles.',
        data: { level: 'SOS', reason: 'distress_detected' }
      };
    }

    // LEVEL 300: PROBING (Under-arousal or looping detected)
    if (this.isLevel300Trigger(metrics) && historicalPressure < 0.4) {
      return {
        type: 'probe',
        message: 'Level 300 Probe: I notice you are circling. Break down the current tradeoff you are making.',
        data: { level: 300, reason: 'loop_detected' }
      };
    }

    // BLUEPRINT: INTEGRITY OVERLAY (Scripted/Too-Perfect detection)
    if (this.isIntegrityOverlayTrigger(metrics)) {
      return {
        type: 'probe',
        message: 'Level 300 Integrity Overlay: Your solution is unusually polished. I am triggering a 2-minute Depth Drill. Walk me through the exact memory lifecycle of your partition function.',
        data: { level: 300, reason: 'scripted_detection' }
      };
    }

    // LEVEL 200: BASELINE (Silence in early phase)
    if (this.isLevel200Baseline(metrics)) {
      return {
        type: 'probe',
        message: 'Level 200 Baseline: What are you thinking about right now?',
        data: { level: 200, reason: 'silence_detected' }
      };
    }

    return null;
  }

  private isLevel400Trigger(metrics: BehavioralMetrics): boolean {
    return (
      metrics.approachConsistency > 0.8 &&
      metrics.thinkingLatency > 0.3 &&
      metrics.rewriteDensity < 0.15 &&
      metrics.typingSpeed > 0.4
    );
  }

  private isLevel300Trigger(metrics: BehavioralMetrics): boolean {
    return (
      metrics.rewriteDensity > 0.6 &&
      metrics.codeChurn > 0.5 &&
      metrics.approachConsistency < 0.4
    );
  }

  private isLevelSOSTrigger(metrics: BehavioralMetrics): boolean {
    return (
      metrics.rewriteDensity > 0.5 &&
      metrics.codeChurn > 0.4 &&
      metrics.pauseFrequency < 0.1 &&
      metrics.typingSpeed > 0.8
    );
  }

  private isLevel200Baseline(metrics: BehavioralMetrics): boolean {
    return (
      metrics.pauseFrequency > 0.5 &&
      metrics.typingSpeed < 0.2
    );
  }

  private isIntegrityOverlayTrigger(metrics: BehavioralMetrics): boolean {
    // Detection of "Too Perfect": High consistency, low rewrite, high typing speed, low response latency
    return (
      metrics.approachConsistency > 0.9 &&
      metrics.rewriteDensity < 0.05 &&
      metrics.typingSpeed > 0.6 &&
      (metrics as any).responseLatency < 0.1 // System 1 (Scripted) thinking
    );
  }

  recordAction(sessionId: string, action: PressureAction): void {
    if (!this.sessionHistory.has(sessionId)) {
      this.sessionHistory.set(sessionId, []);
    }
    this.sessionHistory.get(sessionId)!.push(action);
  }

  getActionHistory(sessionId: string): PressureAction[] {
    return this.sessionHistory.get(sessionId) || [];
  }

  clearSession(sessionId: string): void {
    this.sessionHistory.delete(sessionId);
  }

  // Generate adaptive constraint based on current solution
  generateConstraint(currentApproach: string, difficulty: 'easy' | 'medium' | 'hard'): string {
    const constraints: Record<string, string[]> = {
      'easy': [
        'What if the input array is sorted?',
        'Can you solve this without using extra space?',
        'What if we need to handle negative numbers?'
      ],
      'medium': [
        'What if we need O(1) space complexity?',
        'Can you solve this in a single pass?',
        'What if the input is too large to fit in memory?',
        'How would you handle concurrent modifications?'
      ],
      'hard': [
        'What if we need to handle 10^9 elements?',
        'Can you design a distributed solution?',
        'What if we have strict memory constraints?',
        'How would you optimize for cache performance?'
      ]
    };

    const options = constraints[difficulty] || constraints.medium;
    return options[Math.floor(Math.random() * options.length)];
  }

  // Calculate pressure level for reporting
  calculatePressureLevel(sessionId: string): number {
    const history = this.getActionHistory(sessionId);
    if (history.length === 0) return 0;

    // More actions = higher pressure
    const actionWeight = Math.min(history.length / 5, 1);

    // Constraint actions add more pressure than probes
    const constraintCount = history.filter(a => a.type === 'constraint').length;
    const interruptCount = history.filter(a => a.type === 'interrupt').length;

    const typeWeight = Math.min((constraintCount * 0.3 + interruptCount * 0.2) / history.length, 1);

    return (actionWeight + typeWeight) / 2;
  }
}
