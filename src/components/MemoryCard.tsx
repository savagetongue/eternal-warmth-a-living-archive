import React, { forwardRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';
import { Quote, Pencil, Trash2, Music, Loader2, ImageIcon, Video } from 'lucide-react';
import type { MemoryEntry } from '@shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
interface MemoryCardProps {
  memory: MemoryEntry;
  index: number;
  onEdit?: (memory: MemoryEntry) => void;
  onDelete?: () => void;
}
export const MemoryCard = forwardRef<HTMLDivElement, MemoryCardProps>(({ memory, index, onEdit, onDelete }, ref) => {
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const hashId = useMemo(() => {
    return memory.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }, [memory.id]);
  const rotation = useMemo(() => {
    const r = (hashId % 40) / 20 - 1;
    return r.toFixed(2);
  }, [hashId]);
  const fallbackColor = useMemo(() => {
    if (memory.dominantColor) return memory.dominantColor;
    return `hsl(${(hashId % 360)}, 30%, 95%)`;
  }, [hashId, memory.dominantColor]);
  const formattedDate = useMemo(() => {
    try {
      const date = parseISO(memory.date);
      if (!isValid(date)) return "A special day";
      return format(date, 'MMMM do, yyyy');
    } catch (e) {
      return "A special day";
    }
  }, [memory.date]);
  const handleDelete = async () => {
    if (!window.confirm("Remove this memory from our eternal archive?")) return;
    try {
      const res = await fetch(`/api/memories/${memory.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Memory returned to the stars.");
        onDelete?.();
      } else {
        toast.error("Could not reach the archive.");
      }
    } catch (err) {
      toast.error("An error occurred during deletion.");
    }
  };
  const MediaIcon = memory.type === 'video' ? Video : memory.type === 'audio' ? Music : ImageIcon;
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40, rotate: parseFloat(rotation) }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, rotate: 0, transition: { duration: 0.4, ease: "easeOut" } }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "group relative bg-white dark:bg-zinc-950 rounded-[2.5rem] p-6 sm:p-12 border border-peach/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden",
        "before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] before:opacity-[0.05] before:pointer-events-none"
      )}
    >
      <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 z-30">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-warm-cream/80 backdrop-blur-sm border border-peach/20 text-peach" onClick={() => onEdit?.(memory)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-400" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="mb-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-peach/10" />
        <span className="text-[10px] sm:text-xs font-serif italic text-muted-foreground tracking-widest uppercase">{formattedDate}</span>
        <div className="h-px flex-1 bg-peach/10" />
      </div>
      {(memory.type === 'image' || memory.type === 'video') && (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-[2rem] aspect-video w-full shadow-inner border-4 border-warm-paper" style={{ backgroundColor: fallbackColor }}>
            <AnimatePresence>
              {isMediaLoading && !hasError && (
                <motion.div exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-inherit">
                  <MediaIcon className="w-12 h-12 text-foreground/10 animate-pulse mb-4" />
                  <Loader2 className="w-5 h-5 text-foreground/5 animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Video Fallback State - Premium Illustrative UI */}
            {memory.type === 'video' && (hasError || !memory.mediaUrl) ? (
              <div className="absolute inset-0 flex items-center justify-center p-8 bg-inherit">
                <Video className="w-24 h-24 text-white/30" />
                <span className="absolute bottom-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Preview
                </span>
              </div>
            ) : memory.type === 'image' && (hasError || !memory.mediaUrl) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-50 dark:bg-zinc-900">
                <ImageIcon className="w-12 h-12 text-peach/20 mb-4" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-bold">Unreachable source</span>
              </div>
            ) : memory.type === 'image' ? (
              <img
                src={memory.mediaUrl}
                alt="Archive item"
                className={cn("w-full h-full object-contain transition-all duration-700", isMediaLoading ? "blur-sm opacity-50" : "blur-0 opacity-100")}
                onLoad={() => setIsMediaLoading(false)}
                onError={() => { setIsMediaLoading(false); setHasError(true); }}
                loading="lazy"
              />
            ) : (
              <video
                src={memory.mediaUrl}
                poster={memory.previewUrl}
                className="w-full h-full object-contain"
                controls
                preload="metadata"
                onLoadedData={() => setIsMediaLoading(false)}
                onError={() => { setIsMediaLoading(false); setHasError(true); }}
              />
            )}
          </div>
          <p className="text-xl md:text-3xl font-serif leading-relaxed text-foreground/90 italic text-center px-4 whitespace-pre-wrap break-words">
            "{memory.content}"
          </p>
        </div>
      )}
      {memory.type === 'audio' && (
        <div className="space-y-10">
          <div className="relative text-center px-8">
            <Quote className="absolute -top-4 -left-2 w-16 h-16 text-peach/5 -rotate-12" />
            <p className="text-xl md:text-4xl font-serif leading-relaxed text-foreground text-pretty whitespace-pre-wrap break-words">{memory.content}</p>
          </div>
          <div className="relative p-8 rounded-[2.5rem] border border-peach/10 overflow-hidden flex flex-col items-center gap-6">
            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: fallbackColor }} />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-full bg-white/50 text-peach shadow-sm"><Music className="w-6 h-6" /></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-peach/60">Audio Keepsake</span>
                {memory.fileName && <span className="text-[9px] text-muted-foreground truncate max-w-[150px]">{memory.fileName}</span>}
              </div>
            </div>
            {memory.mediaUrl && !hasError ? (
              <audio
                src={memory.mediaUrl}
                controls
                className="w-full relative z-10 opacity-80"
                onError={() => setHasError(true)}
              />
            ) : (
              <div className="w-full h-12 flex items-center justify-center bg-white/40 border-2 border-dashed border-peach/20 rounded-xl relative z-10">
                <span className="text-sm text-muted-foreground/60">{hasError ? "Corrupted Audio Stream" : "Archived Signature"}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {memory.type === 'text' && (
        <div className="relative py-8 md:py-12 px-4 md:px-6">
          <Quote className="absolute -top-6 -left-4 w-16 md:w-24 h-16 md:h-24 text-peach/5 -rotate-6" />
          <p className="text-xl md:text-4xl font-serif leading-relaxed text-foreground text-pretty text-center whitespace-pre-wrap break-words">{memory.content}</p>
          <Quote className="absolute -bottom-6 -right-4 w-16 md:w-24 h-16 md:h-24 text-peach/5 rotate-[174deg]" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-peach/20 to-transparent blur-sm" />
    </motion.div>
  );
});
MemoryCard.displayName = "MemoryCard";