"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Mark from 'mark.js';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface DocMetadata {
  file_name: string;
  page: number;
  extracted_text: string;
  boundingBox?: number[];
  fileUrl: string; // The URL created via URL.createObjectURL
}

interface SplitScreenViewerProps {
  docA: DocMetadata | null;
  docB: DocMetadata | null;
  userRole?: string;
  isSensitiveData?: boolean;
  allSensitiveData?: any[];
}

const PdfPanel = ({ doc, title, setW, setH, w, h, userRole, allSensitiveData, isSensitiveData }: { 
  doc: DocMetadata | null, 
  title: string, 
  setW: React.Dispatch<React.SetStateAction<number>>, 
  setH: React.Dispatch<React.SetStateAction<number>>, 
  w: number, 
  h: number,
  userRole?: string,
  allSensitiveData?: any[],
  isSensitiveData?: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(400);
  const [currentPage, setCurrentPage] = useState<number>(doc?.page || 1);
  const [numPages, setNumPages] = useState<number>(1);

  // Sync state if doc changes
  useEffect(() => {
    if (doc?.page) setCurrentPage(doc.page);
  }, [doc]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      // padding 32px (p-4 * 2)
      setContainerWidth(entries[0].contentRect.width - 32);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (doc?.extracted_text && numPages > 0) {
      const timer = setTimeout(() => {
        if (!containerRef.current) return;
        
        // Clean up previous marks
        const instance = new Mark(containerRef.current);
        instance.unmark();

        // Highlight new text robustly across DOM nodes
        instance.mark(doc.extracted_text, {
          accuracy: "partially", // allows matching even with slight spaces/hyphenation differences
          className: "bg-red-500/40 text-red-500/0 animate-pulse target-highlight shadow-[0_0_15px_rgba(239,68,68,0.8)] border-b-2 border-red-500",
          separateWordSearch: false,
          acrossElements: true,
          done: (totalMarks) => {
            if (totalMarks > 0) {
              // Scroll to the first mark
              const target = containerRef.current?.querySelector('.target-highlight');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            } else {
              // Fallback: If exact sentence fails due to severe OCR mismatch, just search words
              instance.mark(doc.extracted_text, {
                accuracy: "partially",
                className: "bg-red-500/40 text-red-500/0 animate-pulse target-highlight shadow-[0_0_15px_rgba(239,68,68,0.8)] border-b-2 border-red-500",
                separateWordSearch: true,
                acrossElements: true,
                done: () => {
                  const target = containerRef.current?.querySelector('.target-highlight');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              });
            }
          }
        });

      }, 800); // Wait for react-pdf to finish rendering the TextLayer
      return () => clearTimeout(timer);
    }
  }, [doc?.extracted_text, numPages, currentPage]);

  if (!doc) {
    return (
      <Card className="flex flex-col items-center justify-center h-full bg-[#050505] border-0 rounded-none relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <p className="text-slate-600 font-mono text-xs uppercase tracking-widest z-10">Awaiting input for {title}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden border-0 rounded-none bg-[#090A0F]">
      <div className="bg-black p-3 flex justify-between items-center border-b border-white/5">
        <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">{title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/5 text-slate-400 border-white/10 font-mono">
            {numPages} Pages
          </Badge>
        </div>
      </div>
      <div className="p-3 border-b border-white/5 bg-slate-900/50 shrink-0">
        <p className="text-[10px] font-mono text-slate-500 line-clamp-2">&quot;...{doc.extracted_text}...&quot;</p>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto bg-[#050505] flex justify-center p-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={doc.fileUrl} // Re-animate when URL changes (e.g. from redacted to unredacted)
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative h-max shadow-2xl flex flex-col gap-4"
          >
            <Document 
              file={doc.fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="relative">
                  <Page 
                    pageNumber={index + 1} 
                    width={containerWidth}
                    renderTextLayer={true} 
                    renderAnnotationLayer={false}
                    onLoadSuccess={(page) => {
                      if (index === 0) {
                        const viewport = page.getViewport({ scale: containerWidth / page.getViewport({ scale: 1.0 }).width });
                        if (Math.round(w) !== Math.round(viewport.width) || Math.round(h) !== Math.round(viewport.height)) {
                          setW(viewport.width);
                          setH(viewport.height);
                        }
                      }
                    }}
                  />
                </div>
              ))}
            </Document>
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
};

export function SplitScreenViewer({ docA, docB, userRole, isSensitiveData, allSensitiveData }: SplitScreenViewerProps) {
  const [docAWidth, setDocAWidth] = useState<number>(0);
  const [docBWidth, setDocBWidth] = useState<number>(0);
  const [docAHeight, setDocAHeight] = useState<number>(0);
  const [docBHeight, setDocBHeight] = useState<number>(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] h-full w-full bg-slate-800 relative">
      <div className="scanner-beam"></div>
      
      {/* Laser Line connection between panels when both documents have discrepancies */}
      {docA && docB && !isSensitiveData && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <motion.svg 
            className="w-full h-full absolute" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.line 
              x1="25%" y1="50%" x2="75%" y2="50%" 
              stroke="#ef4444" 
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <circle cx="25%" cy="50%" r="4" fill="#ef4444" className="animate-pulse" />
            <circle cx="75%" cy="50%" r="4" fill="#ef4444" className="animate-pulse" />
          </motion.svg>
        </div>
      )}

      <PdfPanel 
        doc={docA} 
        title="Document A" 
        setW={setDocAWidth} 
        setH={setDocAHeight} 
        w={docAWidth} 
        h={docAHeight} 
        userRole={userRole} 
        allSensitiveData={allSensitiveData} 
        isSensitiveData={isSensitiveData} 
      />
      <PdfPanel 
        doc={docB} 
        title="Document B" 
        setW={setDocBWidth} 
        setH={setDocBHeight} 
        w={docBWidth} 
        h={docBHeight} 
        userRole={userRole} 
        allSensitiveData={allSensitiveData} 
        isSensitiveData={isSensitiveData} 
      />
    </div>
  );
}
