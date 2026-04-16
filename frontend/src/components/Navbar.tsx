/**
 * Navbar — Brutalist Top Bar
 */

import { Link, useLocation } from "react-router-dom";
import { Flame, Clock, Trophy, Swords } from "lucide-react";

const navLinks = [
  { path: "/", label: "Roast", icon: Flame },
  { path: "/battle", label: "Battle", icon: Swords },
  { path: "/history", label: "History", icon: Clock },
  { path: "/leaderboard", label: "Top Rank", icon: Trophy },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="w-full bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between shadow-[0px_4px_0px_0px_rgba(17,17,17,1)] sticky top-0 z-50">
      
      {/* Brutalist Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-black text-[#b2ff05] p-2 border-2 border-black">
          <Flame size={20} strokeWidth={3} />
        </div>
        <span className="text-xl font-black title-brutal tracking-tighter">
          ROAST_MY_ROOM
        </span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-3">
        {navLinks.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              className={`
                flex items-center gap-2 px-3 py-2 font-mono text-sm font-bold uppercase
                border-2 transition-all
                ${
                  isActive
                    ? "bg-[#b2ff05] border-black shadow-[2px_2px_0px_0px_#111] translate-x-[-2px] translate-y-[-2px]"
                    : "bg-white border-transparent text-gray-500 hover:border-black hover:text-black"
                }
              `}
            >
              <Icon size={16} strokeWidth={isActive ? 3 : 2} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
