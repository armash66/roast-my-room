/**
 * Navbar — Premium glassmorphism navigation with animated indicators.
 */

import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Flame, Clock, Trophy, Swords } from "lucide-react";

const navLinks = [
  { path: "/", label: "Roast", icon: Flame },
  { path: "/battle", label: "Battle", icon: Swords },
  { path: "/history", label: "History", icon: Clock },
  { path: "/leaderboard", label: "Top Roasts", icon: Trophy },
];

export function Navbar() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl"
    >
      <div className="glass-strong rounded-2xl px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: [0, -15, 15, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Flame size={26} className="text-orange-500" />
              <div className="absolute inset-0 blur-lg bg-orange-500/30 rounded-full" />
            </motion.div>
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-white">Roast</span>
              <span className="text-gradient">My</span>
              <span className="text-white">Room</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;

              return (
                <Link
                  key={path}
                  to={path}
                  className="relative px-3 py-2 rounded-xl"
                >
                  <motion.div
                    className={`
                      flex items-center gap-2 text-sm font-medium relative z-10
                      transition-colors duration-200
                      ${isActive ? "text-orange-400" : "text-neutral-400 hover:text-neutral-200"}
                    `}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{label}</span>
                  </motion.div>

                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/[0.06] rounded-xl border border-white/[0.08]"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
