"use client";

import { useState } from "react";
import Hero from "@/sections/Hero";
import Lore from "@/sections/Lore";
import Evolution from "@/sections/Evolution";
import Token from "@/sections/Token";
import Game from "@/sections/Game";
import Archives from "@/sections/Archives";
import Community from "@/sections/Community";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Marquee from "@/components/ui/Marquee";
import LoadingScreen from "@/components/LoadingScreen";
import StatusHUD from "@/components/StatusHUD";
import ScrollMotion from "@/components/ScrollMotion";
import LeavesBackground from "@/components/LeavesBackground";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      <StatusHUD />
      <LeavesBackground />
      <ScrollMotion />
      <div className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}>
        <Navbar />
        <Marquee />
        <main>
          <Hero />
          <Lore />
          <Evolution />
          <Token />
          <Game />
          <Archives />
          <Community />

          <section id="reforestacion" className="relative overflow-hidden py-24 sm:py-32">
            <div className="container-x">
              <div className="donation-card mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-green/20 bg-[linear-gradient(135deg,rgba(248,252,248,0.96),rgba(226,244,227,0.9),rgba(255,246,249,0.94))] p-6 shadow-[0_30px_80px_-30px_rgba(74,138,74,0.42)] sm:p-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <p className="mb-3 text-xs font-semibold tracking-[0.32em] text-ink-faint uppercase">
                      REFORESTATION
                    </p>
                    <h2 className="display text-4xl tracking-tight sm:text-5xl">
                      10% of rewards to grow <span className="text-green">more trees</span>
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-ink-soft">
                      Every reward and every action from the community helps plant real trees.
                      The project dedicates 10% of rewards to reforestation initiatives to restore
                      balance to the environment and turn the Inusaur ecosystem into something
                      alive, useful, and sustainable.
                    </p>
                  </div>

                  <div className="flex min-w-[260px] flex-col gap-4 rounded-[1.5rem] border border-green/20 bg-ink/90 p-5 text-paper shadow-[0_22px_45px_-22px_rgba(13,31,13,0.8)]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.62rem] tracking-[0.28em] text-green/70 uppercase">
                        impact
                      </span>
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green animate-pulse" />
                    </div>

                    <div>
                      <p className="font-mono text-3xl font-bold text-green">10%</p>
                      <p className="mt-1 text-[0.62rem] tracking-[0.24em] text-green/60 uppercase">
                        rewards dedicated
                      </p>
                    </div>

                    <div className="rounded-2xl border border-green/15 bg-green/10 px-4 py-3">
                      <p className="text-[0.62rem] tracking-[0.24em] text-green/70 uppercase">goal</p>
                      <p className="mt-2 text-xl font-semibold text-paper">Real reforestation</p>
                    </div>

                    <button
                      type="button"
                      className="rounded-full bg-green px-4 py-3 text-[0.62rem] font-bold tracking-[0.22em] text-paper uppercase transition-all hover:bg-moss hover:shadow-[0_0_30px_rgba(74,138,74,0.35)]"
                    >
                      support the project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}