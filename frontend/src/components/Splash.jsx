import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const BOOT_LINES = [
  'INITIALIZING ACIP v1.0…',
  'CONNECTING BUSINESS BRAIN…',
  'LOADING DIGITAL TWIN ENGINE…',
  'SECURING DATA VAULT…',
  'COMPANY OS // ONLINE ✓'
];

export default function Splash({ onDone }) {
  const [lines, setLines] = useState([]);
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [bootStarted, setBootStarted] = useState(false);

  useEffect(() => {
    // Logo appears first
    setTimeout(() => setLogoVisible(true), 300);
    setTimeout(() => setTextVisible(true), 800);
    setTimeout(() => setBootStarted(true), 1400);
  }, []);

  useEffect(() => {
    if (!bootStarted) return;
    let i = 0;
    const addLine = () => {
      if (i < BOOT_LINES.length) {
        setLines(l => [...l, BOOT_LINES[i]]);
        i++;
        setTimeout(addLine, i === BOOT_LINES.length ? 0 : 320);
      } else {
        setTimeout(onDone, 600);
      }
    };
    addLine();
  }, [bootStarted, onDone]);

  return (
    <div className="fixed inset-0 bg-base z-50 flex flex-col items-center justify-center grid-bg overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-amber/8 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className={`flex flex-col items-center transition-all duration-700 ${logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan to-amber flex items-center justify-center mb-5 ${logoVisible ? 'pulse-ring' : ''}`}
          style={{ boxShadow: '0 0 40px rgba(0,212,255,0.4)' }}>
          <Zap size={40} className="text-base" strokeWidth={2.5} />
        </div>

        <div className={`text-center transition-all duration-500 delay-200 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="font-display text-4xl font-bold tracking-wider mb-1">ACIP</div>
          <div className="text-[11px] font-mono text-mute tracking-[0.3em] uppercase">Advanced Company Intelligence Platform</div>
        </div>
      </div>

      {/* Boot sequence */}
      <div className="absolute bottom-16 left-6 right-6 font-mono text-[11px] space-y-1">
        {/* Scan line */}
        <div className="relative h-px bg-cyan/20 mb-4 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-cyan to-transparent scan-line" />
        </div>
        {lines.map((line, i) => (
          <div key={i} className={`flex items-center gap-2 ${i === lines.length - 1 ? 'text-good' : 'text-mute'}`}
            style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <span className="text-cyan/60">{'>'}</span>
            <span>{line}</span>
            {i === lines.length - 1 && i < BOOT_LINES.length - 1 && (
              <span className="inline-block w-1.5 h-3 bg-cyan animate-pulse ml-0.5" />
            )}
          </div>
        ))}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
