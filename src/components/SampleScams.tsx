import { Lightbulb } from "lucide-react";

interface SampleScamsProps {
  onSelect: (text: string) => void;
}

const SAMPLES = [
  {
    title: "Bank Alert",
    text: "URGENT: Your bank account has been suspended due to suspicious activity. Click here to verify your identity and reactivate: http://bank-secure-verify.com/login. Failure to do so in 2 hours will lead to permanent closure."
  },
  {
    title: "Job Offer",
    text: "Congratulations! You have been selected for a remote part-time job earning $500 daily. No experience needed. Contact our HR manager on WhatsApp: +2348012345678 to start immediately."
  }
];

export default function SampleScams({ onSelect }: SampleScamsProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <Lightbulb className="w-4 h-4" />
        <span>Don't have a message? Try a sample:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample, i) => (
          <button
            key={i}
            onClick={() => onSelect(sample.text)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-red-300 hover:text-red-500 transition-all shadow-sm"
          >
            {sample.title}
          </button>
        ))}
      </div>
    </div>
  );
}
