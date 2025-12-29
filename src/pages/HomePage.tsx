import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { TimeKeeper } from '@/components/TimeKeeper';
import { MemoryCard } from '@/components/MemoryCard';
import { ComposeModal } from '@/components/ComposeModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Sparkles, Heart, Plus, ChevronDown, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MemoryEntry } from '@shared/types';
import { cn } from '@/lib/utils';
const CACHE_KEY = "eternal_archive_memories_v1";
export function HomePage() {
  const [memories, setMemories] = useState<MemoryEntry[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInitialSyncDone = useRef(false);
  const updateLocalCache = (data: MemoryEntry[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) { console.warn("Cache sync limited", err); }
  };
  const fetchMemories = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/memories');
      const json = await res.json();
      if (json.success) {
        setMemories(json.data);
        updateLocalCache(json.data);
      }
    } catch (err) {
      if (!silent) toast.error("Could not sync with the eternal archive.");
    } finally { setIsLoading(false); }
  }, []);
  useEffect(() => {
    if (!isInitialSyncDone.current) {
      fetchMemories(memories.length > 0);
      isInitialSyncDone.current = true;
    }
  }, [fetchMemories, memories.length]);
  const handleDeleteMemory = async (id: string) => {
    const previous = [...memories];
    const filtered = memories.filter(m => m.id !== id);
    setMemories(filtered);
    updateLocalCache(filtered);
    try {
      const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success("Memory returned to the stars.");
    } catch {
      setMemories(previous);
      updateLocalCache(previous);
      toast.error("The archive resisted change.");
    }
  };
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -600]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const timeKeeperOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 0.7, 0.95]);
  const timeKeeperScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.94]);
  const stickyBg = useTransform(scrollYProgress, [0.05, 0.15], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.6)"]);
  const stickyBorder = useTransform(scrollYProgress, [0.05, 0.15], ["rgba(255, 154, 158, 0)", "rgba(255, 154, 158, 0.15)"]);
  return (
    <div className="min-h-screen bg-transparent relative selection:bg-peach/30 overflow-x-hidden transition-colors duration-1000">
      <ThemeToggle className="fixed top-6 right-6 lg:top-8 lg:right-10 z-[60] shadow-sm" />
      <Toaster richColors position="bottom-right" closeButton />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div style={{ y: y1 }} className="absolute top-[-5%] left-[-10%] w-[100vw] h-[100vw] bg-peach/5 rounded-full blur-[140px] animate-breathe" />
        <motion.div style={{ y: y2 }} className="absolute top-[15%] right-[-15%] w-[110vw] h-[110vw] bg-mist/5 rounded-full blur-[160px] animate-breathe" transition={{ delay: 1 }} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center">
          <motion.div style={{ opacity: heroOpacity }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }} className="text-center space-y-12 pt-24 md:pt-40 mb-12 w-full">
            <h1 className="text-[14vw] md:text-[9rem] lg:text-[11rem] font-display font-black text-foreground tracking-[-0.05em] leading-none select-none">
              02<span className="text-peach">.</span>09<span className="text-peach">.</span>2023
            </h1>
            <p className="text-lg md:text-2xl lg:text-3xl font-serif italic text-muted-foreground/60 max-w-4xl mx-auto leading-relaxed px-8 text-balance font-light">
              "A digital sanctuary where our story breathes and grows."
            </p>
          </motion.div>
          <motion.div
            style={{ opacity: timeKeeperOpacity, scale: timeKeeperScale, backgroundColor: stickyBg, borderColor: stickyBorder }}
            className="sticky top-0 z-50 w-full py-3 pointer-events-none backdrop-blur-xl border-b transition-all duration-700 rounded-b-[2.5rem]"
          >
            <div className="pointer-events-auto"><TimeKeeper /></div>
          </motion.div>
          <motion.div style={{ opacity: heroOpacity }} animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="mt-12 mb-40 text-peach/40 flex flex-col items-center gap-3">
            <span className="text-[9px] uppercase tracking-[0.8em] font-bold select-none">Explore our Archive</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
          <div className="w-full space-y-32 max-w-5xl relative z-10 pb-48 pt-12">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-peach/10 pb-16 gap-10">
              <div className="space-y-3 text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground flex items-center justify-center md:justify-start gap-4">
                  <Sparkles className="w-10 h-10 text-peach fill-peach/20" />
                  The Unfolding Tapestry
                </h2>
                <p className="text-lg lg:text-xl text-muted-foreground italic font-serif opacity-60">A chronological resonance of our shared light</p>
              </div>
              <div className="px-8 py-3 rounded-full bg-white/40 dark:bg-zinc-900/40 text-[11px] uppercase tracking-[0.5em] text-muted-foreground font-bold border border-peach/10 shadow-sm backdrop-blur-xl transition-all hover:border-peach/40 select-none">
                {memories.length} Threads Woven
              </div>
            </div>
            <div className="flex flex-col space-y-40 md:space-y-64 items-center">
              <AnimatePresence mode="popLayout">
                {isLoading && memories.length === 0 ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center justify-center py-64 space-y-8">
                    <Loader2 className="w-16 h-16 text-peach animate-spin stroke-[1.2]" />
                    <p className="font-serif text-2xl italic text-muted-foreground/30 tracking-widest">Opening the sanctuary...</p>
                  </motion.div>
                ) : memories.length > 0 ? (
                  memories.map((memory, index) => (
                    <div key={memory.id} className={cn("w-full flex", index % 2 === 0 ? "justify-start md:pl-12" : "justify-end md:pr-12")}>
                      <div className="w-full max-w-3xl">
                        <MemoryCard memory={memory} index={index} onEdit={(m) => { setEditingMemory(m); setIsModalOpen(true); }} onDelete={() => handleDeleteMemory(memory.id)} />
                      </div>
                    </div>
                  ))
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl text-center py-56 bg-white/5 dark:bg-zinc-900/5 backdrop-blur-2xl rounded-[5rem] border-2 border-dashed border-peach/20 flex flex-col items-center justify-center space-y-16 shadow-2xl">
                    <div className="relative p-12 rounded-full bg-peach/5 border border-peach/10 animate-float"><BookOpen className="w-20 h-20 text-peach/40 stroke-[0.8]" /></div>
                    <p className="font-serif text-4xl md:text-6xl italic text-muted-foreground/50">Our first page is waiting...</p>
                    <Button className="rounded-full px-16 py-10 bg-peach text-white hover:bg-peach-dark transition-all duration-700 font-serif text-2xl shadow-2xl animate-pulse active:scale-95" onClick={() => { setEditingMemory(null); setIsModalOpen(true); }}>
                      Write the Genesis
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <footer className="py-48 text-center space-y-16">
          <div className="flex justify-center items-center gap-10 opacity-30">
             {[0, 0.5, 1].map((delay) => <Heart key={delay} className="w-5 h-5 fill-peach animate-pulse" style={{ animationDelay: `${delay}s` }} />)}
          </div>
          <div className="space-y-6">
            <p className="text-2xl md:text-3xl text-muted-foreground/30 font-serif italic select-none leading-relaxed">Each moment a thread, each thread a forever.</p>
            <div className="flex flex-col items-center gap-8">
              <p className="text-[11px] uppercase tracking-[0.8em] text-peach/40 font-bold select-none">Eternal Warmth: A Living Archive</p>
            </div>
          </div>
        </footer>
      </div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: "spring" }} className="fixed bottom-10 right-10 md:bottom-16 md:right-16 z-50">
        <Button onClick={() => { setEditingMemory(null); setIsModalOpen(true); }} className="rounded-full w-20 h-20 md:w-24 md:h-24 shadow-2xl bg-peach/90 backdrop-blur-2xl hover:bg-peach text-white border-none transition-all duration-500 hover:scale-110 active:scale-90 group" size="icon">
          <Plus className="w-10 h-10 md:w-12 md:h-12 transition-transform duration-700 group-hover:rotate-90 stroke-[1.2]" />
        </Button>
      </motion.div>
      <ComposeModal initialData={editingMemory} isOpen={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={() => fetchMemories(true)} />
    </div>
  );
}