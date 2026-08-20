"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = Array.from(particlesRef.current.children);
    particles.forEach((particle) => {
      gsap.set(particle, {
        width: "random(2, 8)",
        height: "random(2, 8)",
        top: "random(0, 100)%",
        left: "random(0, 100)%",
      });
      gsap.to(particle, {
        y: "random(-100, 100)",
        x: "random(-100, 100)",
        opacity: "random(0.1, 0.5)",
        duration: "random(3, 10)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-white z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Floating Particles */}
      <div ref={particlesRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-secondary/30"
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-black/5 backdrop-blur-sm text-sm text-secondary font-medium"
        >
          Dates Announced: Oct 15-17, 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-black to-black"
        >
          CODE FOR GUJARAT 2026
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10"
        >
          India's Biggest Student Innovation Hackathon where students solve real-world problems using AI, Web, Mobile, IoT and Cloud.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group relative flex items-center justify-center gap-2 bg-white text-dark px-8 py-4 rounded-full font-semibold text-lg transition-transform hover:scale-105"
          >
            Register Now
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="#tracks"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg border border-white/20 hover:bg-black/5 transition-colors"
          >
            Explore Tracks
          </Link>
        </motion.div>
      </div>

      {/* Statistics Bottom Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-dark to-transparent pt-20 pb-10"
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 border-t border-white/10 pt-8">
            {[
              { value: "5000+", label: "Students" },
              { value: "500+", label: "Teams" },
              { value: "100+", label: "Colleges" },
              { value: "48 Hours", label: "Hackathon" },
              { value: "₹10 Lakhs+", label: "Prize Pool" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <h3 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
