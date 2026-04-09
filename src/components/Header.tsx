import { ShieldAlert } from "lucide-react";

export default function Header() {
  return (
    <header className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-200">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          ScamShield <span className="text-red-500">AI</span>
        </h1>
      </div>
      <p className="text-lg text-gray-600 max-w-md">
        Detect scams instantly from screenshots or messages using advanced AI.
      </p>
    </header>
  );
}
