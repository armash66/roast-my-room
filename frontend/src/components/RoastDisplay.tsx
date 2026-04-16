/**
 * RoastDisplay — Brutalist Printout
 */

import { AlertTriangle, Quote } from "lucide-react";

interface RoastDisplayProps {
  text: string;
  worstOffender: string;
  isStreaming: boolean;
}

export function RoastDisplay({ text, worstOffender, isStreaming }: RoastDisplayProps) {
  // Highlight worst offender in the text
  const renderText = () => {
    if (!worstOffender || !text) return text;

    const regex = new RegExp(`(${worstOffender.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-[#ff3b30] text-white px-1 font-bold">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Roast text box */}
      <div className="brutal-box p-6 bg-white relative">
        <div className="absolute top-0 right-0 bg-black text-[#b2ff05] px-2 py-1 text-xs font-mono font-bold border-l-2 border-b-2 border-black">
          ROAST_OUTPUT
        </div>
        
        <Quote size={28} className="text-black mb-4" strokeWidth={3} />
        
        <p className="text-xl font-bold leading-relaxed">
          {renderText()}
          {isStreaming && (
            <span className="inline-block w-3 h-5 bg-[#b2ff05] border border-black ml-2 align-middle animate-pulse" />
          )}
        </p>
      </div>

      {/* Worst offender callout */}
      {worstOffender && (
        <div className="flex items-start gap-4 p-4 border-2 border-black bg-[#ffcc00] shadow-[4px_4px_0px_0px_#111]">
          <div className="p-2 border-2 border-black bg-white">
            <AlertTriangle size={24} strokeWidth={3} className="text-black" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1">
              Critical Offense Identified
            </p>
            <p className="font-bold text-lg">{worstOffender}</p>
          </div>
        </div>
      )}
    </div>
  );
}
