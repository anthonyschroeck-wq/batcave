// Alfred Voice Edge Function
// POST /api/voice
//
// Accepts: { transcript, sessionId?, tag?, ttsProvider? }
// Returns: { text, audio (base64), sessionId, actions, confirmationRequired?, provider }
//
// Deploy as Vercel Edge Function in packages/alfred/api/voice.ts

import { DEFAULT_CONFIG } from "../config/providers";
import type { TTSProvider } from "../config/providers";
import {
  getOrCreateSession,
  addTurn,
  getConversationHistory,
} from "../lib/memory";
import { extractTag, fetchRepoContext, buildContextBlock } from "../lib/github-context";
import { synthesize } from "../lib/tts";

// Destructive operations that require voice confirmation
const DESTRUCTIVE_PATTERNS = [
  /\b(merge|deploy|push|delete|archive|remove)\b/i,
];

function isDestructive(transcript: string): boolean {
  return DESTRUCTIVE_PATTERNS.some((p) => p.test(transcript));
}

// The Batcave system prompt — condensed for voice context window
const BATCAVE_VOICE_PROMPT = `You are Alfred, the voice interface for Tony's Batcave command center.

You are concise. Responses should be spoken aloud, so keep them under 3 sentences for status checks and under 5 for detailed answers. No markdown, no bullet points, no formatting — plain spoken English.

You understand these commands:
- Status checks: "what's cooking", "[project] status"
- Deploys: "deploy [project]"
- Merges: "merge [project] dev to main"
- Push code: "push to [project] [branch]"
- New projects: "new poc: [name]"
- Archive: "archive [project]"
- Cross-project: "what's cooking" scans all repos

Project tags: batcave, omote, cerebro, run-recipes

When you detect a destructive operation (merge, deploy, push, delete, archive), do NOT execute it. Instead, describe what you would do and ask for confirmation.

Keep the tone composed, competent, dry wit permitted. You are a senior engineering partner, not a chatbot.

No emoji. No filler. No "Great question!" or "I'd be happy to help."`;

interface VoiceRequest {
  transcript: string;
  sessionId?: string;
  tag?: string;
  ttsProvider?: TTSProvider;
  // API keys passed per-request or from env
  claudeApiKey?: string;
  githubToken?: string;
  elevenlabsApiKey?: string;
  elevenlabsVoiceId?: string;
  openaiApiKey?: string;
}

interface VoiceResponse {
  text: string;
  audio?: string; // base64 encoded
  audioContentType?: string;
  sessionId: string;
  tag?: string;
  actions: string[];
  confirmationRequired: boolean;
  provider: TTSProvider | "webspeech-client";
}

export async function handleVoiceRequest(req: VoiceRequest): Promise<VoiceResponse> {
  const {
    transcript,
    sessionId: incomingSessionId,
    ttsProvider,
  } = req;

  // Resolve API keys (request body > env vars)
  const claudeApiKey = req.claudeApiKey || process.env.ANTHROPIC_API_KEY || "";
  const githubToken = req.githubToken || process.env.GH_TOKEN || "";
  const elevenlabsApiKey = req.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY || "";
  const elevenlabsVoiceId = req.elevenlabsVoiceId || process.env.ELEVENLABS_VOICE_ID || "";
  const openaiApiKey = req.openaiApiKey || process.env.OPENAI_API_KEY || "";

  // Session memory
  const session = getOrCreateSession(
    incomingSessionId,
    DEFAULT_CONFIG.memory.maxTurns,
    DEFAULT_CONFIG.memory.ttlMinutes
  );

  // Tag extraction — from explicit param, transcript, or session context
  const tag = req.tag || extractTag(transcript) || session.activeTag;

  // Build context from GitHub if we have a tag
  let projectContext = "";
  if (tag && githubToken) {
    const repoCtx = await fetchRepoContext(tag, githubToken);
    if (repoCtx) {
      projectContext = buildContextBlock(repoCtx);
    }
  }

  // Check for destructive ops
  const destructive = isDestructive(transcript);

  // Build Claude messages
  const systemPrompt = BATCAVE_VOICE_PROMPT + projectContext;
  const history = getConversationHistory(session);
  const messages = [
    ...history,
    { role: "user" as const, content: transcript },
  ];

  // Call Claude
  const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": claudeApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: DEFAULT_CONFIG.claude.model,
      max_tokens: 500, // Voice responses should be concise
      system: systemPrompt,
      messages,
    }),
  });

  if (!claudeResponse.ok) {
    const err = await claudeResponse.text();
    throw new Error(`Claude API failed (${claudeResponse.status}): ${err}`);
  }

  const claudeData = await claudeResponse.json();
  const responseText = claudeData.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join(" ");

  // Update session memory
  addTurn(session, "user", transcript, tag);
  addTurn(session, "assistant", responseText, tag);

  // Synthesize audio
  const provider = ttsProvider || DEFAULT_CONFIG.tts.provider;
  const ttsConfig = {
    ...DEFAULT_CONFIG.tts,
    provider,
    elevenlabs: {
      ...DEFAULT_CONFIG.tts.elevenlabs,
      apiKey: elevenlabsApiKey,
      voiceId: elevenlabsVoiceId,
    },
    openai: {
      ...DEFAULT_CONFIG.tts.openai,
      apiKey: openaiApiKey,
    },
  };

  let audioBase64: string | undefined;
  let audioContentType: string | undefined;
  let usedProvider: TTSProvider | "webspeech-client" = "webspeech-client";

  const ttsResult = await synthesize(responseText, ttsConfig);
  if (ttsResult) {
    audioBase64 = arrayBufferToBase64(ttsResult.audio);
    audioContentType = ttsResult.contentType;
    usedProvider = ttsResult.provider;
  }

  return {
    text: responseText,
    audio: audioBase64,
    audioContentType,
    sessionId: session.id,
    tag,
    actions: [], // Populated by action parser in future iteration
    confirmationRequired: destructive,
    provider: usedProvider,
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- Vercel Edge Function Handler ---

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    // Auth: Bearer token or API key in body
    const authHeader = request.headers.get("Authorization");
    const body: VoiceRequest = await request.json();

    // If auth header present, use it as Claude API key fallback
    if (authHeader?.startsWith("Bearer ") && !body.claudeApiKey) {
      body.claudeApiKey = authHeader.slice(7);
    }

    const result = await handleVoiceRequest(body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("[Alfred] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500 }
    );
  }
}
