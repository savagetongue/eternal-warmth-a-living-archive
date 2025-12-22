import React, { forwardRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Quote, Pencil, Trash2, Music, CassetteTape } from 'lucide-react';
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
  const isImage = memory.type === 'image' && memory.mediaUrl;
  const isVideo = memory.type === 'video' && memory.mediaUrl;
  const isAudio = memory.type === 'audio' && memory.mediaUrl;
  // Organic subtle tilt
  const rotation = useMemo(() => (Math.random() * 2 - 1).toFixed(2), []);
  const handleDelete = async () => {
    // Custom styled confirmation would be better but keeping it simple for now
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
        "group relative bg-white dark:bg-zinc-950 rounded-[2.5rem] p-8 sm:p-12 border border-peach/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden",
        "before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] before:opacity-[0.05] before:pointer-events-none"
      )}
    >
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-peach/5 to-transparent pointer-events-none" />
      <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 translate-y-2 group-hover:translate-y-0 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-warm-cream/80 backdrop-blur-sm border border-peach/20 hover:bg-peach/20 text-peach"
          onClick={() => onEdit?.(memory)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-red-50/80 backdrop-blur-sm border border-red-100 hover:bg-red-100 text-red-400"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="mb-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-peach/10" />
        <span className="text-xs font-serif italic text-muted-foreground tracking-widest uppercase">
          {format(parseISO(memory.date), 'MMMM do, yyyy')}
        </span>
        <div className="h-px flex-1 bg-peach/10" />
      </div>
      {isImage && (
        <div className="space-y-8">
          <div className="overflow-hidden rounded-[2rem] aspect-[16/10] shadow-inner border-4 border-warm-paper">
            <img
              src={memory.mediaUrl}
              alt="Memory"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          <p className="text-2xl md:text-3xl font-serif leading-relaxed text-foreground/90 italic text-center px-4">
            "{memory.content}"
          </p>
        </div>
      )}
      {isVideo && (
        <div className="space-y-8">
          <div className="overflow-hidden rounded-[2rem] aspect-video bg-black shadow-2xl border-4 border-warm-paper">
            <video
              src={memory.mediaUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-2xl font-serif leading-relaxed text-foreground/90 italic text-center px-4">
            {memory.content}
          </p>
        </div>
      )}
      {isAudio && (
        <div className="space-y-10">
          <div className="relative text-center px-8">
            <Quote className="absolute -top-4 -left-2 w-16 h-16 text-peach/5 -rotate-12" />
            <p className="text-2xl md:text-4xl font-serif leading-relaxed text-foreground text-pretty">
              {memory.content}
            </p>
          </div>
          <div className="bg-warm-cream/20 p-8 rounded-[2.5rem] border border-peach/10 flex flex-col items-center gap-6 relative overflow-hidden">
            <div className="absolute top-2 right-4 opacity-10">
              <CassetteTape className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-peach/10 text-peach animate-pulse">
                <Music className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-peach/60">Audio Keepsake</span>
            </div>
            <audio
              src={memory.mediaUrl}
              controls
              className="w-full h-10 opacity-80 mix-blend-multiply dark:mix-blend-normal"
            />
          </div>
        </div>
      )}
      {memory.type === 'text' && (
        <div className="relative py-12 px-6">
          <Quote className="absolute -top-6 -left-4 w-24 h-24 text-peach/5 -rotate-6" />
          <p className="text-2xl md:text-4xl font-serif leading-relaxed text-foreground text-pretty text-center selection:bg-peach/20">
            {memory.content}
          </p>
          <Quote className="absolute -bottom-6 -right-4 w-24 h-24 text-peach/5 rotate-[174deg]" />
        </div>
      )}
      {/* Subtle Texture Shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-peach/20 to-transparent blur-sm" />
    </motion.div>
  );
});
MemoryCard.displayName = "MemoryCard";