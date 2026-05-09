import { Mic, Pause, RotateCcw, UploadCloud, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { useVoiceRecorder } from "../../Hooks/useVoiceRecorder";
import api from "../../Helper/axiosInstance";
import toast from "react-hot-toast";

const VoiceCommandPanel = ({ context = "voice-note", onTranscript }) => {
  const recorder = useVoiceRecorder();

  const saveRecording = async () => {
    if (!recorder.transcript && !recorder.audioBlob) {
      toast.error("Record something first");
      return;
    }

    await api.post("/voice/recordings", {
      context,
      transcript: recorder.transcript,
      mimeType: recorder.audioBlob?.type || "audio/webm",
      noiseSuppression: true,
    });
    onTranscript?.(recorder.transcript);
    toast.success("Voice note saved");
  };

  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">AI Voice Layer</p>
          <h3 className="text-lg font-semibold text-white">Voice input, notes, and search</h3>
        </div>
        <Wand2 className="h-5 w-5 text-cyan-200" />
      </div>

      <div className="mt-5 flex h-16 items-end gap-1 overflow-hidden rounded-[8px] bg-black/30 p-3">
        {(recorder.waveform.length ? recorder.waveform : Array.from({ length: 28 }, () => 12)).map((height, index) => (
          <motion.span
            key={`${height}-${index}`}
            className="w-full rounded-full bg-cyan-300"
            animate={{ height }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          />
        ))}
      </div>

      <div className="mt-4 min-h-20 rounded-[8px] border border-white/10 bg-black/25 p-3 text-sm text-slate-200">
        {recorder.transcript || "Your transcript will appear here while recording."}
      </div>

      {recorder.error && <p className="mt-2 text-sm text-red-300">{recorder.error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={recorder.isRecording ? recorder.stopRecording : recorder.startRecording}
          className="inline-flex items-center gap-2 rounded-[8px] bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          {recorder.isRecording ? <Pause size={16} /> : <Mic size={16} />}
          {recorder.isRecording ? "Stop" : "Record"}
        </button>
        <button type="button" onClick={saveRecording} className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15">
          <UploadCloud size={16} />
          Save
        </button>
        <button type="button" onClick={recorder.reset} className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15">
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </section>
  );
};

export default VoiceCommandPanel;
