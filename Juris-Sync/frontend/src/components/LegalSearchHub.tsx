import React, { useState, useEffect } from 'react';
import { Search, BookOpen, BookmarkPlus, X, ExternalLink, Library, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Precedent {
  id: string;
  case_title: string;
  court: string;
  year: number;
  relevance: number;
  summary: string;
}

export default function LegalSearchHub({ 
  contradictionId, 
  initialQuery, 
  userRole,
  onClose 
}: { 
  contradictionId: string;
  initialQuery: string;
  userRole: string;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Precedent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/legal-search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': userRole 
        },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        const json = await res.json();
        setResults(json.results || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const saveInsight = async (prec: Precedent) => {
    setSavingId(prec.id);
    try {
      await fetch(`http://localhost:8000/api/save-insight`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': userRole 
        },
        body: JSON.stringify({ 
          contradiction_id: contradictionId,
          case_title: prec.case_title,
          insight_notes: savedNotes[prec.id] || "No additional notes."
        })
      });
      // Show saved state visually
      setTimeout(() => setSavingId(null), 1000);
    } catch (err) {
      console.error(err);
      setSavingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-full max-h-[85vh] bg-[#090A0F] border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-[#090A0F] to-[#151822]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
              <Scale className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-slate-200">AI Legal Search Hub</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Precedent Deep-Dive & Pattern Recognition</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Bar Area */}
        <div className="p-6 bg-[#0B0D14] border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full h-12 bg-[#151822] border border-border/50 rounded-xl pl-11 pr-32 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              placeholder="Search case law, judgements, and statutes..."
            />
            <Button 
              onClick={handleSearch}
              className="absolute right-1 top-1 bottom-1 h-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 text-xs font-medium"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-hidden relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090A0F]">
              <div className="radar-loader mb-4" style={{ transform: "scale(0.3)", transformOrigin: "center" }}></div>
              <p className="text-xs text-muted-foreground animate-pulse tracking-widest uppercase">Querying Indian Case Law Database...</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.map((prec) => (
                  <div key={prec.id} className="flex flex-col bg-[#151822] border border-border/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-colors group">
                    <div className="p-5 border-b border-border/50">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="bg-slate-900/50 text-[10px] text-slate-300 border-slate-700 uppercase tracking-wider">
                          <Library className="w-3 h-3 mr-1 inline-block" /> {prec.court} ({prec.year})
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">
                          {prec.relevance}% Match
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-slate-200 leading-snug mb-2 flex items-start gap-2">
                        {prec.case_title}
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-blue-400" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {prec.summary}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-black/20 flex flex-col gap-3">
                      <textarea
                        placeholder="Add personal notes or insight rationale..."
                        className="w-full bg-[#090A0F] border border-border/50 rounded-lg p-3 text-xs text-slate-300 min-h-[60px] focus:outline-none focus:border-blue-500/50 resize-none placeholder:text-slate-600"
                        value={savedNotes[prec.id] || ''}
                        onChange={(e) => setSavedNotes({...savedNotes, [prec.id]: e.target.value})}
                      />
                      <Button 
                        onClick={() => saveInsight(prec)}
                        disabled={savingId === prec.id}
                        variant="outline"
                        className="w-full h-8 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                      >
                        {savingId === prec.id ? (
                          "Saved to Dossier ✓"
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5 mr-2" />
                            Save Insight to Case Dossier
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {results.length === 0 && (
                  <div className="col-span-full py-20 text-center flex flex-col items-center">
                    <BookOpen className="w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-slate-400 text-sm">No precedents found for this query.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
