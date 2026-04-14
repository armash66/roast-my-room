/**
 * Navbar — Top navigation bar with links and branding.
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Flame size={28} className="text-orange-500" />
            </motion.div>
            <span className="text-xl font-black text-white tracking-tight">
              Roast<span className="text-orange-500">My</span>Room
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;

              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${
                      isActive
                        ? "text-orange-400"
                        : "text-neutral-400 hover:text-neutral-200"
                    }
                  `}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-orange-500/10 border border-orange-500/20 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
