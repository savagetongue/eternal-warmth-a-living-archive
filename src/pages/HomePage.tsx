import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeKeeper } from '@/components/TimeKeeper';
import { MemoryCard } from '@/components/MemoryCard';
import { ComposeModal } from '@/components/ComposeModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { Sparkles, Heart } from 'lucide-react';
import type { MemoryEntry } from '@shared/types';
export function HomePage() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memories');
      const json = await res.json();
      if (json.success) {
        setMemories(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch memories", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchMemories();
  }, []);
  return (
    <div className="min-h-screen bg-transparent relative selection:bg-peach/30">
      <ThemeToggle />
      <Toaster richColors position="top-center" />
      {/* Decorative Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-peach/20 rounded-full blur-[120px] animate-breathe" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mist/20 rounded-full blur-[120px] animate-breathe" style={{ animationDelay: '2s' }} />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 md:py-32 flex flex-col items-center">
          {/* Prologue Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-peach/20 shadow-sm text-peach font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              Eternal Warmth
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-foreground tracking-tight">
              Anand <span className="text-peach">&</span> Sakshi
            </h1>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-peach/50 to-transparent mx-auto" />
            <p className="text-xl md:text-2xl font-serif italic text-muted-foreground/80 max-w-xl mx-auto text-pretty">
              "A living archive of moments, letters, and the beautiful infinity we call ours."
            </p>
            <TimeKeeper />
          </motion.div>
          {/* Journal Section */}
          <div className="w-full mt-24 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-peach fill-peach/20" />
                The Journal of Days
              </h2>
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {memories.length} Memories Saved
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="w-full h-48 bg-muted animate-pulse rounded-3xl" />
                  ))
                ) : memories.length > 0 ? (
                  memories.map((memory, index) => (
                    <MemoryCard 
                      key={memory.id} 
                      memory={memory} 
                      index={index} 
                    />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/30 backdrop-blur-sm rounded-3xl border border-dashed border-border">
                    <p className="font-serif italic text-muted-foreground">The first page awaits its first word...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <footer className="py-12 text-center text-sm text-muted-foreground font-serif italic">
          Bound by time, freed by memory.
        </footer>
      </div>
      <ComposeModal onSuccess={fetchMemories} />
    </div>
  );
}