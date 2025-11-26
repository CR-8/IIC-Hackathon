"use client";

import { useState } from "react";
import { Sidebar } from "@/components/custom/Sidebar";
import { BentoDashboard } from "@/components/dashboard/BentoDashboard";
import { UploadSection } from "@/components/dashboard/UploadSection";
import { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [useGemini, setUseGemini] = useState(true);

  const handleFileSelected = async (file: File) => {
    setIsAnalyzing(true);
    setShowUpload(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("useGemini", useGemini.toString());

      const response = await fetch("/api/analysis", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalysisData(data.analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze image. Please try again.");
      setShowUpload(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setShowUpload(true);
    setAnalysisData(null);
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
          {showUpload || !analysisData ? (
            <UploadSection
              onFileSelected={handleFileSelected}
              isUploading={isAnalyzing}
              useGemini={useGemini}
              onGeminiToggle={setUseGemini}
            />
          ) : (
            <BentoDashboard data={analysisData} />
          )}
        </main>
      </div>
    </div>
  );
}
