import { useCallback, useState, MouseEvent } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { cn } from "../lib/utils";

interface UploadBoxProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function UploadBox({ onFileSelect, selectedFile }: UploadBoxProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect]);

  const dropzoneOptions: any = {
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const clearFile = (e: MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setPreview(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Screenshot of Message
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
        
        {preview ? (
          <div className="relative w-full max-w-xs">
            <img
              src={preview}
              alt="Preview"
              className="rounded-lg shadow-md max-h-48 w-full object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={clearFile}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-red-500">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-2">
              PNG, JPG or WEBP (max. 5MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
