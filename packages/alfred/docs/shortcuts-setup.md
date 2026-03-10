# Alfred — Apple Shortcuts Integration

## Overview

Say "Hey Siri, Alfred" to trigger the Batcave voice interface from your phone lock screen. No native app required.

## Setup

### 1. Create the Shortcut

1. Open Shortcuts app
2. Create new shortcut named "Alfred"
3. Add these actions in order:

### 2. Shortcut Actions

```
[Dictate Text]
  → Stop Listening: After Pause
  → Language: English

[Get Contents of URL]
  → URL: https://batcave-sage.vercel.app/api/voice
  → Method: POST
  → Headers:
    Content-Type: application/json
  → Request Body (JSON):
    {
      "transcript": [Dictated Text],
      "ttsProvider": "elevenlabs",
      "claudeApiKey": "[YOUR_ANTHROPIC_KEY]",
      "githubToken": "[YOUR_GITHUB_PAT]",
      "elevenlabsApiKey": "[YOUR_ELEVENLABS_KEY]",
      "elevenlabsVoiceId": "[YOUR_VOICE_ID]"
    }

[Get Dictionary Value]
  → Key: text
  → From: [Contents of URL]

[Speak Text]
  → [Dictionary Value]
  → (Or use the audio response from the API if
     you want ElevenLabs quality — see Advanced below)
```

### 3. Siri Trigger

- Shortcut name "Alfred" automatically becomes the Siri trigger
- "Hey Siri, Alfred" → dictation starts → response spoken back

### 4. Storing API Keys Safely

Use Shortcuts' built-in text variables or the Keychain:
- Create a text action at the top with your API key
- Reference it as a variable in the URL body
- Keys stay local to your device

## Advanced: ElevenLabs Audio Playback

To get the premium voice instead of Siri's built-in TTS:

```
[Get Dictionary Value]
  → Key: audio
  → From: [Contents of URL]

[Base64 Decode]
  → [Dictionary Value]

[Play Sound]
  → [Base64 Decoded data]
```

Note: Base64 audio decode in Shortcuts can be finicky.
Fallback to Speak Text if audio playback fails.

## Session Continuity

To maintain conversation memory across commands:

```
[Get Dictionary Value]
  → Key: sessionId
  → From: [Contents of URL]

# Store it
[Set Variable]
  → Name: AlfredSession
  → Value: [Dictionary Value]

# Include in next request body:
  "sessionId": [AlfredSession]
```

Session expires after 30 minutes of inactivity.

## Example Commands

- "Alfred, what's cooking?" — cross-project status
- "Alfred, omote status" — fetch Omote STATE.md
- "Alfred, deploy cerebro" — triggers confirmation flow
- "Alfred, merge omote dev to main" — confirmation required
