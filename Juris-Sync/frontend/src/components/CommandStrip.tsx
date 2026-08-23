"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface CommandStripProps {
  userRole: 'AUTHORIZED' | 'PUBLIC';
  setUserRole: (role: 'AUTHORIZED' | 'PUBLIC') => void;
}

export function CommandStrip({ userRole, setUserRole }: CommandStripProps) {
  const [flashing, setFlashing] = useState(false);

  const toggleRole = () => {
    setFlashing(true);
    setUserRole(userRole === 'AUTHORIZED' ? 'PUBLIC' : 'AUTHORIZED');
    setTimeout(() => setFlashing(false), 500);
  };

  return (
    <>
      <AnimatePresence>
        {flashing && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed inset-0 z-50 pointer-events-none ${
              userRole === 'AUTHORIZED' ? 'bg-emerald-500/20' : 'bg-cyan-500/20'
            }`}
          />
        )}
      </AnimatePresence>

      <div className="h-14 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
            <span className="text-xs font-mono font-bold text-slate-200 tracking-widest uppercase">Live Inference</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="flex gap-4 font-mono text-[10px]">
            <div className="flex gap-1.5 items-center">
              <span className="text-slate-500">ENGINE:</span>
              <span className="text-blue-400 font-bold">GROQ_LPU_V3</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-slate-500">T/S:</span>
              <span className="text-emerald-400 font-bold">814.2</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            {userRole === 'AUTHORIZED' ? 'Judicial Clearance' : 'DPDP Act Redaction'}
          </span>
          <button
            onClick={toggleRole}
            className={`relative w-16 h-7 rounded-full p-1 transition-colors duration-300 border border-white/5 ${
              userRole === 'AUTHORIZED' ? 'bg-emerald-500/20' : 'bg-cyan-500/20'
            }`}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`w-5 h-5 rounded-full flex items-center justify-center shadow-lg ${
                userRole === 'AUTHORIZED' ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
              style={{
                x: userRole === 'AUTHORIZED' ? 34 : 0,
              }}
            >
              {userRole === 'AUTHORIZED' ? (
                <ShieldCheck className="w-3 h-3 text-black" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-black" />
              )}
            </motion.div>
          </button>
        </div>
      </div>
    </>
  );
}
