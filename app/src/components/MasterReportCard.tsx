import React from "react";
import {
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import SkillRadar from "./SkillRadar";

interface SessionData {
  timestamp: number;
  score: number;
  company: string;
}

interface MasterReportCardProps {
  history: SessionData[];
  dnaMatch: any;
  velocity: number;
  verdict: string;
}

export const MasterReportCard: React.FC<MasterReportCardProps> = ({
  history,
  dnaMatch,
  velocity,
  verdict,
}) => {
  return (
    <div className="card-clinical p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#30D8A8]/5 blur-3xl rounded-full -mr-48 -mt-48 transition-transform group-hover:scale-110" />

      <div className="flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Left: Radar & Overall */}
        <div className="w-full lg:w-2/5 flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold mb-2">
              Technical Authority Profile
            </h2>
            <p className="text-sm text-white/50 lowercase tracking-widest">
              Calculated technical DNA match
            </p>
          </div>

          <div className="w-full aspect-square max-w-[320px] mb-8">
            <SkillRadar data={dnaMatch} />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <div className="text-2xl font-black text-[#30D8A8]">
                {(velocity * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Technical Velocity
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <div
                className={`text-2xl font-black ${velocity >= 0 ? "text-[#30D8A8]" : "text-red-400"}`}
              >
                {velocity >= 0 ? (
                  <ArrowUpRight className="inline w-6 h-6" />
                ) : (
                  <ArrowDownRight className="inline w-6 h-6" />
                )}
                {Math.abs(velocity * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Growth Drift
              </div>
            </div>
          </div>
        </div>

        {/* Right: History & Verdict */}
        <div className="w-full lg:w-3/5">
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#30D8A8] mb-4">
              <Activity className="w-4 h-4" />
              Karan's Technical Audit
            </h3>
            <div className="p-6 rounded-2xl bg-[#30D8A8]/5 border border-[#30D8A8]/10">
              <p className="text-lg leading-relaxed italic text-white/80">
                "{verdict}"
              </p>
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-400 mb-4">
              <TrendingUp className="w-4 h-4" />
              Trajectory Log
            </h3>
            <div className="space-y-3">
              {history.map((session, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">{session.company}</div>
                      <div className="text-xs text-white/40">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#30D8A8]"
                        style={{ width: `${session.score * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm font-bold">
                      {Math.round(session.score * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
