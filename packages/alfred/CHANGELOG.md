# Changelog — @batcave/alfred

## 0.1.0 (2026-03-09)

### feat: initial Alfred voice interface scaffold

- Edge function (`api/voice.ts`) — Claude API wrapper with Batcave system prompt, GitHub context injection, session memory
- TTS provider abstraction with 3-tier fallback: ElevenLabs (default) > OpenAI TTS > Web Speech API
- Short-term session memory (configurable turn window + TTL)
- GitHub context fetcher — auto-pulls CLAUDE.md/STATE.md on tagged commands
- Destructive operation detection with confirmation flow
- Console module (`components/AlfredConsole.jsx`) — push-to-talk UI with waveform visualizer, transcript, settings panel
- Apple Shortcuts integration guide (`docs/shortcuts-setup.md`)
- Provider config with all 3 TTS tiers switchable at runtime
