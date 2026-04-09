import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, RotateCcw, ShieldCheck, MessageSquare, Mic, Headphones, FileText } from "lucide-react";
import Header from "./components/Header";
import UploadBox from "./components/UploadBox";
import TextInput from "./components/TextInput";
import ResultCard from "./components/ResultCard";
import SampleScams from "./components/SampleScams";
import AudioUploader from "./components/AudioUploader";
import AudioRecorder from "./components/AudioRecorder";
import TranscriptEditor from "./components/TranscriptEditor";
import { analyzeScam, transcribeAudio } from "./lib/gemini";
import { ScamAnalysisResult } from "./types";
import { cn } from "./lib/utils";

type Tab = "text-image" | "audio";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("text-image");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load last result from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("scamshield_last_result");
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved result", e);
      }
    }
  }, []);

  // Save result to localStorage
  useEffect(() => {
    if (result) {
      localStorage.setItem("scamshield_last_result", JSON.stringify(result));
    }
  }, [result]);

  const handleTranscribe = async () => {
    if (!audioFile) return;

    setIsTranscribing(true);
    setError(null);
    setTranscript("");

    try {
      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioFile);
      const audioBuffer = await promise;
      
      const text = await transcribeAudio(audioBuffer, audioFile.type);
      setTranscript(text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyze = async () => {
    const isAudio = activeTab === "audio";
    const analysisText = isAudio ? transcript : text;
    
    if (!analysisText && !file && !isAudio) {
      setError("Please provide a message or a screenshot to analyze.");
      return;
    }

    if (isAudio && !transcript) {
      setError("Please transcribe the audio first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let imageBuffer = "";
      let mimeType = "";

      if (file && !isAudio) {
        const reader = new FileReader();
        const promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
        });
        reader.readAsDataURL(file);
        imageBuffer = await promise;
        mimeType = file.type;
      }

      const analysis = await analyzeScam(
        analysisText, 
        imageBuffer, 
        mimeType, 
        isAudio ? "voicenote" : (file ? "screenshot" : "text")
      );
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText("");
    setFile(null);
    setAudioFile(null);
    setTranscript("");
    setResult(null);
    setError(null);
    localStorage.removeItem("scamshield_last_result");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-red-100 selection:text-red-600">
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <Header />

        <main className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-50">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-2xl mb-10 max-w-sm mx-auto">
              <button
                onClick={() => setActiveTab("text-image")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                  activeTab === "text-image" ? "bg-white text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                Text & Image
              </button>
              <button
                onClick={() => setActiveTab("audio")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                  activeTab === "audio" ? "bg-white text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Headphones className="w-4 h-4" />
                Audio
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {activeTab === "text-image" ? (
                <>
                  <UploadBox onFileSelect={setFile} selectedFile={file} />
                  <div className="flex flex-col h-full">
                    <TextInput value={text} onChange={setText} />
                    <SampleScams onSelect={setText} />
                  </div>
                </>
              ) : (
                <>
                  <AudioUploader onFileSelect={setAudioFile} selectedFile={audioFile} />
                  <AudioRecorder onRecordingComplete={setAudioFile} />
                </>
              )}
            </div>

            {activeTab === "audio" && (
              <TranscriptEditor 
                transcript={transcript} 
                onChange={setTranscript} 
                isTranscribing={isTranscribing} 
              />
            )}

            <div className="mt-10 flex flex-col items-center gap-4">
              {activeTab === "audio" && !transcript && (
                <button
                  onClick={handleTranscribe}
                  disabled={isTranscribing || !audioFile}
                  className="w-full md:w-auto px-12 py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-600 hover:shadow-blue-300 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-6 h-6" />
                      Transcribe Audio
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || isTranscribing || (activeTab === "text-image" && !text && !file) || (activeTab === "audio" && !transcript)}
                className="w-full md:w-auto px-12 py-4 bg-red-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-red-200 hover:bg-red-600 hover:shadow-red-300 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    {activeTab === "audio" ? "Analyze Transcript" : "Analyze for Scams"}
                  </>
                )}
              </button>

              {(result || text || file || audioFile || transcript) && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset and Clear
                </button>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {result && (
              <div className="space-y-4">
                {activeTab === "audio" && (
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest">
                    <Mic className="w-3 h-3" />
                    Voice Note Analysis Result
                  </div>
                )}
                <ResultCard result={result} />
              </div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-20 text-center text-gray-400 text-sm">
          <p>© 2026 ScamShield AI. Stay safe online.</p>
          <p className="mt-2 italic">Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
}
