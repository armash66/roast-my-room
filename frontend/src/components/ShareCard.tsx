/**
 * ShareCard — Generates a shareable roast card image.
 * Uses canvas API to render a stylized card.
 */

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, Download } from "lucide-react";
import type { RoastScores, RoastMode } from "../types";

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
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 800;
    const h = 500;
    canvas.width = w;
    canvas.height = h;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#0a0a0a");
    gradient.addColorStop(0.5, "#171717");
    gradient.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2;
    ctx.roundRect(10, 10, w - 20, h - 20, 16);
    ctx.stroke();

    // Title
    ctx.fillStyle = "#f97316";
    ctx.font = "bold 28px Inter, system-ui, sans-serif";
    ctx.fillText("🔥 RoastMyRoom", 30, 55);

    // Mode badge
    const modeText = mode.toUpperCase();
    ctx.font = "bold 14px Inter, system-ui, sans-serif";
    const modeWidth = ctx.measureText(modeText).width + 20;
    ctx.fillStyle = mode === "mild" ? "#eab308" : mode === "brutal" ? "#ef4444" : "#a855f7";
    ctx.roundRect(w - modeWidth - 30, 32, modeWidth, 28, 6);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(modeText, w - modeWidth - 20, 52);

    // Roast text
    ctx.fillStyle = "#e5e5e5";
    ctx.font = '16px Inter, system-ui, sans-serif';
    wrapText(ctx, `"${roast}"`, 30, 100, w - 60, 24);

    // Scores
    const scoreY = 280;
    ctx.fillStyle = "#737373";
    ctx.font = "bold 12px Inter, system-ui, sans-serif";
    ctx.fillText("DAMAGE REPORT", 30, scoreY);

    const scoreItems = [
      { label: "🌪️ Chaos", value: scores.chaos_level },
      { label: "🪑 Furniture", value: scores.furniture_crime },
      { label: "💡 Lighting", value: scores.lighting_sin },
      { label: "☠️ Overall", value: scores.overall_disaster },
    ];

    scoreItems.forEach((item, i) => {
      const x = 30 + i * 185;
      const y = scoreY + 25;

      ctx.fillStyle = "#a3a3a3";
      ctx.font = "14px Inter, system-ui, sans-serif";
      ctx.fillText(item.label, x, y);

      ctx.fillStyle = item.value >= 8 ? "#f87171" : item.value >= 5 ? "#fb923c" : "#facc15";
      ctx.font = "bold 24px Inter, system-ui, sans-serif";
      ctx.fillText(`${item.value}/10`, x, y + 30);
    });

    // Worst offender
    ctx.fillStyle = "#991b1b";
    ctx.roundRect(30, 380, w - 60, 50, 10);
    ctx.fill();
    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 12px Inter, system-ui, sans-serif";
    ctx.fillText("⚠️ WORST OFFENDER", 45, 400);
    ctx.fillStyle = "#fef2f2";
    ctx.font = "bold 16px Inter, system-ui, sans-serif";
    ctx.fillText(worstOffender, 45, 420);

    // Footer
    ctx.fillStyle = "#525252";
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText("roastmyroom.app — Get your room roasted too 🔥", 30, h - 25);
  }, [roast, scores, worstOffender, mode]);

  const downloadCard = useCallback(() => {
    generateCard();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "roast-my-room.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [generateCard]);

  const shareCard = useCallback(async () => {
    generateCard();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      await navigator.share({
        text: "Check out my room's roast 🔥",
        files: [new File([blob], "roast.png", { type: "image/png" })],
      });
    } catch {
      // Fallback to download
      downloadCard();
    }
  }, [generateCard, downloadCard]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex items-center gap-3 mt-4"
    >
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={downloadCard}
        className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 
                   rounded-xl text-neutral-300 text-sm font-medium transition-colors"
      >
        <Download size={16} />
        Download Card
      </button>

      <button
        onClick={shareCard}
        className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 
                   rounded-xl text-white text-sm font-medium transition-colors"
      >
        <Share2 size={16} />
        Share Roast
      </button>
    </motion.div>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line, x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
