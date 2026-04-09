import { FileText, Edit3 } from "lucide-react";

interface TranscriptEditorProps {
  transcript: string;
  onChange: (value: string) => void;
  isTranscribing: boolean;
}

export default function TranscriptEditor({ transcript, onChange, isTranscribing }: TranscriptEditorProps) {
  if (!transcript && !isTranscribing) return null;

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
            Voice Transcript
          </h4>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Edit3 className="w-3 h-3" />
          Editable
        </div>
      </div>

      {isTranscribing ? (
        <div className="h-24 flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
          </div>
        </div>
      ) : (
        <textarea
          value={transcript}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[100px] p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-700 leading-relaxed italic"
          placeholder="Transcript will appear here..."
        />
      )}
      
      {!isTranscribing && (
        <p className="mt-3 text-[10px] text-gray-400 text-center italic">
          Review and edit the transcript if needed before final analysis.
        </p>
      )}
    </div>
  );
}
