import { useCallback, useState, MouseEvent } from "react";
import { useDropzone } from "react-dropzone";
import { Music, X } from "lucide-react";
import { cn } from "../lib/utils";

interface AudioUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function AudioUploader({ onFileSelect, selectedFile }: AudioUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, [onFileSelect]);

  const dropzoneOptions: any = {
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm']
    },
    multiple: false
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const clearFile = (e: MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Audio Snippet
      </label>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]",
          isDragActive ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-red-300 hover:bg-gray-50",
          selectedFile ? "border-solid border-red-500 bg-white" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {selectedFile && previewUrl ? (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-red-100 rounded-lg shrink-0">
                  <Music className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {selectedFile.name}
                </span>
              </div>
              <button
                onClick={clearFile}
                className="p-1.5 bg-gray-200 text-gray-600 rounded-full hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <audio controls src={previewUrl} className="w-full h-10" />
          </div>
        ) : (
          <>
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Music className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-red-500">Click to upload audio</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-2">
              MP3, WAV, M4A or WEBM
            </p>
          </>
        )}
      </div>
    </div>
  );
}
