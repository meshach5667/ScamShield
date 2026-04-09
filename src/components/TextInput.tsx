import { MessageSquareText } from "lucide-react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextInput({ value, onChange }: TextInputProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Paste Message Text
      </label>
      <div className="relative">
        <div className="absolute top-3 left-3 text-gray-400">
          <MessageSquareText className="w-5 h-5" />
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the suspicious message here..."
          className="w-full min-h-[120px] pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none text-gray-700 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
