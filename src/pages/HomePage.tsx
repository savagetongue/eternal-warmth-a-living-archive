import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { TimeKeeper } from '@/components/TimeKeeper';
import { MemoryCard } from '@/components/MemoryCard';
import { ComposeModal } from '@/components/ComposeModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Sparkles, Heart, Plus, Feather, ChevronDown, BookOpen, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MemoryEntry } from '@shared/types';
import { cn } from '@/lib/utils';
const CACHE_KEY = "eternal_archive_memories_v1";
export function HomePage() {
  const [memories, setMemories] = useState<MemoryEntry[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInitialSyncDone = useRef(false);
  const updateLocalCache = (data: MemoryEntry[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        console.warn("Local storage full, caching skipped.");
      } else {
        console.error("Cache sync failed", err);
      }
    }
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
      console.error("Failed to fetch memories", err);
      if (!silent) toast.error("Could not sync with the eternal archive.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!isInitialSyncDone.current) {
      fetchMemories(memories.length > 0);
      isInitialSyncDone.current = true;
    }
  }, [fetchMemories, memories.length]);
  const handleDeleteMemory = async (id: string) => {
    const previousMemories = [...memories];
    const filteredMemories = memories.filter(m => m.id !== id);
    setMemories(filteredMemories);
    updateLocalCache(filteredMemories);
    try {
      const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Memory returned to the stars.");
    } catch (err) {
      setMemories(previousMemories);
      updateLocalCache(previousMemories);
      toast.error("The archive resisted the change.");
    }
  };
  const handleEdit = (memory: MemoryEntry) => {
    setEditingMemory(memory);
    setIsModalOpen(true);
  };
  const handleNew = () => {
    setEditingMemory(null);
    setIsModalOpen(true);
  };
  const handleSuccess = async () => {
    await fetchMemories(true);
  };
  const handleClearArchive = async () => {
    if (!window.confirm("Are you certain? This will dissolve all memories in our eternal archive forever.")) return;
    try {
      const res = await fetch('/api/memories/clear', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setMemories([]);
        updateLocalCache([]);
        toast.success("The archive is now a pure canvas.");
      }
    } catch (err) {
      toast.error("The archive could not be reached.");
    }
  };
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -800]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  return (
    <div className="min-h-screen bg-transparent relative selection:bg-peach/30 overflow-x-hidden transition-colors duration-1000">
      <ThemeToggle className="fixed top-6 right-6 lg:top-8 lg:right-10 z-50 shadow-sm" />
      <Toaster richColors position="bottom-right" closeButton />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div style={{ y: y1 }} className="absolute top-[-10%] left-[-5%] w-[80vw] h-[80vw] bg-peach/10 rounded-full blur-[140px] animate-breathe" />
        <motion.div style={{ y: y2 }} className="absolute top-[20%] right-[-10%] w-[90vw] h-[90vw] bg-mist/10 rounded-full blur-[160px] animate-breathe" transition={{ delay: 2 }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.05] mix-blend-multiply pointer-events-none" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-20 md:py-32 flex flex-col items-center">
          <motion.div
            style={{ opacity: heroOpacity }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-16 mb-48 md:mb-64 lg:mb-80 w-full"
          >
            <div className="space-y-8">
              <h1 className="text-[12vw] md:text-[8rem] lg:text-[10rem] font-display font-black text-foreground tracking-[-0.05em] leading-none select-none">
                02<span className="text-peach">.</span>09<span className="text-peach">.</span>2023
              </h1>
              <div className="flex items-center justify-center gap-10">
                <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
                <Feather className="w-6 h-6 text-peach/30 animate-float" />
                <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
              </div>
            </div>
            <p className="text-lg md:text-2xl lg:text-3xl font-serif italic text-muted-foreground/60 max-w-4xl mx-auto leading-relaxed px-8 text-balance font-light">
              "A digital sanctuary where our story breathes and grows—a living archive of whispered promises."
            </p>
            <TimeKeeper />
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="mt-20 text-peach/40 flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.6em] font-bold select-none">Scroll into our archive</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
          <div className="w-full space-y-32 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-peach/10 pb-12 gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground flex items-center justify-center md:justify-start gap-4">
                  <Sparkles className="w-8 h-8 text-peach fill-peach/20" />
                  The Unfolding Tapestry
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground italic font-serif opacity-60">A chronological resonance of our shared light</p>
              </div>
              <div className="px-6 py-2 rounded-full bg-white/40 dark:bg-zinc-900/40 text-[11px] uppercase tracking-[0.4em] text-muted-foreground font-bold border border-peach/10 shadow-sm backdrop-blur-md select-none transition-all hover:border-peach/30">
                {memories.length} Threads Woven
              </div>
            </div>
            <div className="flex flex-col space-y-40 md:space-y-64 items-center">
              <AnimatePresence mode="popLayout">
                {isLoading && memories.length === 0 ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center justify-center py-64 space-y-8">
                    <Loader2 className="w-12 h-12 text-peach animate-spin stroke-[1.5]" />
                    <p className="font-serif text-xl italic text-muted-foreground/40 tracking-wider">Opening the sanctuary...</p>
                  </motion.div>
                ) : memories.length > 0 ? (
                  memories.map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 100 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-120px" }}
                      transition={{ duration: 1.2, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className={cn("w-full flex", index % 2 === 0 ? "justify-start md:pl-12" : "justify-end md:pr-12")}
                    >
                      <div className="w-full max-w-3xl">
                        <MemoryCard
                          memory={memory}
                          index={index}
                          onEdit={handleEdit}
                          onDelete={() => handleDeleteMemory(memory.id)}
                        />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl text-center py-48 bg-white/10 dark:bg-zinc-900/5 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-peach/20 flex flex-col items-center justify-center space-y-12 shadow-xl">
                    <div className="relative">
                      <div className="absolute inset-0 bg-peach/10 blur-[80px] rounded-full animate-breathe" />
                      <div className="p-10 rounded-full bg-peach/5 border border-peach/10 relative z-10 animate-float">
                        <BookOpen className="w-16 h-16 text-peach/40 stroke-[1]" />
                      </div>
                    </div>
                    <div className="space-y-4 relative z-10 px-8">
                      <p className="font-serif text-3xl md:text-5xl italic text-muted-foreground/60">Our first page is waiting...</p>
                    </div>
                    <Button variant="default" className="rounded-full px-12 py-8 bg-peach text-white hover:bg-peach-dark transition-all duration-700 font-serif text-xl shadow-lg group relative overflow-hidden animate-pulse" onClick={handleNew}>
                      <span className="relative z-10">Write the Genesis</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <footer className="py-32 text-center space-y-12">
          <div className="flex justify-center items-center gap-6 sm:gap-8 opacity-20">
             <Heart className="w-4 h-4 fill-peach animate-pulse" />
             <Heart className="w-4 h-4 fill-peach animate-pulse" style={{ animationDelay: '0.5s' }} />
             <Heart className="w-4 h-4 fill-peach animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="space-y-4 px-6">
            <p className="text-xl md:text-2xl text-muted-foreground/30 font-serif italic select-none">Each moment a thread, each thread a forever.</p>
            <div className="flex flex-col items-center gap-6">
              <p className="text-[10px] lg:text-[11px] uppercase tracking-[0.6em] text-peach/40 font-bold select-none">Eternal Warmth: A Living Archive</p>
              <Button variant="ghost" onClick={handleClearArchive} className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/15 hover:text-red-400/40 transition-all duration-500 font-black h-auto py-2">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset Sanctuary
              </Button>
            </div>
          </div>
        </footer>
      </div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }} className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-40">
        <Button onClick={handleNew} className={cn("rounded-full w-16 h-16 md:w-20 md:h-20 shadow-2xl bg-peach/90 backdrop-blur-xl hover:bg-peach text-white border-none transition-all duration-500 hover:scale-105 active:scale-95 group", memories.length === 0 && "animate-pulse")} size="icon" aria-label="Add new memory">
          <Plus className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-700 group-hover:rotate-90 stroke-[1.5]" />
        </Button>
      </motion.div>
      <ComposeModal initialData={editingMemory} isOpen={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={handleSuccess} />
    </div>
  );
}