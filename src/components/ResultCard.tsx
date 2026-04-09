import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, ArrowRight } from "lucide-react";
import { ScamAnalysisResult } from "../types";
import { cn } from "../lib/utils";

interface ResultCardProps {
  result: ScamAnalysisResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const isScam = result.verdict === "SCAM";
  const isSuspicious = result.verdict === "SUSPICIOUS";
  const isSafe = result.verdict === "NOT SCAM";

  const getVerdictStyles = () => {
    if (isScam) return "bg-red-50 text-red-700 border-red-200";
    if (isSuspicious) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-green-50 text-green-700 border-green-200";
  };

  const getIcon = () => {
    if (isScam) return <ShieldAlert className="w-8 h-8" />;
    if (isSuspicious) return <AlertTriangle className="w-8 h-8" />;
    return <CheckCircle2 className="w-8 h-8" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
    >
      <div className={cn("p-6 border-b flex items-center justify-between", getVerdictStyles())}>
        <div className="flex items-center gap-4">
          {getIcon()}
          <div>
            <h3 className="text-2xl font-bold tracking-tight">{result.verdict}</h3>
            <p className="text-sm opacity-80">{result.scamType}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black">{result.confidence}%</div>
          <div className="text-xs uppercase tracking-widest opacity-70 font-bold">Confidence</div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <section>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" /> Analysis
          </h4>
          <p className="text-gray-700 leading-relaxed text-lg">
            {result.explanation}
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4">Red Flags</h4>
            <ul className="space-y-3">
              {result.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-green-500 uppercase tracking-widest mb-4">Safety Advice</h4>
            <ul className="space-y-3">
              {result.safetyAdvice.map((advice, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                  <ArrowRight className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {advice}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
