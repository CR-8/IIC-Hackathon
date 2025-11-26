"use client";

import { Card } from "@/components/ui/card";
import { UploadDropzone } from "@/components/custom/UploadDropzone";

interface UploadSectionProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  useGemini: boolean;
  onGeminiToggle: (enabled: boolean) => void;
}

export function UploadSection({
  onFileSelected,
  isUploading,
}: UploadSectionProps) {

  return (
    <div className="max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
 
      <Card className="rounded-2xl p-8 shadow-sm border border-border/50 mb-8">
        <UploadDropzone
          onFileSelected={onFileSelected}
          isUploading={isUploading}
        />
      </Card>
    </div>
  );
}
