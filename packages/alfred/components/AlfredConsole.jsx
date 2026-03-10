import { useState, useRef, useCallback, useEffect } from "react";

// ============================================================
// Alfred Console Module
// Voice interface for the Batcave command center
// Push-to-talk, visual transcript, TTS provider config
// ============================================================

const PALETTE = {
  navy: "#0a1628",
  white: "#ffffff",
  black: "#000000",
  cream: "#f5f0e8",
  greenActive: "#2d5a3d",
  redRecording: "#8b2020",
  dimText: "#6b7280",
  border: "#d1cdc4",
};

const TTS_PROVIDERS = [
  { id: "elevenlabs", label: "ElevenLabs", tier: "Premium" },
  { id: "openai", label: "OpenAI TTS", tier: "Standard" },
  { id: "webspeech", label: "Web Speech", tier: "Free" },
];

// Waveform visualizer for recording state
function Waveform({ isActive, analyser }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isActive || !analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = PALETTE.navy;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = PALETTE.cream;
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={48}
      style={{
        borderRadius: 4,
        opacity: isActive ? 1 : 0.2,
        transition: "opacity 0.3s ease",
      }}
    />
  );
}

// Single transcript entry
function TranscriptEntry({ entry }) {
  const isUser = entry.role === "user";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: PALETTE.dimText,
          marginBottom: 2,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {isUser ? "You" : "Alfred"}
      </span>
      <div
        style={{
          background: isUser ? PALETTE.navy : PALETTE.cream,
          color: isUser ? PALETTE.cream : PALETTE.navy,
          padding: "8px 14px",
          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          maxWidth: "85%",
          fontFamily: "'Source Sans 3', sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {entry.text}
      </div>
      {entry.confirmationRequired && (
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: PALETTE.redRecording,
            marginTop: 3,
          }}
        >
          Awaiting confirmation
        </span>
      )}
    </div>
  );
}

export default function AlfredConsole() {
  // --- State ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [ttsProvider, setTtsProvider] = useState("elevenlabs");
  const [apiKeys, setApiKeys] = useState({
    claude: "",
    elevenlabs: "",
    elevenlabsVoiceId: "",
    openai: "",
    github: "",
  });
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  // --- Refs ---
  const recognitionRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // --- Web Speech STT Setup ---
  const initRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    return recognition;
  }, []);

  // --- Audio analyser for waveform ---
  const startAudioAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  }, []);

  const stopAudioAnalyser = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // --- Send to Alfred backend ---
  const sendToAlfred = useCallback(
    async (spokenText) => {
      setIsProcessing(true);
      setError(null);

      // Add user entry immediately
      setTranscript((prev) => [
        ...prev,
        { role: "user", text: spokenText, ts: Date.now() },
      ]);

      try {
        // Determine endpoint — local dev or production
        const endpoint =
          window.location.hostname === "localhost"
            ? "/api/voice"
            : "https://batcave-sage.vercel.app/api/voice";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: spokenText,
            sessionId,
            ttsProvider,
            claudeApiKey: apiKeys.claude,
            githubToken: apiKeys.github,
            elevenlabsApiKey: apiKeys.elevenlabs,
            elevenlabsVoiceId: apiKeys.elevenlabsVoiceId,
            openaiApiKey: apiKeys.openai,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Alfred responded ${res.status}: ${errBody}`);
        }

        const data = await res.json();

        // Update session
        if (data.sessionId) setSessionId(data.sessionId);

        // Add Alfred's response to transcript
        setTranscript((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.text,
            ts: Date.now(),
            confirmationRequired: data.confirmationRequired,
            tag: data.tag,
          },
        ]);

        // Play audio response
        if (data.audio && data.audioContentType) {
          playAudioBase64(data.audio, data.audioContentType);
        } else if (data.provider === "webspeech-client") {
          speakWithWebSpeech(data.text);
        }
      } catch (err) {
        console.error("[Alfred]", err);
        setError(err.message);
        setTranscript((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Connection lost. Check the console.",
            ts: Date.now(),
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId, ttsProvider, apiKeys]
  );

  // --- Audio playback ---
  function playAudioBase64(base64, contentType) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: contentType });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch((e) => console.error("Playback failed:", e));
    audio.onended = () => URL.revokeObjectURL(url);
  }

  function speakWithWebSpeech(text) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 0.9;
    utter.rate = 0.95;
    synth.speak(utter);
  }

  // --- Push-to-talk handlers ---
  const startRecording = useCallback(async () => {
    setError(null);
    const recognition = initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    await startAudioAnalyser();

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      sendToAlfred(spoken);
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
      stopAudioAnalyser();
    };

    recognition.onend = () => {
      setIsRecording(false);
      stopAudioAnalyser();
    };

    recognition.start();
    setIsRecording(true);
  }, [initRecognition, startAudioAnalyser, stopAudioAnalyser, sendToAlfred]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    stopAudioAnalyser();
  }, [stopAudioAnalyser]);

  // --- Keyboard shortcut: hold Space to talk ---
  useEffect(() => {
    let held = false;
    const down = (e) => {
      if (e.code === "Space" && !held && !showSettings && document.activeElement === document.body) {
        e.preventDefault();
        held = true;
        startRecording();
      }
    };
    const up = (e) => {
      if (e.code === "Space" && held) {
        e.preventDefault();
        held = false;
        stopRecording();
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [startRecording, stopRecording, showSettings]);

  // --- Render ---
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: PALETTE.cream,
        color: PALETTE.navy,
        fontFamily: "'Source Sans 3', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: `1px solid ${PALETTE.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 22,
              fontWeight: 400,
            }}
          >
            Alfred
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: PALETTE.dimText,
            }}
          >
            voice interface
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {sessionId && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: PALETTE.dimText,
              }}
            >
              session active
            </span>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: "none",
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 4,
              padding: "4px 12px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: PALETTE.navy,
              cursor: "pointer",
            }}
          >
            {showSettings ? "close" : "config"}
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div
          style={{
            padding: "16px 24px",
            borderBottom: `1px solid ${PALETTE.border}`,
            background: PALETTE.white,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: PALETTE.dimText,
                display: "block",
                marginBottom: 8,
              }}
            >
              TTS Provider
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {TTS_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTtsProvider(p.id)}
                  style={{
                    padding: "6px 14px",
                    border: `1px solid ${
                      ttsProvider === p.id ? PALETTE.navy : PALETTE.border
                    }`,
                    borderRadius: 4,
                    background:
                      ttsProvider === p.id ? PALETTE.navy : "transparent",
                    color:
                      ttsProvider === p.id ? PALETTE.cream : PALETTE.navy,
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {p.label}
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 9,
                      marginLeft: 6,
                      opacity: 0.6,
                    }}
                  >
                    {p.tier}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* API Key inputs */}
          {[
            { key: "claude", label: "Anthropic API Key", always: true },
            { key: "github", label: "GitHub PAT", always: true },
            {
              key: "elevenlabs",
              label: "ElevenLabs API Key",
              always: false,
              showWhen: "elevenlabs",
            },
            {
              key: "elevenlabsVoiceId",
              label: "ElevenLabs Voice ID",
              always: false,
              showWhen: "elevenlabs",
            },
            {
              key: "openai",
              label: "OpenAI API Key",
              always: false,
              showWhen: "openai",
            },
          ]
            .filter((f) => f.always || ttsProvider === f.showWhen)
            .map((field) => (
              <div key={field.key} style={{ marginBottom: 10 }}>
                <label
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: PALETTE.dimText,
                    display: "block",
                    marginBottom: 3,
                  }}
                >
                  {field.label}
                </label>
                <input
                  type="password"
                  value={apiKeys[field.key]}
                  onChange={(e) =>
                    setApiKeys((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    border: `1px solid ${PALETTE.border}`,
                    borderRadius: 4,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    background: PALETTE.cream,
                    color: PALETTE.navy,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
        </div>
      )}

      {/* Transcript area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
        }}
      >
        {transcript.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              opacity: 0.4,
            }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 28,
                marginBottom: 8,
              }}
            >
              Alfred is listening
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
              }}
            >
              Hold the mic button or press Space to speak
            </span>
          </div>
        )}
        {transcript.map((entry, i) => (
          <TranscriptEntry key={i} entry={entry} />
        ))}
        <div ref={transcriptEndRef} />
      </div>

      {/* Error bar */}
      {error && (
        <div
          style={{
            padding: "8px 24px",
            background: PALETTE.redRecording,
            color: PALETTE.white,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "20px 24px",
          borderTop: `1px solid ${PALETTE.border}`,
          background: PALETTE.white,
        }}
      >
        <Waveform isActive={isRecording} analyser={analyserRef.current} />
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={() => isRecording && stopRecording()}
          onTouchStart={(e) => {
            e.preventDefault();
            startRecording();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopRecording();
          }}
          disabled={isProcessing}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "none",
            background: isRecording
              ? PALETTE.redRecording
              : isProcessing
              ? PALETTE.dimText
              : PALETTE.navy,
            color: PALETTE.cream,
            cursor: isProcessing ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            boxShadow: isRecording
              ? `0 0 0 4px ${PALETTE.redRecording}33`
              : "none",
            flexShrink: 0,
          }}
        >
          {/* Mic icon SVG */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="17" y="6" width="14" height="24" rx="7" />
            <path d="M10 26c0 7.7 6.3 14 14 14s14-6.3 14-14" />
            <line x1="24" y1="40" x2="24" y2="46" />
            <line x1="17" y1="46" x2="31" y2="46" />
          </svg>
        </button>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: PALETTE.dimText,
            width: 280,
            textAlign: "center",
          }}
        >
          {isRecording
            ? "Listening..."
            : isProcessing
            ? "Processing..."
            : "Hold to speak"}
        </div>
      </div>
    </div>
  );
}
