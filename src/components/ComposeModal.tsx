import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Feather, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { MemoryEntry, MemoryType } from '@shared/types';
interface ComposeModalProps {
  onSuccess: () => void;
}
export function ComposeModal({ onSuccess }: ComposeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState<MemoryType>('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mood, setMood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    const newEntry: MemoryEntry = {
      id: uuidv4(),
      content,
      type,
      mediaUrl: mediaUrl || undefined,
      mood: mood || undefined,
      date: new Date().toISOString().split('T')[0]
    };
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        body: JSON.stringify(newEntry),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success("Memory archived eternally.");
        setIsOpen(false);
        setContent('');
        setMediaUrl('');
        setMood('');
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to archive the moment.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-2xl bg-peach hover:bg-peach-dark text-white border-none transition-transform hover:scale-110 active:scale-95"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-3xl bg-warm-white border-none shadow-glass">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Feather className="w-5 h-5 text-peach" />
            Pen a New Memory
          </DialogTitle>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Mood</Label>
              <Input 
                placeholder="Joyous, Quiet, Calm..."
                className="bg-white rounded-xl border-border focus:ring-peach/30"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Type</Label>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant={type === 'text' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={() => setType('text')}
                >
                  Letter
                </Button>
                <Button 
                  type="button"
                  variant={type === 'image' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={() => setType('image')}
                >
                  Photo
                </Button>
              </div>
            </div>
          </div>
          {type === 'image' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Image URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="https://..."
                  className="pl-10 bg-white rounded-xl border-border focus:ring-peach/30"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full py-6 rounded-2xl bg-peach hover:bg-peach-dark text-white font-serif text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Archiving..." : "Seal with Love"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}