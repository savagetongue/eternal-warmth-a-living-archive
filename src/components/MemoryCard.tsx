import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Quote, Image as ImageIcon, Heart } from 'lucide-react';
import type { MemoryEntry } from '@shared/types';
import { cn } from '@/lib/utils';
interface MemoryCardProps {
  memory: MemoryEntry;
  index: number;
}
export function MemoryCard({ memory, index }: MemoryCardProps) {
  const isImage = memory.type === 'image' && memory.mediaUrl;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "group relative bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-soft border border-border/50 hover:shadow-glow transition-all duration-500",
        isImage ? "aspect-auto" : "aspect-video flex flex-col justify-center"
      )}
    >
      <div className="absolute top-4 right-6 flex items-center gap-2">
        {memory.mood && (
          <span className="text-[10px] uppercase tracking-tighter text-muted-foreground px-2 py-1 bg-muted rounded-full">
            {memory.mood}
          </span>
        )}
        <Heart className="w-4 h-4 text-peach/40 group-hover:text-peach transition-colors" />
      </div>
      <div className="mb-4">
        <span className="text-xs font-serif italic text-muted-foreground">
          {format(parseISO(memory.date), 'MMMM do, yyyy')}
        </span>
      </div>
      {isImage ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl aspect-[4/3]">
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
      ) : (
        <div className="relative">
          <Quote className="absolute -top-6 -left-4 w-12 h-12 text-peach/10" />
          <p className="text-xl md:text-2xl font-serif leading-relaxed text-foreground text-pretty">
            {memory.content}
          </p>
        </div>
      )}
    </motion.div>
  );
}