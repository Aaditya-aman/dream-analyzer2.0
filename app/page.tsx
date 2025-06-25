"use client";
import React, { useState, useRef, useEffect } from "react";
import { DM_Serif_Display } from "next/font/google";

const dmSerifDisplay = DM_Serif_Display({ weight: "400", subsets: ["latin"] });

export default function Home() {
  // State for textarea auto-resize
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream: value, emotions: selectedEmotions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data.analysis);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to analyze dream.");
      } else {
        setError("Failed to analyze dream.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleGoHome = () => {
    setValue("");
    setSelectedEmotions([]);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  // Helper to format result (improved)
  function formatResult(text: string) {
    // Remove all asterisks and split by lines
    const cleanText = text.replace(/\*/g, "");
    const lines = cleanText.split(/\n|\r/).filter(Boolean);
    const elements: React.ReactNode[] = [];
    let inBullets = false;
    lines.forEach((line, i) => {
      // Headings like Dream Interpretation: ...
      const headingMatch = line.match(/^(Dream Interpretation:)(.*)$/);
      if (headingMatch) {
        elements.push(
          <div key={i} className="font-bold text-xl mt-4 mb-2">{headingMatch[1]}{headingMatch[2] ? headingMatch[2] : ''}</div>
        );
        inBullets = false;
        return;
      }
      // Section headers (Possible Meanings, Advice)
      if (/^(Possible Meanings|Advice):/i.test(line)) {
        elements.push(
          <div key={i} className="font-semibold mt-3 mb-1">{line}</div>
        );
        inBullets = true;
        return;
      }
      // Bullet points (split by comma or semicolon if in bullets)
      if (inBullets && /[,;] ?/.test(line)) {
        const bullets = line.split(/[,;] ?/).filter(Boolean);
        elements.push(
          <ul key={i} className="list-disc ml-6 mb-2">
            {bullets.map((b, j) => <li key={j}>{b.trim()}</li>)}
          </ul>
        );
        return;
      }
      // Default: normal line
      elements.push(
        <div key={i} className="mb-1">{line}</div>
      );
    });
    return elements;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-2 sm:px-0">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/background.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Optional Overlay for readability */}
      <div className="absolute inset-0 bg-white/60 z-10 pointer-events-none" />

      {/* Logo and App Name */}
      

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 z-20 w-full max-w-4xl mx-auto px-2 sm:px-0">
        <h1 className="text-4xl sm:text-8xl font-medium mb-6 text-center break-words">
          <span className={`${dmSerifDisplay.className} bg-white/80 backdrop-blur text-shadow-gray-700 bg-clip-text text-transparent `}>Dream</span>
          <span className="ml-2">Analyzer</span>
        </h1>
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* <div className="flex items-center gap-4">
            <span className="bg-gray-100 px-4 py-2 rounded-full text-gray-600 text-sm">Early access for Arc Members</span>
            <Button className="bg-black text-white px-6 py-2 rounded-full text-lg font-medium shadow">Download Dia</Button>
          </div> */}
          <span className="text-gray-700 text-base sm:text-lg text-center">Share your dream and emotions to receive an insightful analysis</span>
        </div>
        {/* Centered, Tall Input Box or Result */}
        {result ? (
          <div className="flex flex-col items-center w-full max-w-2xl mt-8 px-0 sm:px-0">
            <div className="relative bg-white/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow text-gray-900 text-base sm:text-lg whitespace-pre-line mb-6 w-full overflow-x-auto">
              <button
                onClick={handleGoHome}
                className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center px-2 sm:px-3 py-1 rounded-full bg-black/80 text-white font-semibold shadow hover:bg-black transition backdrop-blur text-sm sm:text-base"
                aria-label="Go back"
              >
                <span className="mr-2">&#8592;</span> Back
              </button>
              <div className="mt-8 sm:mt-8">{formatResult(result)}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center w-full max-w-2xl mt-8 px-0 sm:px-0">
              <form className="flex flex-col sm:flex-row items-stretch sm:items-end w-full gap-3 bg-white/30 backdrop-blur-md rounded-2xl px-3 sm:px-5 py-4 shadow border border-gray-200" onSubmit={handleAnalyze}>
                {/* Resizable Textarea */}
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="Describe your dream..."
                  className="flex-1 min-h-[64px] max-h-60 resize-none bg-transparent outline-none text-base placeholder-gray-600 text-gray-700 px-2 py-2 rounded-md"
                  rows={2}
                />
                {/* Submit Button */}
                <button
                  type="submit"
                  className="mt-2 sm:mt-0 px-4 py-2 rounded-xl bg-black/80 text-white font-semibold shadow hover:bg-black transition backdrop-blur text-base"
                  disabled={loading || !value || selectedEmotions.length === 0}
                >
                  Analyze
                </button>
              </form>
              {/* Emotion Buttons */}
              <div className="w-full flex flex-col items-start gap-2 mt-4">
                <span className="text-base font-medium text-gray-700 whitespace-nowrap">How did you feel?</span>
                <div className="flex flex-row flex-wrap gap-2 sm:gap-3 overflow-x-auto w-full pb-2">
                  {["Joy", "Fear", "Sadness", "Anxiety", "Peace", "Confusion", "Excitement", "Anger"].map(emotion => (
                    <button
                      key={emotion}
                      type="button"
                      className={`px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium transition whitespace-nowrap backdrop-blur
                        ${selectedEmotions.includes(emotion)
                          ? 'bg-white text-black shadow font-semibold'
                          : 'bg-white/30 text-gray-800 hover:bg-white/50'}
                      `}
                      onClick={() => handleEmotionToggle(emotion)}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Analysis Result (loading/error only) */}
            <div className="w-full max-w-2xl mt-8 px-2 sm:px-0">
              {loading && <div className="text-gray-700 text-lg">Analyzing your dream...</div>}
              {error && <div className="text-red-600 text-base">{error}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
