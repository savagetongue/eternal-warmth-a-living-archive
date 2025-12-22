import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Feather, ImageIcon, Video, Music, Type, Upload, Calendar, Link as LinkIcon } from 'lucide-react';
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
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resetForm = useCallback(() => {
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
    setShowUrlInput(false);
  }, [initialData]);
  useEffect(() => {
    if (isOpen) {
      resetForm();
    } else {
      // Cleanup: ensure uploading states are cleared if modal closes
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isOpen, resetForm]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File is too heavy (Max 100MB)");
      return;
    }
    setIsUploading(true);
    setUploadProgress(10);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const interval = setInterval(() => {
      setUploadProgress(prev => (prev < 90 ? prev + 2 : prev));
    }, 200);
    try {
      const res = await fetch('/api/memories/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setUploadProgress(100);
        setMediaUrl(json.data.url);
        toast.success("Media preserved successfully.");
        setShowUrlInput(false);
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Archive busy. Try again later.");
      console.error(err);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (type !== 'text' && !mediaUrl) {
      toast.error("Please provide or upload media for this memory.");
      return;
    }
    setIsSubmitting(true);
    // Data Integrity: strictly clean the payload
    const entryData: Omit<MemoryEntry, 'id'> = {
      content: content.trim(),
      type,
      mediaUrl: type === 'text' ? undefined : (mediaUrl || undefined),
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
        toast.success(initialData ? "Memory refined." : "Memory archived.");
        onOpenChange(false);
        onSuccess();
      }
    } catch (err) {
      toast.error("Connection lost to the archive.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-[2.5rem] bg-warm-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Feather className="w-5 h-5 text-peach" />
            {initialData ? 'Refining a Memory' : 'Pen a New Memory'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground italic">
            Threads in the tapestry of our shared journey.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2 font-bold">
              <Calendar className="w-3 h-3" /> Genesis of this Moment
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white rounded-xl border-peach/10 focus:ring-peach/30 font-serif h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">The Narrative</Label>
            <Textarea
              placeholder="A whisper, a shout, a silent look..."
              className="min-h-[140px] bg-white rounded-2xl border-peach/10 focus:ring-peach/30 resize-none font-serif text-lg p-5 leading-relaxed shadow-inner placeholder:text-peach/30"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Medium</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'text', label: 'Letter', icon: Type },
                { id: 'image', label: 'Photo', icon: ImageIcon },
                { id: 'video', label: 'Video', icon: Video },
                { id: 'audio', label: 'Audio', icon: Music },
              ].map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={type === item.id ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "flex flex-col gap-1.5 h-auto py-3 rounded-2xl transition-all border-peach/10",
                    type === item.id
                      ? "bg-peach hover:bg-peach-dark shadow-[0_4px_12px_rgba(255,154,158,0.3)] text-white"
                      : "hover:border-peach/30 bg-white"
                  )}
                  onClick={() => {
                    setType(item.id as MemoryType);
                    if (item.id === 'text') setMediaUrl('');
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          {type !== 'text' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                    isUploading ? "bg-peach/5 border-peach/30" : "hover:bg-peach/5 border-peach/10 bg-white"
                  )}
                  aria-label={`Upload ${type} file`}
                >
                  <Upload className={cn("w-8 h-8", isUploading ? "text-peach animate-bounce" : "text-peach/40")} />
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground/80">
                      {isUploading ? "Preserving..." : mediaUrl ? "Replace Preservation" : `Preserve ${type}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                      Max: 100MB
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={`${type}/*`}
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
                {isUploading && <Progress value={uploadProgress} className="h-1.5 bg-peach/10" />}
                {mediaUrl && !isUploading && (
                  <p className="text-[9px] text-center text-peach/60 uppercase tracking-[0.2em] font-bold">
                    Media Linked Successfully
                  </p>
                )}
              </div>
              {!isUploading && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-peach/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                      <span
                        className="bg-warm-white px-3 text-muted-foreground cursor-pointer hover:text-peach transition-colors flex items-center gap-1 font-bold"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                      >
                        <LinkIcon className="w-3 h-3" /> {showUrlInput ? "Collapse Link Input" : "Provide External Link"}
                      </span>
                    </div>
                  </div>
                  {showUrlInput && (
                    <Input
                      placeholder={`Direct URL to ${type}...`}
                      className="bg-white rounded-xl border-peach/10 focus:ring-peach/30 h-12 shadow-sm font-sans"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          )}
          <Button
            type="submit"
            className="w-full py-8 rounded-2xl bg-peach hover:bg-peach-dark text-white font-serif text-xl shadow-xl hover:shadow-peach/30 transition-all duration-500 disabled:opacity-50 mt-4"
            disabled={isSubmitting || isUploading || !content.trim()}
          >
            {isSubmitting ? "Preserving..." : "Seal in Archive"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}