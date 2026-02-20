import Session, { ISession } from '../models/Session';
import Snapshot from '../models/Snapshot';

interface SessionSnapshot {
  sessionId: string;
  code: string;
  cursor: { line: number; column: number };
  state: string;
  timer: number;
  timestamp: Date;
}

export class SessionManager {
  private activeSessions: Map<string, NodeJS.Timeout> = new Map();
  private readonly HEARTBEAT_TIMEOUT = 600000; // 10 minutes

  async createSession(userId: string, problemId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<ISession> {
    const session = new Session({
      userId,
      problemId,
      difficulty,
      state: 'INIT',
      timer: 0,
      active: true,
      code: '',
      language: 'javascript',
      startedAt: new Date(),
      lastHeartbeat: new Date()
    });

    await session.save();
    this.startHeartbeatMonitor(session._id.toString());

    return session;
  }

  async getSession(sessionId: string): Promise<ISession | null> {
    return Session.findById(sessionId);
  }

  async getActiveSession(userId: string): Promise<ISession | null> {
    return Session.findOne({ userId, active: true }).sort({ startedAt: -1 });
  }

  async reconnectSession(sessionId: string, userId: string): Promise<{ success: boolean; snapshot?: any }> {
    const session = await Session.findById(sessionId);

    if (!session) {
      return { success: false };
    }

    if (session.userId.toString() !== userId) {
      return { success: false };
    }

    // Update heartbeat
    session.lastHeartbeat = new Date();
    await session.save();

    // Get latest snapshot
    const latestSnapshot = await Snapshot.findOne({ sessionId })
      .sort({ timestamp: -1 })
      .limit(1);

    return {
      success: true,
      snapshot: latestSnapshot || {
        code: session.code,
        state: session.state,
        timer: session.timer
      }
    };
  }

  async updateHeartbeat(sessionId: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, {
      lastHeartbeat: new Date()
    });
  }

  async saveSnapshot(sessionId: string, data: {
    code: string;
    cursor: { line: number; column: number };
    signals?: any;
  }): Promise<void> {
    const session = await Session.findById(sessionId);
    if (!session) return;

    const snapshot = new Snapshot({
      sessionId,
      code: data.code,
      cursor: data.cursor,
      signals: data.signals || {},
      state: session.state,
      timestamp: new Date()
    });

    await snapshot.save();

    // Update session code
    await Session.findByIdAndUpdate(sessionId, { code: data.code });
  }

  async restoreSnapshot(sessionId: string): Promise<SessionSnapshot | null> {
    const snapshot = await Snapshot.findOne({ sessionId })
      .sort({ timestamp: -1 })
      .limit(1);

    if (!snapshot) return null;

    const session = await Session.findById(sessionId);
    if (!session) return null;

    return {
      sessionId,
      code: snapshot.code,
      cursor: snapshot.cursor,
      state: snapshot.state,
      timer: session.timer,
      timestamp: snapshot.timestamp
    };
  }

  async pauseSession(sessionId: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, {
      active: false
    });

    // Stop heartbeat monitor
    const monitor = this.activeSessions.get(sessionId);
    if (monitor) {
      clearInterval(monitor);
      this.activeSessions.delete(sessionId);
    }
  }

  async resumeSession(sessionId: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, {
      active: true,
      lastHeartbeat: new Date()
    });

    this.startHeartbeatMonitor(sessionId);
  }

  async endSession(sessionId: string): Promise<void> {
    const session = await Session.findById(sessionId);
    if (!session) return;

    session.active = false;
    session.endedAt = new Date();
    await session.save();

    // Stop heartbeat monitor
    const monitor = this.activeSessions.get(sessionId);
    if (monitor) {
      clearInterval(monitor);
      this.activeSessions.delete(sessionId);
    }
  }

  async getSessionHistory(userId: string, limit: number = 10): Promise<ISession[]> {
    return Session.find({ userId })
      .sort({ startedAt: -1 })
      .limit(limit)
      .select('-code');
  }

  private startHeartbeatMonitor(sessionId: string): void {
    // Clear existing monitor
    const existing = this.activeSessions.get(sessionId);
    if (existing) {
      clearInterval(existing);
    }

    // Start new monitor
    const interval = setInterval(async () => {
      const session = await Session.findById(sessionId);
      if (!session || !session.active) {
        clearInterval(interval);
        this.activeSessions.delete(sessionId);
        return;
      }

      const timeSinceHeartbeat = Date.now() - session.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > this.HEARTBEAT_TIMEOUT) {
        // Session timed out
        console.log(`Session ${sessionId} timed out due to inactivity`);
        await this.endSession(sessionId);
      }
    }, 30000); // Check every 30 seconds

    this.activeSessions.set(sessionId, interval);
  }

  async addChatMessage(sessionId: string, role: 'interviewer' | 'candidate', content: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, {
      $push: {
        chatHistory: {
          role,
          content,
          timestamp: new Date()
        }
      }
    });
  }

  async setSessionMetadata(sessionId: string, key: string, value: any): Promise<void> {
    const update: any = {};
    update[`metadata.${key}`] = value;
    await Session.findByIdAndUpdate(sessionId, { $set: update });
  }

  getLastInterviewerMessageTime(sessionId: string): number {
    // This is a placeholder since we don't have this in memory yet.
    // In a real system, we'd pull from the DB or a local cache.
    // For now we'll return a timestamp that allows the first interruption.
    return 0;
  }

  async cleanup(): Promise<void> {
    // Stop all monitors
    for (const [sessionId, interval] of this.activeSessions) {
      clearInterval(interval);
    }
    this.activeSessions.clear();
  }
}
