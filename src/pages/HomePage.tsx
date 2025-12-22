import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { TimeKeeper } from '@/components/TimeKeeper';
import { MemoryCard } from '@/components/MemoryCard';
import { ComposeModal } from '@/components/ComposeModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { Sparkles, Heart, Plus, Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MemoryEntry } from '@shared/types';
import { cn } from '@/lib/utils';
export function HomePage() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const handleEdit = (memory: MemoryEntry) => {
    setEditingMemory(memory);
    setIsModalOpen(true);
  };
  const handleNew = () => {
    setEditingMemory(null);
    setIsModalOpen(true);
  };
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  return (
    <div className="min-h-screen bg-transparent relative selection:bg-peach/30 overflow-x-hidden">
      <ThemeToggle />
      <Toaster richColors position="top-center" closeButton />
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-[5%] left-[-10%] w-[50vw] h-[50vw] bg-peach/10 rounded-full blur-[120px] animate-breathe"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-[50%] right-[-15%] w-[60vw] h-[60vw] bg-mist/10 rounded-full blur-[150px] animate-breathe"
          transition={{ delay: 1 }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.02] mix-blend-multiply pointer-events-none" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-20 md:py-32 flex flex-col items-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-12 mb-20 md:mb-32"
          >
            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/60 backdrop-blur-xl border border-peach/20 shadow-sm text-peach font-bold text-[10px] tracking-[0.3em] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Living Archive
            </div>
            <div className="space-y-6">
              <h1 className="text-[16vw] md:text-[11rem] font-serif font-black text-foreground tracking-tighter leading-[0.85] drop-shadow-sm select-none">
                02<span className="text-peach/60 italic">.</span>09<span className="text-peach/60 italic">.</span>23
              </h1>
              <div className="flex items-center justify-center gap-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
                <Feather className="w-5 h-5 text-peach/30" />
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
              </div>
            </div>
            <p className="text-xl md:text-3xl font-serif italic text-muted-foreground/60 max-w-3xl mx-auto leading-relaxed px-6 text-balance">
              "A sanctuary where time stands still, capturing the infinite beauty of our shared journey."
            </p>
            <TimeKeeper />
          </motion.div>
          {/* Feed Section */}
          <div className="w-full space-y-20 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-peach/10 pb-10 gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-4xl font-serif font-bold text-foreground flex items-center justify-center md:justify-start gap-4">
                  <Heart className="w-7 h-7 text-peach fill-peach/20" />
                  Journal of Days
                </h2>
                <p className="text-base text-muted-foreground italic font-serif opacity-70">Handwritten echoes of us</p>
              </div>
              <div className="px-5 py-2 rounded-full bg-white/40 text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black border border-peach/10 shadow-sm">
                {memories.length} Moments Preserved
              </div>
            </div>
            <div className="flex flex-col space-y-32 items-center">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="w-full max-w-2xl h-96 bg-white/10 animate-pulse rounded-[3rem] border border-peach/5" />
                  ))
                ) : memories.length > 0 ? (
                  memories.map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: index % 3 * 0.1 }}
                      className={cn(
                        "w-full flex",
                        index % 2 === 0 ? "justify-start md:pl-12" : "justify-end md:pr-12"
                      )}
                    >
                      <div className="w-full max-w-2xl">
                        <MemoryCard
                          memory={memory}
                          index={index}
                          onEdit={handleEdit}
                          onDelete={fetchMemories}
                        />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-3xl text-center py-48 bg-white/30 backdrop-blur-md rounded-[4rem] border-2 border-dashed border-peach/20 flex flex-col items-center justify-center space-y-8"
                  >
                    <div className="p-6 rounded-full bg-peach/5 border border-peach/10">
                      <Feather className="w-14 h-14 text-peach/20" />
                    </div>
                    <div className="space-y-3">
                      <p className="font-serif text-3xl italic text-muted-foreground">The first page awaits...</p>
                      <p className="text-sm text-muted-foreground/50 tracking-widest uppercase font-bold">Begin our digital tapestry</p>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-full px-12 py-8 border-peach/30 text-peach hover:bg-peach hover:text-white transition-all duration-500 font-serif text-xl shadow-lg"
                      onClick={handleNew}
                    >
                      Write the Opening Note
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <footer className="py-40 text-center space-y-10">
          <div className="flex justify-center gap-8 opacity-20">
             <Heart className="w-4 h-4 fill-peach" />
             <Heart className="w-4 h-4 fill-peach" />
             <Heart className="w-4 h-4 fill-peach" />
          </div>
          <div className="space-y-3">
            <p className="text-2xl text-muted-foreground/60 font-serif italic">
              Bound by time, freed by memory.
            </p>
            <p className="text-[10px] uppercase tracking-[0.5em] text-peach/30 font-black">Eternal Warmth Archive</p>
          </div>
        </footer>
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-10 right-10 z-[60]"
      >
        <Button
          onClick={handleNew}
          className="rounded-full w-16 h-16 shadow-[0_20px_50px_rgba(255,154,158,0.4)] bg-peach hover:bg-peach-dark text-white border-none transition-all duration-500 hover:scale-110 active:scale-90 group"
          size="icon"
        >
          <Plus className="w-8 h-8 transition-transform duration-700 group-hover:rotate-180" />
        </Button>
      </motion.div>
      <ComposeModal
        initialData={editingMemory}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchMemories}
      />
    </div>
  );
}