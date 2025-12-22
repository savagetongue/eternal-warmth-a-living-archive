import React, { forwardRef, useMemo, useState, useEffect } from 'react';
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
  const [isRecentlyAdded, setIsRecentlyAdded] = useState(false);
  useEffect(() => {
    const recent = localStorage.getItem('recent_memory_id');
    if (recent === memory.id) {
      setIsRecentlyAdded(true);
      const timer = setTimeout(() => setIsRecentlyAdded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [memory.id]);
  const hashId = useMemo(() => memory.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0), [memory.id]);
  const rotation = useMemo(() => ((hashId % 40) / 20 - 1).toFixed(2), [hashId]);
  const fallbackColor = useMemo(() => memory.dominantColor || `hsl(${(hashId % 360)}, 30%, 95%)`, [hashId, memory.dominantColor]);
  const formattedDate = useMemo(() => {
    try {
      const date = parseISO(memory.date);
      return isValid(date) ? format(date, 'MMMM do, yyyy') : "A special day";
    } catch { return "A special day"; }
  }, [memory.date]);
  const handleDelete = async () => {
    if (!window.confirm("Remove from our eternal archive?")) return;
    try {
      const res = await fetch(`/api/memories/${memory.id}`, { method: 'DELETE' });
      if (res.ok) { toast.success("Memory returned to the stars."); onDelete?.(); }
    } catch { toast.error("Could not reach the archive."); }
  };
  const MediaIcon = memory.type === 'video' ? Video : memory.type === 'audio' ? Music : ImageIcon;
  return (
    <motion.div
      ref={ref} layout
      initial={{ opacity: 0, y: 40, rotate: parseFloat(rotation) }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "group relative bg-white dark:bg-zinc-950 rounded-[2.5rem] p-6 sm:p-12 border border-peach/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500",
        isRecentlyAdded && "ring-2 ring-peach ring-offset-4 ring-offset-background"
      )}
    >
      <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 z-30">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-warm-cream/80 backdrop-blur-sm border border-peach/20 text-peach" onClick={() => onEdit?.(memory)}><Pencil className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-400" onClick={handleDelete}><Trash2 className="w-4 h-4" /></Button>
      </div>
      <div className="mb-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-peach/10" />
        <span className="text-[10px] font-serif italic text-muted-foreground tracking-[0.4em] uppercase whitespace-nowrap">{formattedDate}</span>
        <div className="h-px flex-1 bg-peach/10" />
      </div>
      {memory.type === 'video' && (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-[2rem] aspect-video w-full bg-black border-4 border-warm-paper dark:border-zinc-900 shadow-inner">
            <video
              src={memory.mediaUrl}
              poster={memory.previewUrl}
              controls
              className={cn("w-full h-full object-contain transition-opacity duration-1000", isMediaLoading ? "opacity-0" : "opacity-100")}
              onLoadedData={() => setIsMediaLoading(false)}
              onError={() => { setIsMediaLoading(false); setHasError(true); }}
            />
            {isMediaLoading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <Loader2 className="w-8 h-8 text-peach animate-spin" />
              </div>
            )}
            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                <Video className="w-12 h-12 text-peach/20 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-peach/40">Visual Essence Archived</span>
              </div>
            )}
          </div>
          <p className="text-xl md:text-3xl font-serif italic text-center text-foreground/90 whitespace-pre-wrap break-words px-4">"{memory.content}"</p>
        </div>
      )}
      {memory.type === 'image' && (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-[2rem] aspect-video w-full border-4 border-warm-paper dark:border-zinc-900" style={{ backgroundColor: fallbackColor }}>
            {memory.mediaUrl && !hasError && (
              <img
                src={memory.mediaUrl} alt="Archive" className={cn("w-full h-full object-contain transition-opacity duration-1000", isMediaLoading ? "opacity-0" : "opacity-100")}
                onLoad={() => setIsMediaLoading(false)} onError={() => { setIsMediaLoading(false); setHasError(true); }}
              />
            )}
            {isMediaLoading && !hasError && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-peach animate-spin" /></div>}
            {hasError && <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-12 h-12 text-peach/20" /></div>}
          </div>
          <p className="text-xl md:text-3xl font-serif italic text-center text-foreground/90 whitespace-pre-wrap break-words px-4">"{memory.content}"</p>
        </div>
      )}
      {memory.type === 'audio' && (
        <div className="space-y-10">
          <div className="relative text-center px-8">
            <Quote className="absolute -top-4 -left-2 w-16 h-16 text-peach/5 -rotate-12" />
            <p className="text-xl md:text-4xl font-serif leading-relaxed text-foreground whitespace-pre-wrap break-words">{memory.content}</p>
          </div>
          <div className="relative p-8 rounded-[2.5rem] border border-peach/10 flex flex-col items-center gap-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: fallbackColor }} />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-full bg-white/50 dark:bg-zinc-800/50 text-peach"><Music className="w-6 h-6 animate-slow-spin" /></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-peach/60">Audio Keepsake</span>
                {memory.fileName && <span className="text-[9px] text-muted-foreground truncate max-w-[150px]">{memory.fileName}</span>}
              </div>
            </div>
            {memory.mediaUrl && !hasError ? <audio src={memory.mediaUrl} controls className="w-full relative z-10 opacity-80" /> : <div className="w-full h-16 bg-white/40 rounded-2xl border-2 border-dashed border-peach/20 relative z-10" />}
          </div>
        </div>
      )}
      {memory.type === 'text' && (
        <div className="relative py-8 md:py-12 px-4 md:px-6">
          <Quote className="absolute -top-6 -left-4 w-16 md:w-24 h-16 md:h-24 text-peach/5 -rotate-6" />
          <p className="text-xl md:text-4xl font-serif leading-relaxed text-foreground text-center whitespace-pre-wrap break-words">"{memory.content}"</p>
          <Quote className="absolute -bottom-6 -right-4 w-16 md:w-24 h-16 md:h-24 text-peach/5 rotate-[174deg]" />
        </div>
      )}
    </motion.div>
  );
});
MemoryCard.displayName = "MemoryCard";