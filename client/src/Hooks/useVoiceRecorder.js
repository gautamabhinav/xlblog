import { useCallback, useMemo, useRef, useState } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useVoiceRecorder({ language = "en-US" } = {}) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [waveform, setWaveform] = useState([]);
  const [error, setError] = useState("");

  const speechSupported = Boolean(SpeechRecognition);
  const mediaSupported = Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

  const startSpeech = useCallback(() => {
    if (!speechSupported) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ");
      setTranscript(text.trim());
    };
    recognition.onerror = () => setError("Speech recognition could not complete.");
    recognitionRef.current = recognition;
    recognition.start();
  }, [language, speechSupported]);

  const startRecording = useCallback(async () => {
    setError("");
    if (!mediaSupported) {
      setError("Voice recording is not supported in this browser.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
      setWaveform((points) => [...points.slice(-36), Math.random() * 82 + 18]);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current = recorder;
    recorder.start(350);
    startSpeech();
    setIsRecording(true);
  }, [mediaSupported, startSpeech]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop?.();
    setIsRecording(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setAudioBlob(null);
    setWaveform([]);
    setError("");
  }, []);

  return useMemo(
    () => ({
      isRecording,
      transcript,
      audioBlob,
      waveform,
      error,
      speechSupported,
      mediaSupported,
      startRecording,
      stopRecording,
      reset,
    }),
    [audioBlob, error, isRecording, mediaSupported, reset, speechSupported, startRecording, stopRecording, transcript, waveform]
  );
}
