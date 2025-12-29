import React, { useState, useEffect, useCallback } from 'react';
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
  const updateLocalCache = (data: MemoryEntry[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Cache sync failed", err);
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
    // Initial silent sync on mount after hydration
    fetchMemories(memories.length > 0);
  }, [fetchMemories]);
  const handleDeleteMemory = async (id: string) => {
    // Optimistic Update
    const previousMemories = [...memories];
    const filteredMemories = memories.filter(m => m.id !== id);
    setMemories(filteredMemories);
    updateLocalCache(filteredMemories);
    try {
      const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Memory returned to the stars.");
    } catch (err) {
      // Rollback
      setMemories(previousMemories);
      updateLocalCache(previousMemories);
      toast.error("The archive resisted the change. Rollback initiated.");
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
    // High priority background sync
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
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -600]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -1200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  return (
    <div className="min-h-screen bg-transparent relative selection:bg-peach/30 overflow-x-hidden transition-colors duration-1000">
      <ThemeToggle className="fixed top-8 right-8 lg:right-12 z-50 shadow-sm" />
      <Toaster richColors position="bottom-right" closeButton />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div style={{ y: y1 }} className="absolute top-[-20%] left-[-10%] w-[100vw] h-[100vw] bg-peach/10 rounded-full blur-[180px] animate-breathe" />
        <motion.div style={{ y: y2 }} className="absolute top-[30%] right-[-15%] w-[110vw] h-[110vw] bg-mist/10 rounded-full blur-[200px] animate-breathe" transition={{ delay: 2 }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.05] mix-blend-multiply pointer-events-none" />
      </div>
      <div className="max-w-[120rem] mx-auto px-6 sm:px-12 lg:px-20 relative z-10">
        <div className="py-32 md:py-48 flex flex-col items-center">
          <motion.div
            style={{ opacity: heroOpacity }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-24 mb-64 md:mb-96 lg:mb-[32rem] w-full"
          >
            <div className="space-y-12">
              <h1 className="text-[15vw] md:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-display font-black text-foreground tracking-[-0.07em] leading-[0.75] select-none">
                02<span className="text-peach">.</span>09<span className="text-peach">.</span>2023
              </h1>
              <div className="flex items-center justify-center gap-16">
                <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-peach/40 to-transparent" />
                <Feather className="w-10 h-10 text-peach/30 animate-float" />
                <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-peach/40 to-transparent" />
              </div>
            </div>
            <p className="text-2xl md:text-5xl lg:text-6xl font-serif italic text-muted-foreground/50 max-w-6xl mx-auto leading-[1.3] px-12 text-balance font-light">
              "A digital sanctuary where our story breathes and grows—a living archive of whispered promises."
            </p>
            <TimeKeeper />
            <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="mt-32 md:mt-48 text-peach/50 flex flex-col items-center gap-4">
              <span className="text-[12px] uppercase tracking-[0.8em] font-black select-none">Into the Archive</span>
              <ChevronDown className="w-8 h-8 stroke-[1.5]" />
            </motion.div>
          </motion.div>
          <div className="w-full space-y-48 max-w-8xl">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-peach/15 pb-16 gap-12">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-5xl md:text-7xl font-serif font-bold text-foreground flex items-center justify-center md:justify-start gap-8">
                  <Sparkles className="w-12 h-12 text-peach fill-peach/30" />
                  The Unfolding Tapestry
                </h2>
                <p className="text-xl lg:text-2xl text-muted-foreground italic font-serif opacity-60">A chronological resonance of our shared light</p>
              </div>
              <div className="px-10 py-4 rounded-full bg-white/50 dark:bg-zinc-900/50 text-[13px] uppercase tracking-[0.5em] text-muted-foreground font-black border border-peach/20 shadow-lg backdrop-blur-md select-none transition-all hover:border-peach/40">
                {memories.length} Threads Woven
              </div>
            </div>
            <div className="flex flex-col space-y-64 md:space-y-[32rem] items-center">
              <AnimatePresence mode="popLayout">
                {isLoading && memories.length === 0 ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center justify-center py-96 space-y-12">
                    <Loader2 className="w-20 h-20 text-peach animate-spin stroke-[1.5]" />
                    <p className="font-serif text-3xl italic text-muted-foreground/40 tracking-wider">Opening the sanctuary...</p>
                  </motion.div>
                ) : memories.length > 0 ? (
                  memories.map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 150 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-150px" }}
                      transition={{ duration: 1.5, delay: (index % 3) * 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className={cn("w-full flex", index % 2 === 0 ? "justify-start md:pl-24 lg:pl-32" : "justify-end md:pr-24 lg:pr-32")}
                    >
                      <div className="w-full max-w-4xl">
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
                  <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-5xl text-center py-80 bg-white/20 dark:bg-zinc-900/10 backdrop-blur-xl rounded-[6rem] border-2 border-dashed border-peach/30 flex flex-col items-center justify-center space-y-16 shadow-2xl">
                    <div className="relative">
                      <div className="absolute inset-0 bg-peach/20 blur-[100px] rounded-full animate-breathe" />
                      <div className="p-14 rounded-full bg-peach/5 border border-peach/20 relative z-10 animate-float">
                        <BookOpen className="w-24 h-24 text-peach/50 stroke-[1]" />
                      </div>
                    </div>
                    <div className="space-y-8 relative z-10 px-12">
                      <p className="font-serif text-5xl md:text-7xl italic text-muted-foreground/70">Our first page is waiting...</p>
                    </div>
                    <Button variant="default" className="rounded-full px-24 py-12 bg-peach text-white hover:bg-peach-dark transition-all duration-1000 font-serif text-3xl shadow-[0_20px_50px_rgba(255,154,158,0.4)] group relative overflow-hidden" onClick={handleNew}>
                      <span className="relative z-10">Write the Genesis</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <footer className="py-64 text-center space-y-16">
          <div className="flex justify-center gap-14 opacity-30">
             <Heart className="w-6 h-6 fill-peach animate-pulse" />
             <Heart className="w-6 h-6 fill-peach animate-pulse" style={{ animationDelay: '0.5s' }} />
             <Heart className="w-6 h-6 fill-peach animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="space-y-6">
            <p className="text-3xl md:text-4xl text-muted-foreground/40 font-serif italic select-none">Each moment a thread, each thread a forever.</p>
            <div className="flex flex-col items-center gap-10">
              <p className="text-[12px] lg:text-[14px] uppercase tracking-[0.8em] text-peach/40 font-black select-none">Eternal Warmth: A Living Archive</p>
              <Button variant="ghost" onClick={handleClearArchive} className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/15 hover:text-red-400/50 transition-all duration-500 font-black">
                <Trash2 className="w-4 h-4 mr-3" /> Reset Digital Sanctuary
              </Button>
            </div>
          </div>
        </footer>
      </div>
      <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 25 }} className="fixed bottom-12 right-12 md:bottom-20 md:right-20 z-40">
        <Button onClick={handleNew} className={cn("rounded-full w-20 h-20 md:w-28 md:h-28 shadow-[0_25px_60px_rgba(255,154,158,0.5)] bg-peach/90 backdrop-blur-xl hover:bg-peach text-white border-none transition-all duration-700 hover:scale-110 active:scale-90 group ring-4 ring-white/10", memories.length === 0 && "animate-pulse ring-8 ring-peach/20")} size="icon" aria-label="Add new memory">
          <Plus className="w-10 h-10 md:w-14 md:h-14 transition-transform duration-1000 group-hover:rotate-[360deg] stroke-[1.5]" />
        </Button>
      </motion.div>
      <ComposeModal initialData={editingMemory} isOpen={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={handleSuccess} />
    </div>
  );
}