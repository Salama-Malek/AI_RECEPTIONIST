import { GatewaySession } from '../types/messages';

export class SessionManager {
  private sessions = new Map<string, GatewaySession>();

  getOrCreateSession(streamSid: string, data?: { callSid?: string; languageHint?: string }) {
    const existing = this.sessions.get(streamSid);
    if (existing) {
      existing.lastActivityAt = Date.now();
      return existing;
    }
    const session: GatewaySession = {
      streamSid,
      callSid: data?.callSid,
      languageHint: data?.languageHint,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    };
    this.sessions.set(streamSid, session);
    return session;
  }

  getSession(streamSid: string) {
    return this.sessions.get(streamSid);
  }

  removeSession(streamSid: string) {
    this.sessions.delete(streamSid);
  }

  listSessions() {
    return Array.from(this.sessions.values());
  }
}
