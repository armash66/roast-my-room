/**
 * ShareCard — Brutalist Canvas Export
 */

import { useRef, useCallback } from "react";
import { Download, Share2 } from "lucide-react";
import type { RoastMode, RoastScores } from "../types";

interface ShareCardProps {
  roast: string;
  scores: RoastScores;
  worstOffender: string;
  mode: RoastMode;
}

export function ShareCard({ roast, scores, worstOffender, mode }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const w = 800;
    const h = 520;
    canvas.width = w;
    canvas.height = h;

    // Background (Stark White)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Thick border around canvas
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, w, h);

    // Title Block
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, w, 80);
    ctx.fillStyle = "#b2ff05";
    ctx.font = "900 32px 'Space Grotesk', sans-serif";
    ctx.fillText("ROAST_MY_ROOM", 32, 50);

    // Mode badge
    ctx.fillStyle = "#111111";
    ctx.font = "bold 14px 'IBM Plex Mono', monospace";
    ctx.fillText(`MODE: [${mode.toUpperCase()}]`, w - 180, 48);

    // Roast text
    ctx.fillStyle = "#111111";
    ctx.font = "bold 18px 'Space Grotesk', sans-serif";
    const maxWidth = w - 64;
    const words = roast.split(" ");
    let line = "";
    let y = 140;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, 32, y);
        line = word + " ";
        y += 28;
        if (y > 320) {
          ctx.fillText(line.trim() + "...", 32, y);
          break;
        }
      } else {
        line = test;
      }
    }
    if (y <= 320) ctx.fillText(line, 32, y);

    // Divider
    y = Math.max(y + 40, 360);
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, y, w, 4);

    // Scores
    y += 40;
    const scoreEntries = [
      ["CHAOS", scores.chaos_level],
      ["FURNITURE", scores.furniture_crime],
      ["LIGHTING", scores.lighting_sin],
      ["OVERALL", scores.overall_disaster],
    ] as const;

    let sx = 32;
    for (const [label, val] of scoreEntries) {
      ctx.fillStyle = "#111111";
      ctx.fillRect(sx, y, 140, 60);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px 'IBM Plex Mono', monospace";
      ctx.fillText(label, sx + 10, y + 20);

      ctx.fillStyle = "#b2ff05";
      ctx.font = "900 24px 'Space Grotesk', sans-serif";
      ctx.fillText(`${val}/10`, sx + 10, y + 48);
      
      sx += 160;
    }

    // Footer
    ctx.fillStyle = "#111111";
    ctx.font = "bold 14px 'IBM Plex Mono', monospace";
    ctx.fillText("ROASTMYROOM.APP", w - 160, h - 30);

    return canvas;
  }, [roast, scores, mode]);

  const handleDownload = useCallback(() => {
    const canvas = generateCard();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "roastmyroom_export.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [generateCard]);

  const handleShare = useCallback(async () => {
    const canvas = generateCard();
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => b && res(b), "image/png")
      );
      await navigator.share({
        files: [new File([blob], "roastmyroom_export.png", { type: "image/png" })],
        title: "ROAST_MY_ROOM EXPORT",
        text: `STRUCTURAL DAMAGE: ${scores.overall_disaster}/10`,
      });
    } catch {
      handleDownload();
    }
  }, [generateCard, handleDownload, scores]);

  return (
    <div className="flex gap-4 mt-8">
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={handleDownload}
        className="brutal-btn flex-1 flex items-center justify-center gap-2 text-sm"
      >
        <Download size={18} strokeWidth={3} />
        DOWNLOAD EXPORT
      </button>

      <button
        onClick={handleShare}
        className="brutal-btn brutal-btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
      >
        <Share2 size={18} strokeWidth={3} />
        SHARE DAMAGE
      </button>
    </div>
  );
}
