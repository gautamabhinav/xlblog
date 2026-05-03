import { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, FileText, Image as ImageIcon, UploadCloud, X } from "lucide-react";

import api from "../Helper/axiosInstance";

const ACCEPT_BY_TYPE = {
  image: "image/*",
  pdf: "application/pdf",
  excel:
    "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  any: "*/*",
};

const LABEL_BY_TYPE = {
  image: "image",
  pdf: "PDF",
  excel: "Excel file",
  any: "file",
};

const iconByType = {
  image: ImageIcon,
  pdf: FileText,
  excel: FileSpreadsheet,
  any: UploadCloud,
};

export default function FileUpload({
  type = "any",
  fieldName = "file",
  endpoint,
  onUpload,
  onFileSelect,
  disabled = false,
  className = "",
}) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const normalizedType = ACCEPT_BY_TYPE[type] ? type : "any";
  const accept = ACCEPT_BY_TYPE[normalizedType];
  const Icon = iconByType[normalizedType];

  const helperText = useMemo(
    () => `Upload ${LABEL_BY_TYPE[normalizedType]}`,
    [normalizedType]
  );

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setProgress(0);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const setSelectedFile = (nextFile) => {
    setError("");
    setProgress(0);

    if (!nextFile) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(nextFile.type.startsWith("image/") ? URL.createObjectURL(nextFile) : "");
    onFileSelect?.(nextFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Choose a file first");
      return;
    }

    const formData = new FormData();
    formData.append(fieldName, file);

    if (!endpoint) {
      onUpload?.({ file, formData });
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      const response = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.round((event.loaded * 100) / event.total));
        },
      });
      onUpload?.(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className={`w-full rounded-lg border border-dashed p-4 ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"} ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled || isUploading}
        className="hidden"
        onChange={(event) => setSelectedFile(event.target.files?.[0])}
      />

      <button
        type="button"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-md bg-gray-50 px-4 py-6 text-center transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {previewUrl ? (
          <img src={previewUrl} alt={file?.name || "Selected file"} className="max-h-40 rounded-md object-contain" />
        ) : (
          <Icon className="h-9 w-9 text-indigo-600" aria-hidden="true" />
        )}
        <span className="text-sm font-medium text-gray-800">{file?.name || helperText}</span>
        <span className="text-xs text-gray-500">Click to browse or drag and drop</span>
      </button>

      {file && (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-700">
          <span className="truncate">{file.name}</span>
          <button type="button" onClick={clearFile} className="rounded p-1 hover:bg-gray-100" aria-label="Remove selected file">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {progress > 0 && (
        <div className="mt-3 h-2 overflow-hidden rounded bg-gray-200">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={!file || disabled || isUploading}
        onClick={handleUpload}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UploadCloud className="h-4 w-4" />
        {isUploading ? "Uploading" : "Upload"}
      </button>
    </div>
  );
}

