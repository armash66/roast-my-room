/**
 * LoadingState — Brutalist terminal loader
 */

import { useState, useEffect } from "react";
import type { RoastStage } from "../types";

interface LoadingProps {
  statusMessage: string;
  stage: RoastStage;
}

const funMessages = [
  "ANALYZING STRUCTURAL FAILURES...",
  "EXTRACTING UGLINESS METRICS...",
  "CONSULTING DESIGN POLICE...",
  "CALCULATING MONETARY DAMAGE...",
];

export function LoadingState({ statusMessage, stage }: LoadingProps) {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((i) => (i + 1) % funMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full brutal-box p-6 font-mono bg-black text-[#b2ff05] mt-8">
      <div className="flex justify-between items-center border-b-2 border-[#b2ff05] pb-2 mb-4">
        <span className="font-bold">SYSTEM.LOADING</span>
        <span className="animate-pulse">_</span>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <span className="text-white shrink-0">[PROCESS]</span>
          <span className="truncate">{statusMessage || funMessages[messageIdx]}</span>
        </div>

        <div className="flex gap-4 items-center">
          <span className="text-white shrink-0">[STAGE__]</span>
          <span className="uppercase text-[#ff3b30] font-bold bg-white px-2">
            {stage}
          </span>
        </div>

        <div className="w-full border-2 border-[#b2ff05] h-6 relative mt-4">
          <div 
            className="h-full bg-[#b2ff05] transition-all duration-500" 
            style={{ 
              width: stage === 'analyzing' ? '33%' : stage === 'roasting' ? '66%' : '100%' 
            }}
          />
        </div>
      </div>
    </div>
  );
}
