/**
 * ShareCard — Generate a shareable roast image using Canvas API.
 */

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
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

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#0a0a0a");
    bgGrad.addColorStop(1, "#1a0a00");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle accent glow
    const glow = ctx.createRadialGradient(100, 100, 0, 100, 100, 300);
    glow.addColorStop(0, "rgba(249, 115, 22, 0.08)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = "rgba(249, 115, 22, 0.2)";
    ctx.lineWidth = 1;
    ctx.roundRect(1, 1, w - 2, h - 2, 20);
    ctx.stroke();

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Space Grotesk', Inter, sans-serif";
    ctx.fillText("🔥 RoastMyRoom", 32, 50);

    // Mode badge
    const modeColors: Record<string, string> = {
      mild: "#eab308",
      brutal: "#ef4444",
      unhinged: "#a855f7",
    };
    ctx.fillStyle = modeColors[mode] || "#f97316";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.fillText(mode.toUpperCase(), 32, 80);

    // Roast text
    ctx.fillStyle = "#d4d4d4";
    ctx.font = "500 16px Inter, sans-serif";
    const maxWidth = w - 64;
    const words = roast.split(" ");
    let line = "";
    let y = 120;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, 32, y);
        line = word + " ";
        y += 24;
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
    y = Math.max(y + 30, 350);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.moveTo(32, y);
    ctx.lineTo(w - 32, y);
    ctx.stroke();

    // Scores
    y += 30;
    const scoreEntries = [
      ["🌀", scores.chaos_level],
      ["🪑", scores.furniture_crime],
      ["💡", scores.lighting_sin],
      ["💥", scores.overall_disaster],
    ] as const;

    let sx = 32;
    for (const [icon, val] of scoreEntries) {
      ctx.font = "16px sans-serif";
      ctx.fillText(icon, sx, y);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Inter, sans-serif";
      ctx.fillText(`${val}/10`, sx + 24, y);
      ctx.fillStyle = "#d4d4d4";
      sx += 120;
    }

    // Worst offender
    if (worstOffender) {
      y += 35;
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText("⚠ WORST OFFENDER", 32, y);
      ctx.fillStyle = "#fca5a5";
      ctx.font = "500 14px Inter, sans-serif";
      ctx.fillText(worstOffender, 32, y + 20);
    }

    // Footer
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("roastmyroom.app", w - 130, h - 20);

    return canvas;
  }, [roast, scores, worstOffender, mode]);

  const handleDownload = useCallback(() => {
    const canvas = generateCard();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "roastmyroom.png";
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
        files: [new File([blob], "roastmyroom.png", { type: "image/png" })],
        title: "My Room Got Roasted",
        text: `My room scored ${scores.overall_disaster}/10 on the disaster scale 🔥`,
      });
    } catch {
      handleDownload();
    }
  }, [generateCard, handleDownload, scores]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex gap-3"
    >
      <canvas ref={canvasRef} className="hidden" />

      <motion.button
        onClick={handleDownload}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                   bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06]
                   text-neutral-300 text-sm font-medium transition-colors"
      >
        <Download size={16} />
        Download Card
      </motion.button>

      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                   bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15
                   text-orange-400 text-sm font-medium transition-colors"
      >
        <Share2 size={16} />
        Share
      </motion.button>
    </motion.div>
  );
}
