import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Cpu, Info, ShieldAlert, Zap } from 'lucide-react';
import { PriorityScoreBreakdown } from '../../types';
import { PRIORITY_CONFIG } from '../../utils/constants';

interface Props {
  breakdown: PriorityScoreBreakdown;
  interactive?: boolean;
}

export const PriorityRadialMeter: React.FC<Props> = ({ breakdown, interactive = true }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth count-up animation for hackathon wow moment
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(easeProgress * breakdown.score);
      setAnimatedScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [breakdown.score]);

  const config = PRIORITY_CONFIG[breakdown.level];

  // SVG Radial Circle geometry
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Determine stroke color based on priority level
  let strokeColor = '#34d399'; // green
  if (breakdown.score >= 80) strokeColor = '#f43f5e'; // red
  else if (breakdown.score >= 60) strokeColor = '#fb923c'; // orange
  else if (breakdown.score >= 35) strokeColor = '#fbbf24'; // amber

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Smart Priority Engine
            </h3>
            <p className="text-[11px] text-slate-400">Deterministic Civic Scoring</p>
          </div>
        </div>
        <span
          className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${config.bg} ${config.color} ${config.border} flex items-center gap-1.5 shadow-lg`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          {config.label}
        </span>
      </div>

      {/* Center Radial Visualization */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
            {/* Background ring */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              className="text-slate-800"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated foreground ring */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke={strokeColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-out"
              style={{
                filter: `drop-shadow(0 0 12px ${strokeColor}66)`,
              }}
            />
          </svg>

          {/* Center Score Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight flex items-baseline">
              {animatedScore}
              <span className="text-sm text-slate-400 font-normal ml-0.5">/100</span>
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${config.color}`}>
              {breakdown.level}
            </div>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 w-full space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Severity Factor</span>
              <span className="font-mono text-cyan-400">{breakdown.severityPoints} / 40 pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-rose-500 rounded-full transition-all duration-1000"
                style={{ width: `${(breakdown.severityPoints / 40) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">People Affected</span>
              <span className="font-mono text-amber-400">{breakdown.peoplePoints} / 30 pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                style={{ width: `${(breakdown.peoplePoints / 30) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Location Risk Index</span>
              <span className="font-mono text-purple-400">{breakdown.locationPoints} / 20 pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${(breakdown.locationPoints / 20) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Category Priority</span>
              <span className="font-mono text-emerald-400">{breakdown.categoryPoints} / 10 pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${(breakdown.categoryPoints / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Human-Readable Explanation Box */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-slate-200">Why this score?</span>
          <p className="text-slate-400 leading-relaxed">
            {breakdown.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
