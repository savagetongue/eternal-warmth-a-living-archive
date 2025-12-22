import React, { forwardRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';
import { Quote, Pencil, Trash2, Music, Disc3, Loader2 } from 'lucide-react';
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
  const displayUrl = memory.mediaUrl || memory.previewUrl;
  const isImage = memory.type === 'image' && displayUrl;
  const isVideo = memory.type === 'video' && displayUrl;
  const isAudio = memory.type === 'audio' && displayUrl;
  const rotation = useMemo(() => (Math.random() * 2 - 1).toFixed(2), []);
  const handleDelete = async () => {
    if (!window.confirm("Remove this memory from our eternal archive?")) return;
    try {
      const res = await fetch(`/api/memories/${memory.id}`, {
        method: 'DELETE',
      });
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
  const formattedDate = useMemo(() => {
    try {
      const date = parseISO(memory.date);
      if (!isValid(date)) return "A special day";
      return format(date, 'MMMM do, yyyy');
    } catch (e) {
      return "A special day";
    }
  }, [memory.date]);
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40, rotate: parseFloat(rotation) }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        rotate: 0,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "group relative bg-white dark:bg-zinc-950 rounded-[2.5rem] p-6 sm:p-12 border border-peach/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden",
        "before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] before:opacity-[0.05] before:pointer-events-none"
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-peach/5 to-transparent pointer-events-none" />
      <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 translate-y-2 group-hover:translate-y-0 z-20">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit memory"
          className="h-10 w-10 rounded-full bg-warm-cream/80 backdrop-blur-sm border border-peach/20 hover:bg-peach/20 text-peach"
          onClick={() => onEdit?.(memory)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete memory"
          className="h-10 w-10 rounded-full bg-red-50/80 backdrop-blur-sm border border-red-100 hover:bg-red-100 text-red-400"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="mb-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-peach/10" />
        <span className="text-[10px] sm:text-xs font-serif italic text-muted-foreground tracking-widest uppercase">
          {formattedDate}
        </span>
        <div className="h-px flex-1 bg-peach/10" />
      </div>
      {(isImage || isVideo) && (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-[2rem] aspect-[16/10] shadow-inner border-4 border-warm-paper bg-peach/5">
            {isMediaLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-peach/5 animate-pulse">
                <Loader2 className="w-10 h-10 text-peach/20 animate-spin" />
                <span className="mt-4 text-[9px] uppercase tracking-[0.3em] text-peach/30 font-bold">Unveiling Moment</span>
              </div>
            )}
            {isImage ? (
              <img
                src={displayUrl}
                alt={`Cherished moment from ${formattedDate}`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-1000 group-hover:scale-110",
                  isMediaLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsMediaLoading(false)}
                loading="lazy"
              />
            ) : (
              <video
                src={displayUrl}
                controls
                className={cn(
                  "w-full h-full object-contain",
                  isMediaLoading ? "opacity-0" : "opacity-100"
                )}
                onCanPlayThrough={() => setIsMediaLoading(false)}
              />
            )}
          </div>
          <p className="text-xl md:text-3xl font-serif leading-relaxed text-foreground/90 italic text-center px-4 whitespace-pre-wrap break-words">
            "{memory.content}"
          </p>
        </div>
      )}
      {isAudio && (
        <div className="space-y-10">
          <div className="relative text-center px-8">
            <Quote className="absolute -top-4 -left-2 w-16 h-16 text-peach/5 -rotate-12" />
            <p className="text-xl md:text-4xl font-serif leading-relaxed text-foreground text-pretty whitespace-pre-wrap break-words">
              {memory.content}
            </p>
          </div>
          <div className="bg-peach/5 p-8 rounded-[2.5rem] border border-peach/10 flex flex-col items-center gap-6 relative overflow-hidden">
            <div className="absolute top-2 right-4 opacity-10">
              <Disc3 className="w-20 h-20 animate-[spin_8s_linear_infinite]" />
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-peach/10 text-peach animate-pulse">
                <Music className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-peach/60">Audio Keepsake</span>
            </div>
            <audio
              src={displayUrl}
              controls
              className="w-full h-10 opacity-80 mix-blend-multiply dark:mix-blend-normal"
            />
          </div>
        </div>
      )}
      {memory.type === 'text' && (
        <div className="relative py-8 md:py-12 px-4 md:px-6">
          <Quote className="absolute -top-6 -left-4 w-16 md:w-24 h-16 md:h-24 text-peach/5 -rotate-6" />
          <p className="text-xl md:text-4xl font-serif leading-relaxed text-foreground text-pretty text-center selection:bg-peach/20 whitespace-pre-wrap break-words">
            {memory.content}
          </p>
          <Quote className="absolute -bottom-6 -right-4 w-16 md:w-24 h-16 md:h-24 text-peach/5 rotate-[174deg]" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-peach/20 to-transparent blur-sm" />
    </motion.div>
  );
});
MemoryCard.displayName = "MemoryCard";