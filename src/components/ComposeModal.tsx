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
import { CheckCircle2, Feather, ImageIcon, Video, Music, Type, Upload, Calendar, Link as LinkIcon, Info } from 'lucide-react';
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
  const [previewUrl, setPreviewUrl] = useState('');
  const [livePreviewUrl, setLivePreviewUrl] = useState('');
  const [dominantColor, setDominantColor] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const cleanupObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    objectUrlsRef.current = [];
  }, []);
  const extractDominantColor = (img: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#FDFBF7';
    ctx.drawImage(img, 0, 0, 1, 1);
    try {
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const toHex = (c: number) => c.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    } catch (e) {
      return '#FDFBF7';
    }
  };
  const generateHighResThumbnail = (img: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;
    const targetWidth = Math.min(500, originalWidth);
    const scaleFactor = targetWidth / originalWidth;
    const targetHeight = Math.floor(originalHeight * scaleFactor);
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL('image/jpeg', 0.5); // Durable Objects have size limits, keep it compact
  };
  const generateSignature = (file: File): Promise<{ blobUrl: string; base64Thumb: string; color: string }> => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(objectUrl);
      const hash = file.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hue = file.type.startsWith('video/') ? (210 + (hash % 40)) : (350 + (hash % 20));
      const fallbackColor = `hsl(${hue}, 70%, 90%)`;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        const timeout = setTimeout(() => {
          resolve({ blobUrl: objectUrl, base64Thumb: '', color: fallbackColor });
        }, 5000);
        img.onload = () => {
          clearTimeout(timeout);
          const color = extractDominantColor(img);
          const base64Thumb = generateHighResThumbnail(img);
          resolve({ blobUrl: objectUrl, base64Thumb, color });
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve({ blobUrl: objectUrl, base64Thumb: '', color: fallbackColor });
        };
        img.src = objectUrl;
      } else {
        resolve({ blobUrl: objectUrl, base64Thumb: '', color: fallbackColor });
      }
    });
  };
  const resetForm = useCallback(() => {
    cleanupObjectUrls();
    if (initialData) {
      setContent(initialData.content);
      setType(initialData.type);
      setMediaUrl(initialData.mediaUrl || '');
      setPreviewUrl(initialData.previewUrl || '');
      setLivePreviewUrl('');
      setDominantColor(initialData.dominantColor || '');
      setCurrentFileName(initialData.fileName || '');
      setDate(initialData.date);
      setSignatureCaptured(!!initialData.previewUrl);
    } else {
      setContent('');
      setType('text');
      setMediaUrl('');
      setPreviewUrl('');
      setLivePreviewUrl('');
      setDominantColor('');
      setCurrentFileName('');
      setDate(new Date().toISOString().split('T')[0]);
      setSignatureCaptured(false);
    }
    setIsProcessing(false);
  }, [initialData, cleanupObjectUrls]);
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
    return () => cleanupObjectUrls();
  }, [isOpen, resetForm, cleanupObjectUrls]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCurrentFileName(file.name);
    setIsProcessing(true);
    setSignatureCaptured(false);
    try {
      const { blobUrl, base64Thumb, color } = await generateSignature(file);
      setLivePreviewUrl(blobUrl);
      setPreviewUrl(base64Thumb);
      setDominantColor(color);
      setSignatureCaptured(true);
      toast.success("Visual signature captured.");
    } catch (err) {
      toast.error("Failed to process local preview.");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (type !== 'text' && !mediaUrl && !previewUrl && !livePreviewUrl) {
      toast.error("Please provide a URL or a visual signature for this memory.");
      return;
    }
    setIsSubmitting(true);
    const entryData: Omit<MemoryEntry, 'id'> = {
      content: content.trim(),
      type,
      mediaUrl: type === 'text' ? undefined : (mediaUrl || undefined),
      previewUrl: type === 'text' ? undefined : (previewUrl || undefined),
      dominantColor: type === 'text' ? undefined : (dominantColor || undefined),
      fileName: type === 'text' ? undefined : (currentFileName || undefined),
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
  const handleTypeChange = (newType: MemoryType) => {
    cleanupObjectUrls();
    setType(newType);
    setSignatureCaptured(false);
    setLivePreviewUrl('');
    setPreviewUrl('');
    setCurrentFileName('');
    if (newType !== 'text') {
      setTimeout(() => urlInputRef.current?.focus(), 100);
    } else {
      setMediaUrl('');
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
            <div className="flex justify-between items-end">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">The Narrative</Label>
              <span className={cn("text-[9px] font-bold tracking-widest", content.length > 500 ? "text-red-400" : "text-peach/40")}>
                {content.length} CHARS
              </span>
            </div>
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
                  onClick={() => handleTypeChange(item.id as MemoryType)}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          {type !== 'text' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-peach font-black flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" /> Permanent Source (URL)
                </Label>
                <Input
                  ref={urlInputRef}
                  placeholder={`Direct URL to high-res ${type}...`}
                  className="bg-white rounded-xl border-peach/20 focus:ring-peach/30 h-12 shadow-sm font-sans"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
                <div className="flex gap-2 p-3 bg-peach/5 rounded-lg border border-peach/10">
                  <Info className="w-4 h-4 text-peach flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Cloud storage is restricted. For permanent high-res display, please provide a direct URL from a host (like Imgur, Dropbox, etc).
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-peach/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-warm-white px-3 text-muted-foreground font-bold">Or capture visual signature</span>
                </div>
              </div>
              <div className="space-y-2">
                <div
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all overflow-hidden",
                    signatureCaptured ? "border-green-200 bg-green-50/30" : (isProcessing ? "border-peach/30 bg-peach/5" : "hover:bg-peach/5 border-peach/10 bg-white")
                  )}
                >
                  {(livePreviewUrl || previewUrl) && !isProcessing && (
                    <div className="absolute inset-0 z-0">
                       {type === 'image' ? (
                          <img src={livePreviewUrl || previewUrl} className="w-full h-full object-cover opacity-10" alt="Preview" />
                       ) : (
                          <div className="w-full h-full opacity-5" style={{ backgroundColor: dominantColor }} />
                       )}
                    </div>
                  )}
                  {signatureCaptured ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 relative z-10" />
                  ) : (
                    <Upload className={cn("w-6 h-6 relative z-10", isProcessing ? "text-peach animate-bounce" : "text-peach/40")} />
                  )}
                  <div className="text-center relative z-10">
                    <p className="text-xs font-bold text-foreground/80">
                      {isProcessing ? "Extracting Essence..." : signatureCaptured ? "Signature Captured" : `Select ${type} for signature`}
                    </p>
                    {currentFileName && (
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1 truncate max-w-[150px]">
                        {currentFileName}
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={type === 'audio' ? 'audio/*' : type === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          )}
          <Button
            type="submit"
            className="w-full py-8 rounded-2xl bg-peach hover:bg-peach-dark text-white font-serif text-xl shadow-xl hover:shadow-peach/30 transition-all duration-500 disabled:opacity-50 mt-4"
            disabled={isSubmitting || isProcessing || !content.trim()}
          >
            {isSubmitting ? "Preserving..." : "Seal in Archive"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}