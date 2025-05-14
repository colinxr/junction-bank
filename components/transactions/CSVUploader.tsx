"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud, AlertCircle, FileText, CheckCircle, X } from "lucide-react";
import { cn } from "@/infrastructure/utils";

export interface CSVUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  isUploading?: boolean;
  accept?: string;
  maxSizeInMB?: number;
  className?: string;
}

export function CSVUploader({
  onFileSelect,
  onFileRemove,
  isUploading = false,
  accept = ".csv",
  maxSizeInMB = 10,
  className,
}: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    if (!file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      return false;
    }

    // Check file size
    if (file.size > maxSizeInBytes) {
      setError(`File is too large. Maximum size is ${maxSizeInMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        onFileSelect(selectedFile);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        onFileSelect(droppedFile);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileRemove) {
      onFileRemove();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
        aria-label="Upload file"
      />

      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging 
              ? "border-primary bg-primary/5" 
              : error 
                ? "border-destructive bg-destructive/5" 
                : "border-border hover:border-primary/50 hover:bg-primary/5",
          )}
          onClick={triggerFileInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className={cn(
              "h-10 w-10",
              error ? "text-destructive" : "text-muted-foreground"
            )} />
            <div className="flex flex-col space-y-1 text-sm">
              <span className="font-medium">
                {error ? "Error uploading file" : "Drop your CSV file here, or click to browse"}
              </span>
              <span className="text-xs text-muted-foreground">
                CSV file should contain transaction data (max {maxSizeInMB}MB)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 border rounded-lg p-4">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-grow">
            <div className="font-medium truncate">{file.name}</div>
            <div className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB • CSV
            </div>
          </div>
          <div className="flex-shrink-0">
            {isUploading ? (
              <div className="animate-pulse">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={isUploading}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 