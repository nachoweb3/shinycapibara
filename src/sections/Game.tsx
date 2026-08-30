"use client";

import dynamic from "next/dynamic";
import Reveal from "@/components/ui/Reveal";

const InusaurRun = dynamic(() => import("@/components/InusaurRun"), { ssr: false });

export default function Game() {
  return (
    <section id="game" className="relative py-20 px-4 bg-[#050508]">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <div className="text-xs tracking-[0.3em] mb-3" style={{ color: "#4ade80" }}>
              INUSAUR // RUN
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight" style={{
              textShadow: "0 0 40px rgba(74, 222, 128, 0.3)",
              color: "#4ade80",
            }}>
              THE EVOLUTION
            </h2>
            <p className="text-sm mt-4 max-w-xl mx-auto" style={{ color: "#666" }}>
              HOW LONG CAN YOUR INUSAUR EVOLVE?
            </p>
          </div>
        </Reveal>

        {/* Game Container */}
        <div className="relative rounded-2xl overflow-hidden border border-[#222]" style={{
          boxShadow: "0 0 40px rgba(74, 222, 128, 0.1)",
        }}>
          <InusaurRun />
        </div>

        {/* Game Info */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "MAPS", value: "5", icon: "🗺️" },
            { label: "DIFFICULTY", value: "4 LEVELS", icon: "⚡" },
            { label: "EVOLUTION", value: "10 STAGES", icon: "🧬" },
            { label: "ACHIEVEMENTS", value: "34", icon: "🏆" },
          ].map((info) => (
            <div key={info.label} className="p-4 rounded-xl border border-[#222] bg-[#0a0a0f] text-center">
              <div className="text-2xl mb-2">{info.icon}</div>
              <div className="text-xs tracking-widest" style={{ color: "#666" }}>
                {info.label}
              </div>
              <div className="text-lg font-bold mt-1" style={{ color: "#4ade80" }}>
                {info.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}