import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import Header from "./components/Header";
import UploadBox from "./components/UploadBox";
import TextInput from "./components/TextInput";
import ResultCard from "./components/ResultCard";
import SampleScams from "./components/SampleScams";
import { analyzeScam } from "./lib/gemini";
import { ScamAnalysisResult } from "./types";

export default function App() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleAnalyze = async () => {
    if (!text && !file) {
      setError("Please provide a message or a screenshot to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let imageBuffer = "";
      let mimeType = "";

      if (file) {
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

      const analysis = await analyzeScam(text, imageBuffer, mimeType);
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
            <div className="grid md:grid-cols-2 gap-10">
              <UploadBox onFileSelect={setFile} selectedFile={file} />
              <div className="flex flex-col h-full">
                <TextInput value={text} onChange={setText} />
                <SampleScams onSelect={setText} />
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              <button
                onClick={handleAnalyze}
                disabled={loading || (!text && !file)}
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
                    Analyze for Scams
                  </>
                )}
              </button>

              {result && (
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
            {result && <ResultCard result={result} />}
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
