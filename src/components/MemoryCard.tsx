import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Quote, Pencil } from 'lucide-react';
import type { MemoryEntry } from '@shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
interface MemoryCardProps {
  memory: MemoryEntry;
  index: number;
  onEdit?: (memory: MemoryEntry) => void;
}
export const MemoryCard = forwardRef<HTMLDivElement, MemoryCardProps>(({ memory, index, onEdit }, ref) => {
  const isImage = memory.type === 'image' && memory.mediaUrl;
  const isVideo = memory.type === 'video' && memory.mediaUrl;
  const isAudio = memory.type === 'audio' && memory.mediaUrl;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-border/50 hover:shadow-glow transition-all duration-500",
        (isImage || isVideo) ? "aspect-auto" : "aspect-video flex flex-col justify-center"
      )}
    >
      <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-warm-cream/50 hover:bg-peach/20 text-peach"
          onClick={() => onEdit?.(memory)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </div>
      <div className="mb-4">
        <span className="text-xs font-serif italic text-muted-foreground">
          {format(parseISO(memory.date), 'MMMM do, yyyy')}
        </span>
      </div>
      {isImage && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl aspect-[16/10]">
            <img
              src={memory.mediaUrl}
              alt="Memory"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <p className="text-lg font-serif leading-relaxed text-foreground/90 italic">
            "{memory.content}"
          </p>
        </div>
      )}
      {isVideo && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl aspect-video bg-black shadow-inner">
            <video
              src={memory.mediaUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-lg font-serif leading-relaxed text-foreground/90 italic">
            {memory.content}
          </p>
        </div>
      )}
      {isAudio && (
        <div className="space-y-6">
          <div className="relative">
            <Quote className="absolute -top-6 -left-4 w-12 h-12 text-peach/10" />
            <p className="text-xl md:text-2xl font-serif leading-relaxed text-foreground text-pretty">
              {memory.content}
            </p>
          </div>
          <div className="bg-warm-cream/30 p-4 rounded-2xl border border-peach/10">
            <audio
              src={memory.mediaUrl}
              controls
              className="w-full h-8"
            />
          </div>
        </div>
      )}
      {memory.type === 'text' && (
        <div className="relative">
          <Quote className="absolute -top-6 -left-4 w-12 h-12 text-peach/10" />
          <p className="text-xl md:text-2xl font-serif leading-relaxed text-foreground text-pretty">
            {memory.content}
          </p>
        </div>
      )}
    </motion.div>
  );
});
MemoryCard.displayName = "MemoryCard";