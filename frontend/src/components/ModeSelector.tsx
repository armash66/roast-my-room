/**
 * ModeSelector — Brutalist Radio Buttons
 */

import type { RoastMode } from "../types";

interface ModeSelectorProps {
  selected: RoastMode;
  onChange: (mode: RoastMode) => void;
  disabled?: boolean;
}

const modes: { value: RoastMode; label: string; tag: string }[] = [
  { value: "mild",     label: "MILD",     tag: "(PLAYFUL)" },
  { value: "brutal",   label: "BRUTAL",   tag: "(NO MERCY)" },
  { value: "unhinged", label: "UNHINGED", tag: "(CHAOS)" },
];

export function ModeSelector({ selected, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="w-full">
      <div className="font-bold border-b-2 border-black inline-block mb-3 uppercase text-sm tracking-wide">
        INTENSITY.LEVEL
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modes.map((mode) => {
          const isSelected = selected === mode.value;

          return (
            <button
              key={mode.value}
              onClick={() => onChange(mode.value)}
              disabled={disabled}
              className={`
                border-2 border-black p-4 text-left font-mono transition-none
                ${isSelected ? "bg-black text-white translate-x-[2px] translate-y-[2px]" : "bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_#111]"}
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-black text-lg ${isSelected ? "text-[#b2ff05]" : ""}`}>
                  {mode.label}
                </span>
                {isSelected && (
                  <div className="w-3 h-3 bg-[#b2ff05] rounded-none border border-black animate-pulse" />
                )}
              </div>
              <span className="text-xs font-bold block">{mode.tag}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
