import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Feather, Image as ImageIcon, Video, Music, Type } from 'lucide-react';
import { toast } from 'sonner';
import type { MemoryEntry, MemoryType } from '@shared/types';
import { cn } from '@/lib/utils';
interface ComposeModalProps {
  initialData?: MemoryEntry | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
export function ComposeModal({ initialData, isOpen, onOpenChange, onSuccess }: ComposeModalProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<MemoryType>('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
      setType(initialData.type);
      setMediaUrl(initialData.mediaUrl || '');
    } else {
      setContent('');
      setType('text');
      setMediaUrl('');
    }
  }, [initialData, isOpen]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    const entryData = {
      content,
      type,
      mediaUrl: mediaUrl || undefined,
      date: initialData?.date || new Date().toISOString().split('T')[0]
    };
    try {
      const url = initialData ? `/api/memories/${initialData.id}` : '/api/memories';
      const method = initialData ? 'PUT' : 'POST';
      const payload = initialData ? entryData : { ...entryData, id: uuidv4() };
      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success(initialData ? "Memory refined." : "Memory archived eternally.");
        onOpenChange(false);
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to archive the moment.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl bg-warm-white border-none shadow-glass">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Feather className="w-5 h-5 text-peach" />
            {initialData ? 'Refining a Memory' : 'Pen a New Memory'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground italic">
            Every word and image is a thread in the tapestry of us.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">The Thought</Label>
            <Textarea
              placeholder="What are we remembering today?"
              className="min-h-[150px] bg-white rounded-2xl border-border focus:ring-peach/30 resize-none font-serif text-lg p-4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Memory Format</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'text', label: 'Letter', icon: Type },
                { id: 'image', label: 'Photo', icon: ImageIcon },
                { id: 'video', label: 'Video', icon: Video },
                { id: 'audio', label: 'Music', icon: Music },
              ].map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={type === item.id ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "flex flex-col gap-1 h-auto py-2 rounded-xl transition-all",
                    type === item.id ? "bg-peach hover:bg-peach-dark" : "hover:border-peach/50"
                  )}
                  onClick={() => setType(item.id as MemoryType)}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          {type !== 'text' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Media Link</Label>
              <div className="relative">
                <Input
                  placeholder={`https://... (${type} URL)`}
                  className="bg-white rounded-xl border-border focus:ring-peach/30"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>
            </div>
          )}
          <Button
            type="submit"
            className="w-full py-6 rounded-2xl bg-peach hover:bg-peach-dark text-white font-serif text-lg shadow-lg hover:shadow-peach/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Preserving..." : "Seal with Love"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}