// Alfred TTS Provider Abstraction
// Unified interface: text in, audio buffer out.
// Provider selection via config. ElevenLabs default.

import type { TTSConfig, TTSProvider } from "../config/providers";

interface TTSResult {
  audio: ArrayBuffer;
  contentType: string;
  provider: TTSProvider;
}

// --- ElevenLabs (Tier 3 — Premium, DEFAULT) ---

async function synthesizeElevenLabs(
  text: string,
  config: TTSConfig
): Promise<TTSResult> {
  const { apiKey, voiceId, modelId, stability, similarityBoost, style, speakerBoost } =
    config.elevenlabs;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: speakerBoost,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${err}`);
  }

  return {
    audio: await response.arrayBuffer(),
    contentType: "audio/mpeg",
    provider: "elevenlabs",
  };
}

// --- OpenAI TTS (Tier 2 — Clean, affordable) ---

async function synthesizeOpenAI(
  text: string,
  config: TTSConfig
): Promise<TTSResult> {
  const { apiKey, model, voice, speed } = config.openai;

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      speed,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI TTS failed (${response.status}): ${err}`);
  }

  return {
    audio: await response.arrayBuffer(),
    contentType: "audio/mpeg",
    provider: "openai",
  };
}

// --- Fallback chain ---
// If the preferred provider fails, fall through to the next tier.
// ElevenLabs -> OpenAI -> WebSpeech (client-side only, returns null here)

export async function synthesize(
  text: string,
  config: TTSConfig
): Promise<TTSResult | null> {
  const chain: TTSProvider[] = buildFallbackChain(config.provider);

  for (const provider of chain) {
    try {
      switch (provider) {
        case "elevenlabs":
          if (!config.elevenlabs.apiKey || !config.elevenlabs.voiceId) continue;
          return await synthesizeElevenLabs(text, config);

        case "openai":
          if (!config.openai.apiKey) continue;
          return await synthesizeOpenAI(text, config);

        case "webspeech":
          // Web Speech API runs client-side only.
          // Return null to signal the client should handle TTS locally.
          return null;
      }
    } catch (err) {
      console.error(`[Alfred TTS] ${provider} failed:`, err);
      continue; // Fall through to next provider
    }
  }

  // All providers exhausted
  return null;
}

function buildFallbackChain(preferred: TTSProvider): TTSProvider[] {
  const all: TTSProvider[] = ["elevenlabs", "openai", "webspeech"];
  const chain = [preferred, ...all.filter((p) => p !== preferred)];
  return chain;
}
