import React, { useState, useEffect, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Feather, ImageIcon, Video, Music, Type, Upload, Calendar } from 'lucide-react';
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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
      setType(initialData.type);
      setMediaUrl(initialData.mediaUrl || '');
      setDate(initialData.date);
    } else {
      setContent('');
      setType('text');
      setMediaUrl('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setUploadProgress(0);
    setIsUploading(false);
  }, [initialData, isOpen]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validation
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error("File is too heavy for our archive (Max 100MB)");
      return;
    }
    setIsUploading(true);
    setUploadProgress(10);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    try {
      // Note: Standard fetch doesn't support progress. 
      // In a real app we might use XMLHttpRequest or a library like Axios for real progress.
      // Here we simulate progress steps while waiting for fetch.
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 500);
      const res = await fetch('/api/memories/upload', {
        method: 'POST',
        body: formData,
      });
      clearInterval(progressInterval);
      const json = await res.json();
      if (json.success) {
        setUploadProgress(100);
        setMediaUrl(json.data.url);
        toast.success("Media captured successfully.");
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Failed to preserve media.");
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (type !== 'text' && !mediaUrl) {
      toast.error("Please provide or upload media for this memory type.");
      return;
    }
    setIsSubmitting(true);
    const entryData = {
      content,
      type,
      mediaUrl: mediaUrl || undefined,
      date: date
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
      <DialogContent className="sm:max-w-lg rounded-3xl bg-warm-white border-none shadow-glass max-h-[90vh] overflow-y-auto">
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
            <Label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3 h-3" /> When did this happen?
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white rounded-xl border-border focus:ring-peach/30 font-serif"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">The Thought</Label>
            <Textarea
              placeholder="What are we remembering today?"
              className="min-h-[120px] bg-white rounded-2xl border-border focus:ring-peach/30 resize-none font-serif text-lg p-4"
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
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Media Upload</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
                    isUploading ? "bg-peach/5 border-peach/30" : "hover:bg-peach/5 border-peach/10"
                  )}
                >
                  <Upload className={cn("w-6 h-6", isUploading ? "text-peach animate-bounce" : "text-peach/40")} />
                  <p className="text-sm font-medium text-muted-foreground">
                    {isUploading ? "Uploading..." : mediaUrl ? "Change File" : `Upload ${type}`}
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept={`${type}/*`}
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
                {isUploading && <Progress value={uploadProgress} className="h-1" />}
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-peach/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-warm-white px-2 text-muted-foreground/40">or provide URL</span>
                </div>
              </div>
              <Input
                placeholder={`https://... (${type} URL)`}
                className="bg-white rounded-xl border-border focus:ring-peach/30"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full py-6 rounded-2xl bg-peach hover:bg-peach-dark text-white font-serif text-lg shadow-lg hover:shadow-peach/20"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? "Preserving..." : "Seal with Love"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}