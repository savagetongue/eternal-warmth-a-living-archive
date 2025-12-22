import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeKeeper } from '@/components/TimeKeeper';
import { MemoryCard } from '@/components/MemoryCard';
import { ComposeModal } from '@/components/ComposeModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { Sparkles, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MemoryEntry } from '@shared/types';
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
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-peach/20 shadow-sm text-peach font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              Eternal Warmth
            </div>
            <h1 className="text-6xl md:text-[10rem] font-serif font-bold text-foreground tracking-tighter leading-none drop-shadow-sm select-none">
              02<span className="text-peach">-</span>09<span className="text-peach">-</span>2023
            </h1>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-peach/50 to-transparent mx-auto" />
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
                {memories.length} Memories Preserved
              </div>
            </div>
            <div className="grid grid-cols-1 gap-12">
              <AnimatePresence mode="popLayout" initial={false}>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="w-full h-64 bg-muted/30 animate-pulse rounded-3xl" />
                  ))
                ) : memories.length > 0 ? (
                  memories.map((memory, index) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      index={index}
                      onEdit={handleEdit}
                    />
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 bg-white/30 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-peach/20"
                  >
                    <p className="font-serif text-xl italic text-muted-foreground">The first page awaits its first word...</p>
                    <Button 
                      variant="ghost" 
                      className="mt-4 text-peach hover:text-peach-dark"
                      onClick={handleNew}
                    >
                      Begin the archive
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <footer className="py-24 text-center space-y-4">
          <div className="flex justify-center gap-4 text-peach/30">
             <Heart className="w-4 h-4 fill-current" />
             <Heart className="w-4 h-4 fill-current" />
             <Heart className="w-4 h-4 fill-current" />
          </div>
          <p className="text-sm text-muted-foreground font-serif italic">
            Bound by time, freed by memory.
          </p>
        </footer>
      </div>
      <Button
        onClick={handleNew}
        className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-2xl bg-peach hover:bg-peach-dark text-white border-none transition-transform hover:scale-110 active:scale-95 z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
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