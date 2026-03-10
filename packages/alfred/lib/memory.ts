// Alfred Session Memory
// Short-term conversational context so you can say
// "now merge that" after asking about a branch.

interface MemoryTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  tag?: string;
  actions?: string[];
}

interface Session {
  id: string;
  turns: MemoryTurn[];
  createdAt: number;
  lastActive: number;
  activeTag?: string;
}

// In-memory store — edge function instances are ephemeral,
// so we use Vercel KV or a simple Map with TTL for persistence.
// For MVP: Map-based with TTL cleanup.
const sessions = new Map<string, Session>();

function generateSessionId(): string {
  return `alfred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getOrCreateSession(
  sessionId?: string,
  maxTurns: number = 10,
  ttlMinutes: number = 30
): Session {
  // Clean expired sessions
  const now = Date.now();
  const ttlMs = ttlMinutes * 60 * 1000;
  for (const [id, session] of sessions) {
    if (now - session.lastActive > ttlMs) {
      sessions.delete(id);
    }
  }

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    session.lastActive = now;
    // Trim to maxTurns (keep most recent)
    if (session.turns.length > maxTurns * 2) {
      session.turns = session.turns.slice(-maxTurns * 2);
    }
    return session;
  }

  const newSession: Session = {
    id: sessionId || generateSessionId(),
    turns: [],
    createdAt: now,
    lastActive: now,
  };
  sessions.set(newSession.id, newSession);
  return newSession;
}

export function addTurn(
  session: Session,
  role: "user" | "assistant",
  content: string,
  tag?: string,
  actions?: string[]
): void {
  session.turns.push({
    role,
    content,
    timestamp: Date.now(),
    tag,
    actions,
  });
  session.lastActive = Date.now();
  if (tag) session.activeTag = tag;
}

export function getConversationHistory(
  session: Session
): Array<{ role: "user" | "assistant"; content: string }> {
  return session.turns.map((t) => ({
    role: t.role,
    content: t.content,
  }));
}

export function getActiveTag(session: Session): string | undefined {
  return session.activeTag;
}

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}
