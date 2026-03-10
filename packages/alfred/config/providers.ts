// Alfred TTS Provider Configuration
// Tier 1: Web Speech API (free, built-in)
// Tier 2: OpenAI TTS (clean, affordable)
// Tier 3: ElevenLabs (premium, custom voice — DEFAULT)

export type TTSProvider = "elevenlabs" | "openai" | "webspeech";

export interface TTSConfig {
  provider: TTSProvider;
  elevenlabs: {
    apiKey: string;
    voiceId: string; // Clone or select a butler-style voice
    modelId: string;
    stability: number;
    similarityBoost: number;
    style: number;
    speakerBoost: boolean;
  };
  openai: {
    apiKey: string;
    model: "tts-1" | "tts-1-hd";
    voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
    speed: number;
  };
  webspeech: {
    voiceURI: string; // browser voice identifier
    pitch: number;
    rate: number;
  };
}

export interface AlfredConfig {
  tts: TTSConfig;
  stt: {
    provider: "webspeech" | "whisper";
    whisperApiKey?: string;
    language: string;
  };
  claude: {
    apiKey: string;
    model: string;
  };
  github: {
    token: string;
  };
  memory: {
    maxTurns: number; // short-term conversation window
    ttlMinutes: number; // session expiry
  };
  wakeWord: string;
}

export const DEFAULT_CONFIG: AlfredConfig = {
  tts: {
    provider: "elevenlabs", // ElevenLabs is the default
    elevenlabs: {
      apiKey: "",
      voiceId: "", // Set after voice selection/cloning
      modelId: "eleven_multilingual_v2",
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.3,
      speakerBoost: true,
    },
    openai: {
      apiKey: "",
      model: "tts-1",
      voice: "onyx", // deep, composed — fits Alfred
      speed: 1.0,
    },
    webspeech: {
      voiceURI: "",
      pitch: 0.9,
      rate: 0.95,
    },
  },
  stt: {
    provider: "webspeech",
    language: "en-US",
  },
  claude: {
    apiKey: "",
    model: "claude-sonnet-4-20250514",
  },
  github: {
    token: "",
  },
  memory: {
    maxTurns: 10,
    ttlMinutes: 30,
  },
  wakeWord: "Alfred",
};
