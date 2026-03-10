# Alfred

Voice interface for the Batcave command center. Three surfaces, one backend.

## Architecture

```
Voice In (STT)
  |
  v
Edge Function (api/voice.ts)
  ├── Session Memory (short-term, 10 turns, 30min TTL)
  ├── Tag Detection → GitHub Context Fetch (CLAUDE.md + STATE.md)
  ├── Destructive Op Detection → Confirmation Flow
  └── Claude API (Batcave system prompt)
  |
  v
TTS Provider (configurable)
  ├── ElevenLabs (default, premium)
  ├── OpenAI TTS (standard)
  └── Web Speech API (free, client-side)
  |
  v
Voice Out
```

## Surfaces

| Surface | STT | TTS | Status |
|---------|-----|-----|--------|
| Batcave Console | Web Speech API | All 3 tiers | Scaffold complete |
| Apple Shortcuts | Siri dictation | ElevenLabs or Siri | Setup guide ready |
| Mobile (future) | Native | ElevenLabs | Planned |

## Files

```
alfred/
  api/voice.ts              Edge function — the brain
  lib/memory.ts             Session memory
  lib/tts.ts                TTS provider abstraction + fallback
  lib/github-context.ts     Repo context fetcher
  config/providers.ts       All provider configs + defaults
  components/AlfredConsole.jsx  Console UI module
  docs/shortcuts-setup.md   Apple Shortcuts wiring guide
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `GH_TOKEN` | Yes | GitHub PAT for repo context |
| `ELEVENLABS_API_KEY` | If using ElevenLabs | ElevenLabs API key |
| `ELEVENLABS_VOICE_ID` | If using ElevenLabs | Voice ID (cloned or preset) |
| `OPENAI_API_KEY` | If using OpenAI TTS | OpenAI API key |

Keys can also be passed per-request in the POST body (useful for Shortcuts).

## Voice Commands

| Command | Action |
|---------|--------|
| "What's cooking?" | Cross-project status scan |
| "[project] status" | Fetch STATE.md, summarize |
| "Deploy [project]" | Confirmation → deploy trigger |
| "Merge [project] dev to main" | Confirmation → API merge |
| "New poc: [name]" | Scaffold new package |

Destructive operations (merge, deploy, push, delete, archive) always require voice confirmation before execution.
