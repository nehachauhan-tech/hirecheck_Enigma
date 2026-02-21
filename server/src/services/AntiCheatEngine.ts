interface CodeEvent {
  code: string;
  timestamp: number;
  type: string;
}

interface SuspicionIndicators {
  pasteRatio: number;
  typingEntropy: number;
  explanationMismatch: number;
  solutionJump: number;
  integrityViolations?: number; // Count of tab switches/blurs
}

export class AntiCheatEngine {
  private sessionEvents: Map<string, CodeEvent[]> = new Map();
  private integrityEvents: Map<string, any[]> = new Map();
  private readonly SUSPICION_THRESHOLD = 0.45;

  logIntegrityEvent(sessionId: string, event: any) {
    if (!this.integrityEvents.has(sessionId)) {
      this.integrityEvents.set(sessionId, []);
    }
    this.integrityEvents.get(sessionId)!.push(event);
  }
  private readonly DEEP_PROBE_THRESHOLD = 0.70;
  private readonly PENALTY_THRESHOLD = 0.90;

  analyze(sessionId: string, code: string): number {
    if (!this.sessionEvents.has(sessionId)) {
      this.sessionEvents.set(sessionId, []);
    }

    const events = this.sessionEvents.get(sessionId)!;
    events.push({
      code,
      timestamp: Date.now(),
      type: 'code_update'
    });

    // Keep only recent events (last 5 minutes)
    const cutoff = Date.now() - 300000;
    const recentEvents = events.filter(e => e.timestamp > cutoff);
    this.sessionEvents.set(sessionId, recentEvents);

    // Calculate suspicion score
    const indicators = this.calculateIndicators(recentEvents);
    const suspicionScore = this.calculateSuspicionScore(indicators);

    return suspicionScore;
  }

  private calculateIndicators(events: CodeEvent[]): SuspicionIndicators {
    return {
      pasteRatio: this.calculatePasteRatio(events),
      typingEntropy: this.calculateTypingEntropy(events),
      explanationMismatch: 0, // Would need explanation data
      solutionJump: this.calculateSolutionJump(events)
    };
  }

  private calculatePasteRatio(events: CodeEvent[]): number {
    if (events.length < 2) return 0;

    let pasteEvents = 0;
    for (let i = 1; i < events.length; i++) {
      const prevLen = events[i - 1].code.length;
      const currLen = events[i].code.length;
      const diff = currLen - prevLen;

      // Large additions in short time suggest paste
      if (diff > 50) {
        const timeDiff = events[i].timestamp - events[i - 1].timestamp;
        if (timeDiff < 100) { // Less than 100ms for 50+ chars
          pasteEvents++;
        }
      }
    }

    return pasteEvents / (events.length - 1);
  }

  private calculateTypingEntropy(events: CodeEvent[]): number {
    if (events.length < 3) return 1;

    // Calculate time gaps between events
    const gaps: number[] = [];
    for (let i = 1; i < events.length; i++) {
      gaps.push(events[i].timestamp - events[i - 1].timestamp);
    }

    // Low entropy = consistent timing (possibly automated)
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((sum, g) => sum + Math.pow(g - avg, 2), 0) / gaps.length;

    // Normalize: high variance = high entropy = human-like
    return Math.min(variance / 10000, 1);
  }

  private calculateSolutionJump(events: CodeEvent[]): number {
    if (events.length < 3) return 0;

    // Look for sudden large changes that suggest jumping to solution
    let jumps = 0;
    for (let i = 2; i < events.length; i++) {
      const prev = events[i - 1].code.length;
      const curr = events[i].code.length;
      const prevPrev = events[i - 2].code.length;

      // Sudden large addition after small changes
      if (curr > prev * 2 && prev < prevPrev * 1.1) {
        jumps++;
      }
    }

    return jumps / (events.length - 2);
  }

  private calculateSuspicionScore(indicators: SuspicionIndicators): number {
    const weights = {
      pasteRatio: 0.35,
      typingEntropy: 0.25,
      explanationMismatch: 0.20,
      solutionJump: 0.10,
      integrityViolations: 0.30 // High weight for tab switching
    };

    // Calculate integrity score (1 = good, 0 = bad)
    // 1 tab switch is ok, >3 is suspicious
    const integrityViolations = indicators.integrityViolations || 0;
    const integrityScore = Math.min(integrityViolations * 0.2, 1);

    // Invert entropy (low entropy = high suspicion)
    const normalizedEntropy = 1 - indicators.typingEntropy;

    return (
      indicators.pasteRatio * weights.pasteRatio +
      normalizedEntropy * weights.typingEntropy +
      indicators.explanationMismatch * weights.explanationMismatch +
      indicators.solutionJump * weights.solutionJump +
      integrityScore * weights.integrityViolations
    );
  }

  getAction(suspicionScore: number): {
    action: 'none' | 'probe' | 'deep_probe' | 'penalty';
    message?: string;
  } {
    if (suspicionScore > this.PENALTY_THRESHOLD) {
      return {
        action: 'penalty',
        message: 'optimization_credit_removed'
      };
    }

    if (suspicionScore > this.DEEP_PROBE_THRESHOLD) {
      return {
        action: 'deep_probe',
        message: 'Can you explain the logic behind this specific section in detail?'
      };
    }

    if (suspicionScore > this.SUSPICION_THRESHOLD) {
      return {
        action: 'probe',
        message: 'Walk me through how you arrived at this approach.'
      };
    }

    return { action: 'none' };
  }

  recordExplanation(sessionId: string, explanation: string, code: string): void {
    // Store explanation for mismatch detection
    // This would be used in future analysis
  }

  clearSession(sessionId: string): void {
    this.sessionEvents.delete(sessionId);
  }

  // Get detailed report for debugging/auditing
  getSessionReport(sessionId: string): {
    events: number;
    suspicionScore: number;
    indicators: SuspicionIndicators | null;
  } {
    const events = this.sessionEvents.get(sessionId) || [];
    const indicators = events.length > 0 ? this.calculateIndicators(events) : null;

    return {
      events: events.length,
      suspicionScore: indicators ? this.calculateSuspicionScore(indicators) : 0,
      indicators
    };
  }
}
