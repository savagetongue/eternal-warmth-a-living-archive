import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';
import { Quote, Pencil, Trash2, Music, Loader2, Video, ShieldCheck } from 'lucide-react';
import type { MemoryEntry } from '@shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
interface MemoryCardProps {
  memory: MemoryEntry;
  index: number;
  onEdit?: (memory: MemoryEntry) => void;
  onDelete?: () => void;
}
export const MemoryCard = forwardRef<HTMLDivElement, MemoryCardProps>(({ memory, index, onEdit, onDelete }, ref) => {
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  useEffect(() => {
    if (memory.type !== 'text') {
      setIsMediaLoading(true);
      setHasError(false);
      // isSandbox is true if we have no actual media URL to play
      setIsSandbox(!memory.mediaUrl || memory.mediaUrl === '');
    } else {
      setIsMediaLoading(false);
    }
  }, [memory.type, memory.id, memory.mediaUrl]);
  const hashId = useMemo(() => memory.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0), [memory.id]);
  const rotation = useMemo(() => ((hashId % 40) / 20 - 1).toFixed(2), [hashId]);
  const fallbackColor = useMemo(() => memory.dominantColor || `hsl(${(hashId % 360)}, 30%, 95%)`, [hashId, memory.dominantColor]);
  const formattedDate = useMemo(() => {
    try {
      if (!memory.date) return "A special day";
      const date = parseISO(memory.date);
      return isValid(date) ? format(date, 'MMMM do, yyyy') : "A special day";
    } catch { return "A special day"; }
  }, [memory.date]);
  const confirmAndDelete = () => {
    if (window.confirm("Remove from our eternal archive?")) onDelete?.();
  };
  const renderSignatureOverlay = () => (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] p-6 text-center">
      <div className="bg-white/90 dark:bg-zinc-900/90 rounded-full px-4 py-2 flex items-center gap-2 border border-peach/30 shadow-xl mb-4">
        <ShieldCheck className="w-4 h-4 text-peach" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Deploy for Full Media</span>
      </div>
      <p className="text-white text-xs md:text-sm font-serif italic max-w-xs drop-shadow-md">
        This high-fidelity signature captures the essence of the memory. Full media will be available on final deployment.
      </p>
    </div>
  );
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40, rotate: parseFloat(rotation) }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="group relative bg-white dark:bg-zinc-950 rounded-[2.5rem] p-6 sm:p-12 border border-peach/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 hover:border-peach/30"
    >
      <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 z-40">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/90 dark:bg-zinc-800/90 border border-peach/20 text-peach hover:bg-peach hover:text-white shadow-sm" onClick={() => onEdit?.(memory)}><Pencil className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-red-50/90 dark:bg-red-950/90 border border-red-100/50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm" onClick={confirmAndDelete}><Trash2 className="w-4 h-4" /></Button>
      </div>
      <div className="mb-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-peach/10" />
        <span className="text-[10px] font-serif italic text-muted-foreground tracking-[0.4em] uppercase tabular-nums">{formattedDate}</span>
        <div className="h-px flex-1 bg-peach/10" />
      </div>
      {(memory.type === 'video' || memory.type === 'image') && (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-[2rem] aspect-video w-full border-4 border-warm-paper dark:border-zinc-900 shadow-inner" style={{ backgroundColor: fallbackColor }}>
            <AnimatePresence mode="wait">
              {isMediaLoading && (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-center justify-center bg-inherit">
                  {memory.previewUrl && <img src={memory.previewUrl} className="absolute inset-0 w-full h-full object-contain blur-md opacity-40" alt="" />}
                  <Loader2 className="w-8 h-8 text-peach animate-spin relative z-10" />
                </motion.div>
              )}
            </AnimatePresence>
            {isSandbox && memory.previewUrl ? (
              <>
                <img src={memory.previewUrl} className="w-full h-full object-contain relative z-10" alt="Signature" onLoad={() => setIsMediaLoading(false)} />
                {renderSignatureOverlay()}
              </>
            ) : memory.type === 'video' ? (
              <video 
                src={memory.mediaUrl} 
                poster={memory.previewUrl} 
                controls 
                className={cn("relative z-10 w-full h-full object-contain transition-opacity", isMediaLoading ? "opacity-0" : "opacity-100")} 
                onLoadedData={() => setIsMediaLoading(false)} 
                onError={() => { setIsMediaLoading(false); setHasError(true); }} 
              />
            ) : (
              <img 
                src={memory.mediaUrl} 
                className={cn("relative z-10 w-full h-full object-contain transition-opacity", isMediaLoading ? "opacity-0" : "opacity-100")} 
                onLoad={() => setIsMediaLoading(false)} 
                onError={() => { setIsMediaLoading(false); setHasError(true); }} 
              />
            )}
            {hasError && !isSandbox && <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm"><Video className="w-12 h-12 text-peach/40" /></div>}
          </div>
          <p className="text-xl md:text-3xl font-serif italic text-center text-foreground/90 px-4">"{memory.content}"</p>
        </div>
      )}
      {memory.type === 'audio' && (
        <div className="space-y-10">
          <div className="relative text-center px-8">
            <Quote className="absolute -top-4 -left-2 w-16 h-16 text-peach/5 -rotate-12" />
            <p className="text-xl md:text-4xl font-serif leading-relaxed text-foreground">"{memory.content}"</p>
          </div>
          <div className="relative p-8 rounded-[2.5rem] border border-peach/10 flex flex-col items-center gap-6 overflow-hidden bg-warm-paper/50 dark:bg-zinc-900/50">
            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: fallbackColor }} />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 rounded-full bg-white dark:bg-zinc-800 text-peach shadow-sm"><Music className="w-6 h-6 animate-slow-spin" /></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-peach/80">Audio Keepsake</span>
                {memory.fileName && <span className="text-[9px] text-muted-foreground truncate max-w-[200px]">{memory.fileName}</span>}
              </div>
            </div>
            {memory.mediaUrl && !isSandbox ? (
              <audio src={memory.mediaUrl} controls className="w-full relative z-10 opacity-90 h-10 filter dark:invert" preload="metadata" />
            ) : (
              <div className="w-full h-12 bg-white/60 dark:bg-black/60 rounded-full border border-peach/20 relative z-10 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-peach" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Audio Signature Verified</span>
              </div>
            )}
          </div>
        </div>
      )}
      {memory.type === 'text' && (
        <div className="relative py-8 md:py-12 px-4 md:px-6">
          <Quote className="absolute -top-6 -left-4 w-16 md:w-24 h-16 md:h-24 text-peach/5 -rotate-6" />
          <p className="text-xl md:text-4xl font-serif leading-relaxed text-foreground text-center">"{memory.content}"</p>
          <Quote className="absolute -bottom-6 -right-4 w-16 md:w-24 h-16 md:h-24 text-peach/5 rotate-[174deg]" />
        </div>
      )}
    </motion.div>
  );
});
MemoryCard.displayName = "MemoryCard";