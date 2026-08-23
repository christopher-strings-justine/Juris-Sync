import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

export interface TimelineEvent {
  date: string;
  event: string;
  source: string;
  conflict_flag: boolean;
}

export interface TimelineData {
  timeline: TimelineEvent[];
  pattern_detected: string;
}

export default function TimelineAnalysis({ contradictionId, userRole }: { contradictionId: string, userRole: string }) {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/timeline-analysis?contradiction_id=${contradictionId}`, {
          headers: { 'x-user-role': userRole }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load timeline", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [contradictionId, userRole]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 border border-border/50 rounded-xl bg-[#0F111A]/50">
        <div className="radar-loader" style={{ transform: "scale(0.25)", transformOrigin: "center" }}></div>
        <p className="text-xs text-muted-foreground animate-pulse tracking-widest uppercase">Compiling Chronology...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col border border-border/60 rounded-xl bg-[#090A0F] overflow-hidden shadow-xl mb-6">
      <div className="bg-[#151822] p-3 border-b border-border/60 flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-400">
          <Clock className="w-4 h-4" /> 
          Temporal Topology
        </h4>
        <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/30">
          PATTERN MATCH: 94%
        </Badge>
      </div>
      
      <div className="p-4 space-y-5">
        {data.pattern_detected && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/30 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-red-400 mb-1 tracking-wide uppercase">Systemic Pattern Detected</div>
              <p className="text-[11px] text-red-200/80 leading-relaxed">{data.pattern_detected}</p>
            </div>
          </div>
        )}

        <div className="relative pl-3 space-y-6 before:absolute before:inset-0 before:ml-4 before:translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-blue-500/0 before:via-blue-500/50 before:to-blue-500/0">
          {data.timeline.map((item, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              {/* Icon */}
              <div className={`flex items-center justify-center w-3 h-3 rounded-full shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-[-6px] md:left-1/2 ${item.conflict_flag ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'}`}>
              </div>
              
              {/* Content */}
              <div className={`w-[calc(100%-1.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border bg-background/50 backdrop-blur-sm shadow relative ${item.conflict_flag ? 'border-red-500/30 bg-red-500/5' : 'border-border/60'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold tracking-wider uppercase ${item.conflict_flag ? 'text-red-400' : 'text-blue-400'}`}>{item.date}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 bg-black/40">{item.source}</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-tight mt-2">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
