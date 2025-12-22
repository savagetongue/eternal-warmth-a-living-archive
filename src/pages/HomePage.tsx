import React, { useState, useEffect, useMemo } from 'react';
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
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  return (
    <div className="min-h-screen bg-transparent relative selection:bg-peach/30 overflow-x-hidden">
      <ThemeToggle />
      <Toaster richColors position="top-center" />
      {/* Interactive Background Layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[10%] left-[5%] w-[30vw] h-[30vw] bg-peach/10 rounded-full blur-[100px] animate-breathe" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute top-[40%] right-[-5%] w-[40vw] h-[40vw] bg-mist/10 rounded-full blur-[120px] animate-breathe" 
          transition={{ delay: 1 }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.03] mix-blend-multiply pointer-events-none" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-20 md:py-32 flex flex-col items-center">
          {/* Prologue Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center space-y-12 mb-32"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 backdrop-blur-md border border-peach/20 shadow-sm text-peach font-medium text-xs tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Living Archive
            </div>
            <div className="space-y-4">
              <h1 className="text-[14vw] md:text-[10rem] font-serif font-bold text-foreground tracking-tighter leading-none drop-shadow-sm select-none break-keep">
                02<span className="text-peach opacity-80">.</span>09<span className="text-peach opacity-80">.</span>23
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-peach/40" />
                <Feather className="w-5 h-5 text-peach/40" />
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-peach/40" />
              </div>
            </div>
            <p className="text-lg md:text-2xl font-serif italic text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed px-4">
              "A sanctuary where time stands still, capturing the infinite beauty of our shared journey."
            </p>
            <TimeKeeper />
          </motion.div>
          {/* Organic Journal Section */}
          <div className="w-full space-y-16">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-peach/10 pb-8 gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h2 className="text-3xl font-serif font-semibold text-foreground flex items-center justify-center md:justify-start gap-3">
                  <Heart className="w-6 h-6 text-peach fill-peach/30" />
                  The Journal of Days
                </h2>
                <p className="text-sm text-muted-foreground italic font-serif">Handwritten echoes of us</p>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-warm-cream/50 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold border border-peach/5">
                {memories.length} Moments Preserved
              </div>
            </div>
            <div className="flex flex-col space-y-24 items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="w-full max-w-2xl h-80 bg-warm-cream/20 animate-pulse rounded-[2.5rem] border border-peach/5" />
                  ))
                ) : memories.length > 0 ? (
                  memories.map((memory, index) => (
                    <div 
                      key={memory.id} 
                      className={cn(
                        "w-full flex",
                        index % 3 === 0 ? "justify-center" : 
                        index % 3 === 1 ? "justify-start md:pl-12" : "justify-end md:pr-12"
                      )}
                    >
                      <div className={cn(
                        "w-full",
                        index % 3 === 0 ? "max-w-3xl" : "max-w-2xl"
                      )}>
                        <MemoryCard
                          memory={memory}
                          index={index}
                          onEdit={handleEdit}
                          onDelete={fetchMemories}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-3xl text-center py-40 bg-white/20 backdrop-blur-sm rounded-[4rem] border-2 border-dashed border-peach/20 flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="p-4 rounded-full bg-peach/5">
                      <Feather className="w-12 h-12 text-peach/30" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-serif text-2xl italic text-muted-foreground">The first page awaits its first word...</p>
                      <p className="text-sm text-muted-foreground/60">Begin our digital tapestry of memories.</p>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-full px-8 py-6 border-peach/30 text-peach hover:bg-peach hover:text-white transition-all duration-300"
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
        <footer className="py-32 text-center space-y-6">
          <div className="flex justify-center gap-6 opacity-30">
             <Heart className="w-5 h-5 fill-peach" />
             <Heart className="w-5 h-5 fill-peach" />
             <Heart className="w-5 h-5 fill-peach" />
          </div>
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground font-serif italic">
              Bound by time, freed by memory.
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-peach/40 font-bold">Eternal Warmth Archive</p>
          </div>
        </footer>
      </div>
      <Button
        onClick={handleNew}
        className="fixed bottom-10 right-10 rounded-full w-16 h-16 shadow-[0_20px_50px_rgba(255,154,158,0.3)] bg-peach hover:bg-peach-dark text-white border-none transition-all duration-500 hover:scale-110 active:scale-90 z-50 group"
        size="icon"
      >
        <Plus className="w-8 h-8 transition-transform duration-500 group-hover:rotate-180" />
      </Button>
      <ComposeModal
        initialData={editingMemory}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchMemories}
      />
    </div>
  );
}