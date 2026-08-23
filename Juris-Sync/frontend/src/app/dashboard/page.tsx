"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle, CheckCircle2, File as FileIcon, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import TimelineAnalysis from '@/components/TimelineAnalysis';
import LegalSearchHub from '@/components/LegalSearchHub';

const SplitScreenViewer = dynamic(() => import('@/components/SplitScreenViewer').then(mod => mod.SplitScreenViewer), { ssr: false });

import { CommandStrip } from '@/components/CommandStrip';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

const MagneticWrapper = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = e.currentTarget.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.2); // Adjust the multiplier for stronger/weaker effect
    y.set(middleY * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: smoothX, y: smoothY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};
export interface DocInfo {
  file_name: string;
  page: number;
  extracted_text: string;
  bounding_box: number[];
}

export interface Contradiction {
  id: string;
  category: string;
  type?: 'factual_mismatch' | 'logical_fallacy';
  severity: string;
  confidence_score: number;
  description: string;
  status?: string;
  legal_rationale: string;
  doc_a: { file_name: string; page: number; extracted_text: string; bounding_box: number[] };
  doc_b: { file_name: string; page: number; extracted_text: string; bounding_box: number[] };
  inference_log?: {
    timestamp: string;
    model: string;
    routing: string;
    latency_ms: number;
    reasoning_steps: string[];
  };
}

export interface SensitiveData {
  id: string;
  data_type: string;
  extracted_text: string;
  file_name: string;
  page: number;
  bounding_box: number[];
}

export default function Dashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // For Dynamic UX
  const [results, setResults] = useState<Contradiction[]>([]);
  const [sensitiveData, setSensitiveData] = useState<SensitiveData[]>([]);
  const [selectedContradiction, setSelectedContradiction] = useState<Contradiction | null>(null);
  const [selectedSensitiveData, setSelectedSensitiveData] = useState<SensitiveData | null>(null);
  const [userRole, setUserRole] = useState<'AUTHORIZED' | 'PUBLIC'>('AUTHORIZED');
  const [searchHubOpen, setSearchHubOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showInferenceLog, setShowInferenceLog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Hydration-safe cryptographic export values
  const [exportHash, setExportHash] = useState<string>('');
  const [exportTime, setExportTime] = useState<string>('');

  useEffect(() => {
    setExportHash(Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''));
    setExportTime(new Date().toISOString());
  }, []);

  const [processedFiles, setProcessedFiles] = useState<any[]>([]);

  const loadingSteps = [
    "1. Semantic Ingestion...",
    "2. Agent 1: Temporal Logic Scanner...",
    "3. Agent 2: Geographic Verifier...",
    "4. Agent 3: DPDP Compliance... Complete"
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusUpdate = (id: string, newStatus: string, msg: string) => {
    setResults(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    triggerToast(msg);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    const urls: Record<string, string> = {};
    acceptedFiles.forEach(f => {
      urls[f.name] = URL.createObjectURL(f);
    });
    setFileUrls(prev => ({ ...prev, ...urls }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setLoadingStep(0);
    
    // Simulate dynamic loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 800);

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const response = await fetch('http://localhost:8000/api/analyze-bundle', {
        method: 'POST',
        headers: {
          'X-User-Role': userRole
        },
        body: formData,
      });
      const data = await response.json();
      setResults(data.contradictions || []);
      setSensitiveData(data.sensitive_data || []);
      setProcessedFiles(data.processed_files || []);
    } catch (error) {
      console.error("Error analyzing bundle", error);
      alert("Error analyzing bundle");
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setLoadingStep(0);
    }
  };

  const getDocWithUrl = (docMeta: any) => {
    if (!docMeta) return null;
    
    const pFile = processedFiles.find(f => f.file_name === docMeta.file_name);
    let finalUrl = fileUrls[docMeta.file_name];
    
    if (pFile) {
      finalUrl = userRole === 'PUBLIC' ? pFile.redacted_url : pFile.unredacted_url;
    }
    
    return {
      ...docMeta,
      fileUrl: finalUrl
    };
  };

  const handleExport = () => {
    if (!selectedContradiction) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedContradiction, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `audit_dossier_${selectedContradiction.id}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedContradiction) return;
    try {
      const response = await fetch('http://localhost:8000/api/update-contradiction-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        },
        body: JSON.stringify({
          contradiction_id: selectedContradiction.id,
          status: status
        })
      });
      if (response.ok) {
        // Update local state
        setResults(prev => prev.map(c => c.id === selectedContradiction.id ? { ...c, status } : c));
        setSelectedContradiction(prev => prev ? { ...prev, status } : null);
        triggerToast(`Digital Signature Appended: Marked as ${status}`);
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating status");
    }
  };

  return (
    <>
    <div className="print:hidden flex flex-col h-screen w-full bg-[#050505] text-white overflow-hidden font-sans">
      


      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-900/90 border border-emerald-500 text-emerald-100 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-3 backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-mono text-sm tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandStrip userRole={userRole} setUserRole={setUserRole} />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Inference Log Terminal Slider */}
        <AnimatePresence>
          {showInferenceLog && selectedContradiction?.inference_log && (
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="absolute top-0 left-[380px] right-80 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            >
              <div className="p-4 flex flex-col gap-2 font-mono text-xs max-h-64 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center text-slate-500 mb-2 border-b border-white/5 pb-2">
                  <span>TERMINAL // GROQ_LPU_V3 // TRACE_LOG</span>
                  <button onClick={() => setShowInferenceLog(false)} className="hover:text-white">Close [X]</button>
                </div>
                <div className="flex gap-4 text-cyan-400/70 mb-2">
                  <span>TIMESTAMP: {selectedContradiction.inference_log.timestamp}</span>
                  <span>MODEL: {selectedContradiction.inference_log.model}</span>
                  <span>LATENCY: {selectedContradiction.inference_log.latency_ms}ms</span>
                </div>
                {selectedContradiction.inference_log.reasoning_steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-emerald-500 opacity-50">[{idx.toString().padStart(2, '0')}]</span>
                    <span className="text-emerald-400">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Sidebar - Queue */}
        <div className="w-[380px] flex-shrink-0 border-r border-border bg-[#0B0D14] flex flex-col p-4 shadow-[1px_0_15px_rgba(0,0,0,0.5)] z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2 text-slate-100">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              JurisSync
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Forensic Legal Intelligence</p>
          </div>

          <div className="space-y-2 mt-4">
          
          <div 
            {...getRootProps()} 
            className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-blue-500/50 bg-[#090A0F]'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-6 w-6 text-slate-500 mb-2" />
            <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Ingest Documents</p>
            <p className="text-[9px] text-slate-600 mt-1">Drop PDFs to initialize semantic ingestion</p>
          </div>
          
          {files.length > 0 && (
            <div className="mt-2 bg-[#090A0F] p-3 rounded-lg border border-slate-800 shadow-inner">
              <div className="text-[10px] uppercase tracking-wider font-semibold mb-2 flex justify-between items-center">
                <span className="text-blue-500">Active Buffer</span>
                <Badge variant="secondary" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">{files.length} Files</Badge>
              </div>
              <div className="h-24 rounded bg-black/50 p-2 overflow-y-auto custom-scrollbar">
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center text-[11px] py-1.5 border-b border-slate-800/50 last:border-0 font-mono text-slate-300">
                    <FileIcon className="h-3 w-3 mr-2 text-blue-500/70" />
                    <span className="truncate flex-1">{f.name}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-3 glowing-btn h-10 relative overflow-hidden text-[11px] uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white border-0 font-bold" onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="radar-loader" style={{ transform: "scale(0.25)", transformOrigin: "center" }}></div>
                    <span className="font-mono text-cyan-200 animate-pulse">{loadingSteps[loadingStep]}</span>
                  </div>
                ) : "Execute Forensic Scan"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden pt-4 border-t border-slate-800 mt-4">
          <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-3">Forensic Triage Queue</h3>
          <div className="flex-1 overflow-y-auto overflow-x-hidden -mx-4 px-4 pb-12" style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}>
            <div className="grid grid-cols-2 gap-3 pb-4">
              {results.length === 0 && sensitiveData.length === 0 && (
                <div className="col-span-2 text-center text-xs text-muted-foreground py-8">No entities detected in buffer.</div>
              )}
              
              {results.map((c, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={c.id} 
                  onClick={() => { setSelectedContradiction(c); setSelectedSensitiveData(null); }}
                  className={`group relative p-3 rounded-lg border text-sm cursor-pointer transition-all duration-300 overflow-hidden ${
                    selectedContradiction?.id === c.id 
                      ? c.type === 'logical_fallacy' 
                        ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'bg-black/40 hover:bg-black/60 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* Glowing Border Hover Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent transform -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  </div>

                  <div className="flex flex-col justify-between h-full relative z-10">
                    <div>
                      <Badge variant="outline" className={`text-[9px] uppercase tracking-widest mb-2 w-fit ${
                        c.type === 'logical_fallacy' 
                          ? 'text-purple-400 border-purple-500/30 bg-purple-500/10'
                          : c.severity.includes('CRITICAL') 
                            ? 'text-red-400 border-red-500/30 bg-red-500/10' 
                            : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                      }`}>
                        {c.type === 'logical_fallacy' ? 'Logical Fallacy' : c.category}
                      </Badge>
                      <div className="text-[11px] font-medium leading-tight mb-2 text-white">
                        {c.description.length > 50 ? c.description.substring(0, 50) + '...' : c.description}
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="text-[20px] font-mono font-bold tracking-tighter text-slate-100 group/score cursor-help relative inline-block">
                        {(c.confidence_score * 100).toFixed(1)}<span className="text-[10px] text-slate-500 font-sans ml-1">% CONF</span>
                        
                        {/* Tooltip for explainability */}
                        {c.inference_log && (
                          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black border border-blue-500/30 text-[10px] text-blue-200 font-sans leading-tight rounded-md opacity-0 group-hover/score:opacity-100 transition-opacity pointer-events-none z-50">
                            <strong>AI Inference:</strong> {c.inference_log.reasoning_steps[c.inference_log.reasoning_steps.length - 1]}
                          </div>
                        )}
                      </div>
                      
                      {c.status && c.status !== 'PENDING' && (
                        <div className="mt-2">
                          <Badge variant="outline" className={`text-[9px] px-1 py-0 ${c.status === 'VERIFIED' ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' : c.status === 'DISMISSED' ? 'text-slate-500 border-slate-700' : 'text-blue-400 border-blue-500/50 bg-blue-500/10'}`}>
                            {c.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {sensitiveData.map((sd, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (results.length + i) * 0.1 }}
                  key={sd.id} 
                  onClick={() => { setSelectedSensitiveData(sd); setSelectedContradiction(null); }}
                  className={`group relative p-3 rounded-lg border text-sm cursor-pointer transition-all duration-300 overflow-hidden ${
                    selectedSensitiveData?.id === sd.id 
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                      : 'bg-black/40 hover:bg-black/60 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* Glowing Border Hover Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  </div>

                  <div className="flex flex-col justify-between h-full relative z-10">
                    <div>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-widest text-cyan-400 border-cyan-500/30 bg-cyan-500/10 mb-2 w-fit">
                        DPDP Data
                      </Badge>
                      <div className="text-[11px] font-medium leading-tight mb-2 text-slate-200">{sd.data_type}</div>
                    </div>
                    <div className="mt-auto">
                      <div className="text-[10px] text-cyan-400/70 font-mono bg-cyan-950/30 p-1.5 rounded border border-cyan-900/50 truncate">
                        {sd.extracted_text}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: PDF Viewer */}
      <div className="flex-1 bg-[#090A0F] border-r border-border relative flex flex-col h-full overflow-hidden">
        {isAnalyzing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-[scan_2s_ease-in-out_infinite]"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <FileIcon className="h-16 w-16 text-cyan-500/50 mb-4 animate-bounce" />
              <p className="text-xl font-mono text-cyan-400 animate-pulse font-bold">{loadingSteps[loadingStep]}</p>
              <p className="text-sm text-cyan-500/70 mt-2 font-mono">Enforcing DPDP Act Constraints</p>
            </div>
          </div>
        )}
        
        <SplitScreenViewer 
          docA={getDocWithUrl(selectedContradiction?.doc_a || selectedSensitiveData)} 
          docB={getDocWithUrl(selectedContradiction?.doc_b)}
          userRole={userRole}
          isSensitiveData={!!selectedSensitiveData}
          allSensitiveData={sensitiveData}
        />
      </div>

      {/* RIGHT COLUMN: Inspector (col-span-3) */}
      <div className="w-80 flex-shrink-0 bg-[#090A0F] p-4 flex flex-col gap-6 overflow-y-auto border-l border-slate-800 z-10">
        <h2 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2 font-mono">Forensic Audit Details</h2>

        {(selectedContradiction || selectedSensitiveData) ? (
          <>
            <Card className="bg-[#0B0D14] border-slate-800 shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="font-mono text-lg py-1 bg-black text-slate-200 border-slate-700 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                    {selectedContradiction ? (selectedContradiction.confidence_score * 100).toFixed(1) + '%' : '100%'}
                  </Badge>
                  {selectedContradiction?.inference_log && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowInferenceLog(!showInferenceLog)}
                      className="h-8 text-[9px] font-mono tracking-widest uppercase border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 bg-[#050505]"
                    >
                      {showInferenceLog ? "Hide Inference Log" : "View Inference Log"}
                    </Button>
                  )}
                </div>
                
                <div className="text-xl font-bold mt-2 leading-tight text-slate-100">
                  {selectedContradiction ? selectedContradiction.category : selectedSensitiveData?.data_type}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {selectedContradiction ? selectedContradiction.description : 'This document contains Sensitive Personal Data protected under the Indian DPDP Act.'}
                </p>
                
                {selectedContradiction && (
                  <div className="mt-4 p-3 bg-black/40 border border-slate-800 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-slate-500" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">Statutory / Legal Rationale</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                      {selectedContradiction.legal_rationale}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedContradiction && (
              <>
                <div className="h-[1px] w-full bg-slate-800" />

                <div>
                  <h3 className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-3 font-mono">Forensic Tools</h3>
                  <div className="flex flex-col gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      className="w-full bg-[#0B0D14] text-slate-300 border-slate-700 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400 transition-all justify-start text-[11px] h-9"
                      onClick={() => setShowTimeline(!showTimeline)}
                    >
                      <Clock className="w-3.5 h-3.5 mr-3 text-blue-500" /> 
                      {showTimeline ? "Hide Temporal Topology" : "Generate Temporal Topology"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full bg-[#0B0D14] text-slate-300 border-slate-700 hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-400 transition-all justify-start text-[11px] h-9"
                      onClick={() => setSearchHubOpen(true)}
                    >
                      <Search className="w-3.5 h-3.5 mr-3 text-purple-500" /> 
                      Execute Precedent Search
                    </Button>
                  </div>
                  
                  {showTimeline && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      <TimelineAnalysis contradictionId={selectedContradiction.id} userRole={userRole} />
                    </div>
                  )}
                </div>

                <div className="h-[1px] w-full bg-slate-800 mb-4" />
                
                <div>
                  <h3 className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-3 font-mono">Judicial Actions</h3>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <MagneticWrapper>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 bg-[#0B0D14] text-[11px] h-9 pointer-events-auto leading-tight px-2"
                        onClick={() => handleUpdateStatus('VERIFIED')}
                        disabled={selectedContradiction.status === 'VERIFIED' || userRole === 'PUBLIC'}
                      >
                        <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0" /> Approve as Conflict
                      </Button>
                    </MagneticWrapper>
                    <MagneticWrapper>
                      <Button 
                        variant="outline"
                        className="w-full text-slate-300 border-slate-600 hover:bg-slate-700/30 hover:border-slate-500 bg-[#0B0D14] text-[11px] h-9 pointer-events-auto leading-tight px-2"
                        onClick={() => handleUpdateStatus('DISMISSED')}
                        disabled={selectedContradiction.status === 'DISMISSED' || userRole === 'PUBLIC'}
                      >
                        Dismiss as Safe
                      </Button>
                    </MagneticWrapper>
                  </div>
                  <MagneticWrapper>
                    <Button 
                      variant="outline" 
                      className="w-full mb-4 text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50 bg-[#0B0D14] text-[11px] h-9 pointer-events-auto"
                      onClick={() => handleUpdateStatus('ESCALATED')}
                      disabled={userRole === 'PUBLIC'}
                    >
                      <AlertCircle className="w-3.5 h-3.5 mr-2" /> Escalate to Bench
                    </Button>
                  </MagneticWrapper>
                  
                  <MagneticWrapper>
                    <Button 
                      className="w-full bg-slate-100 hover:bg-white text-black font-bold h-10 text-[11px] tracking-widest uppercase pointer-events-auto"
                      onClick={() => window.print()}
                    >
                      <FileIcon className="w-3.5 h-3.5 mr-2" /> Export Audit Dossier
                    </Button>
                  </MagneticWrapper>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500/50">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-[11px] uppercase tracking-widest">Select an entity from the triage queue to inspect</p>
          </div>
        )}
      </div>
      {/* END RIGHT COLUMN */}
      </div>
    </div>

    {/* DEDICATED PRINT LAYOUT - Only visible during window.print() */}
    <div className="hidden print:block w-full min-h-screen bg-white text-black p-10 font-sans">
      <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">JURISSYNC</h1>
          <p className="text-sm font-mono tracking-widest uppercase text-gray-500">Forensic Audit Dossier</p>
        </div>
        <div className="text-right font-mono text-xs">
          <p>DATE: {new Date().toLocaleDateString()}</p>
          <p>CONFIDENTIALITY: HIGH</p>
        </div>
      </div>

      {(selectedContradiction || selectedSensitiveData) ? (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2 border-l-4 border-black">Executive Summary</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">ID</p>
                <p className="font-mono text-sm">{selectedContradiction ? selectedContradiction.id : selectedSensitiveData?.id}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</p>
                <p className="font-mono text-sm">{selectedContradiction ? selectedContradiction.category : selectedSensitiveData?.data_type}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Confidence Score</p>
                <p className="font-mono text-sm">{selectedContradiction ? (selectedContradiction.confidence_score * 100).toFixed(1) + '%' : '100%'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</p>
                <p className="font-mono text-sm font-bold">{selectedContradiction?.status || 'PENDING'}</p>
              </div>
            </div>
            
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 mt-6">Description</p>
            <p className="text-base leading-relaxed border p-4 rounded-md">
              {selectedContradiction ? selectedContradiction.description : 'This document contains Sensitive Personal Data protected under the Indian DPDP Act.'}
            </p>

            {selectedContradiction && (
              <>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 mt-6">Statutory / Legal Rationale</p>
                <p className="text-base leading-relaxed border p-4 rounded-md font-mono bg-gray-50">
                  {selectedContradiction.legal_rationale}
                </p>
              </>
            )}
          </div>

          <div style={{ pageBreakBefore: 'always' }}>
            <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2 border-l-4 border-black">Evidence Extraction: Document A</h2>
            <div className="border p-4 rounded-md mb-8">
              <p className="font-mono text-xs mb-2 text-gray-500">SOURCE: {(selectedContradiction?.doc_a || selectedSensitiveData)?.file_name}</p>
              <p className="font-mono text-xs mb-4 text-gray-500">PAGE: {(selectedContradiction?.doc_a || selectedSensitiveData)?.page}</p>
              <blockquote className="border-l-4 border-red-500 pl-4 italic text-lg">
                "{(selectedContradiction?.doc_a || selectedSensitiveData)?.extracted_text}"
              </blockquote>
            </div>
          </div>

          {selectedContradiction?.doc_b && (
            <div style={{ pageBreakBefore: 'always' }}>
              <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2 border-l-4 border-black">Evidence Extraction: Document B</h2>
              <div className="border p-4 rounded-md mb-8">
                <p className="font-mono text-xs mb-2 text-gray-500">SOURCE: {selectedContradiction.doc_b.file_name}</p>
                <p className="font-mono text-xs mb-4 text-gray-500">PAGE: {selectedContradiction.doc_b.page}</p>
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-lg">
                  "{selectedContradiction.doc_b.extracted_text}"
                </blockquote>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">No anomaly selected for export.</div>
      )}

      {/* Cryptographic Footer */}
      <div className="mt-16 text-center text-xs font-mono text-gray-400 border-t-2 border-gray-200 pt-6" style={{ pageBreakInside: 'avoid' }}>
        <div className="font-bold mb-2">CRYPTOGRAPHIC AUDIT TRAIL // JURISSYNC VERIFIED</div>
        <div>SHA-256 VERIFICATION HASH: <span className="text-black bg-gray-100 px-2 py-1 rounded">{exportHash}</span></div>
        <div className="mt-1">INFERENCE TIMESTAMP ID: <span className="text-black bg-gray-100 px-2 py-1 rounded">{exportTime}</span></div>
        <div className="mt-4 text-[10px] text-gray-300">Generated automatically via JurisSync LPU Inference Engine. Do not alter.</div>
      </div>
    </div>
    </>
  );
}
