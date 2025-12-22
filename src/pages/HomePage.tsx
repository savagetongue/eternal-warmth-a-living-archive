import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { TimeKeeper } from '@/components/TimeKeeper';
import { MemoryCard } from '@/components/MemoryCard';
import { ComposeModal } from '@/components/ComposeModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { Sparkles, Heart, Plus, Feather, ChevronDown, BookOpen, Loader2 } from 'lucide-react';
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
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -800]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  return (
    <div className="min-h-screen bg-transparent relative selection:bg-peach/30 overflow-x-hidden">
      <ThemeToggle className="fixed top-6 right-6 lg:right-10 z-50" />
      <Toaster richColors position="bottom-right" closeButton />
      {/* Dynamic Environmental Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-[-10%] left-[-15%] w-[80vw] h-[80vw] bg-peach/10 rounded-full blur-[150px] animate-breathe"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-[40%] right-[-20%] w-[90vw] h-[90vw] bg-mist/10 rounded-full blur-[180px] animate-breathe"
          transition={{ delay: 1 }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.04] mix-blend-multiply pointer-events-none" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-24 md:py-36 flex flex-col items-center">
          {/* Hero Section */}
          <motion.div
            style={{ opacity: heroOpacity }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            className="text-center space-y-16 mb-40 md:mb-64 w-full"
          >
            <div className="space-y-8">
              <h1 className="text-[14vw] md:text-[10rem] lg:text-[11rem] font-serif font-black text-foreground tracking-[-0.05em] leading-[0.8] drop-shadow-sm select-none">
                02<span className="text-peach">-</span>09<span className="text-peach">-</span>2023
              </h1>
              <div className="flex items-center justify-center gap-10">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
                <Feather className="w-6 h-6 text-peach/40 animate-float" />
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
              </div>
            </div>
            <p className="text-2xl md:text-4xl font-serif italic text-muted-foreground/60 max-w-4xl mx-auto leading-relaxed px-8 text-balance">
              "A digital sanctuary where our story breathes and grows—a living archive of whispered promises and eternal echoes."
            </p>
            <TimeKeeper />
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mt-20 md:mt-32 text-peach/40 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] uppercase tracking-[0.5em] font-black select-none">Open the Journal</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
          {/* Feed Content */}
          <div className="w-full space-y-32 max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-peach/10 pb-12 gap-8">
              <div className="space-y-3 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground flex items-center justify-center md:justify-start gap-5">
                  <Sparkles className="w-8 h-8 text-peach fill-peach/20" />
                  The Unfolding Tapestry
                </h2>
                <p className="text-lg text-muted-foreground italic font-serif opacity-70">A chronological archive of our shared light</p>
              </div>
              <div className="px-6 py-2.5 rounded-full bg-white/40 dark:bg-zinc-900/40 text-[11px] uppercase tracking-[0.4em] text-muted-foreground font-black border border-peach/10 shadow-sm backdrop-blur-sm select-none">
                {memories.length} Chapters Written
              </div>
            </div>
            <div className="flex flex-col space-y-48 md:space-y-64 items-center">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center justify-center py-64 space-y-8"
                  >
                    <Loader2 className="w-12 h-12 text-peach animate-spin" />
                    <p className="font-serif text-2xl italic text-muted-foreground/60">Seeding eternal memories...</p>
                  </motion.div>
                ) : memories.length > 0 ? (
                  memories.map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 100 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1.2, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        "w-full flex",
                        index % 2 === 0 ? "justify-start md:pl-16 lg:pl-24" : "justify-end md:pr-16 lg:pr-24"
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
                    key="empty"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-4xl text-center py-64 bg-white/30 dark:bg-zinc-900/10 backdrop-blur-md rounded-[5rem] border-2 border-dashed border-peach/20 flex flex-col items-center justify-center space-y-12"
                  >
                    <div className="p-8 rounded-full bg-peach/5 border border-peach/10 animate-float">
                      <BookOpen className="w-16 h-16 text-peach/20" />
                    </div>
                    <div className="space-y-6">
                      <p className="font-serif text-4xl italic text-muted-foreground/80">Our first page is waiting...</p>
                      <p className="text-xs text-muted-foreground/40 tracking-[0.5em] uppercase font-black px-12 text-balance">Capture a moment with a letter, a photograph, or a shared melody</p>
                    </div>
                    <Button
                      variant="default"
                      className="rounded-full px-16 py-10 bg-peach text-white hover:bg-peach-dark transition-all duration-700 font-serif text-2xl shadow-xl hover:shadow-peach/30"
                      onClick={handleNew}
                    >
                      Write the First Chapter
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <footer className="py-48 text-center space-y-12">
          <div className="flex justify-center gap-10 opacity-20">
             <Heart className="w-4 h-4 fill-peach animate-pulse" />
             <Heart className="w-4 h-4 fill-peach animate-pulse" style={{ animationDelay: '0.4s' }} />
             <Heart className="w-4 h-4 fill-peach animate-pulse" style={{ animationDelay: '0.8s' }} />
          </div>
          <div className="space-y-4">
            <p className="text-2xl md:text-3xl text-muted-foreground/50 font-serif italic select-none">
              Each moment a thread, each thread a forever.
            </p>
            <p className="text-[11px] uppercase tracking-[0.6em] text-peach/30 font-black select-none">Eternal Warmth: A Living Archive</p>
          </div>
        </footer>
      </div>
      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-40"
      >
        <Button
          onClick={handleNew}
          className="rounded-full w-16 h-16 md:w-20 md:h-20 shadow-[0_20px_50px_rgba(255,154,158,0.4)] bg-peach/90 backdrop-blur-md hover:bg-peach text-white border-none transition-all duration-500 hover:scale-110 active:scale-95 group"
          size="icon"
          aria-label="Add new memory"
        >
          <Plus className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-1000 group-hover:rotate-[360deg]" />
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