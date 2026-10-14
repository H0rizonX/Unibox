"use client";

import { useEffect, useState } from "react";

const greetings = [
  { text: "你好", lang: "中文" },
  { text: "Hello", lang: "English" },
  { text: "こんにちは", lang: "日本語" },
  { text: "안녕하세요", lang: "한국어" },
  { text: "Bonjour", lang: "Français" },
  { text: "Hola", lang: "Español" },
  { text: "Привет", lang: "Русский" },
  { text: "مرحبا", lang: "العربية" },
  { text: "नमस्ते", lang: "हिन्दी" },
  { text: "Ciao", lang: "Italiano" },
  { text: "Hallo", lang: "Deutsch" },
  { text: "Olá", lang: "Português" },
];

const SWITCH_INTERVAL = 300;

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % greetings.length);
        setIsVisible(true);
      }, 400);
    }, SWITCH_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-svh w-full items-center justify-center overflow-hidden bg-black">
      <div
        className="relative z-10 text-center transition-opacity duration-300"
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      >
        <h1
          key={currentIndex}
          className="glow-text text-5xl font-light tracking-wide text-white sm:text-3xl md:text-4xl lg:text-4xl"
          style={{
            animation: "glowPulse 1s ease-in-out infinite",
          }}
        >
          {greetings[currentIndex].text}
        </h1>
        {/*  <p className="glow-subtext mt-6 text-sm font-light tracking-[0.3em] uppercase text-white/50 sm:text-base">
          {greetings[currentIndex].lang}
          </p> */}
      </div>

      <style>{`
        .glow-text {
          text-shadow:
            0 0 10px rgba(255, 255, 255, 0.8),
            0 0 20px rgba(255, 255, 255, 0.6),
            0 0 40px rgba(255, 255, 255, 0.4),
            0 0 80px rgba(255, 255, 255, 0.2);
        }
        .glow-subtext {
          text-shadow:
            0 0 8px rgba(255, 255, 255, 0.4),
            0 0 16px rgba(255, 255, 255, 0.2);
        }
        @keyframes glowPulse {
          0%, 100% {
            text-shadow:
              0 0 10px rgba(255, 255, 255, 0.8),
              0 0 20px rgba(255, 255, 255, 0.6),
              0 0 40px rgba(255, 255, 255, 0.4),
              0 0 80px rgba(255, 255, 255, 0.2);
          }
          50% {
            text-shadow:
              0 0 15px rgba(255, 255, 255, 1),
              0 0 30px rgba(255, 255, 255, 0.8),
              0 0 60px rgba(255, 255, 255, 0.5),
              0 0 100px rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
