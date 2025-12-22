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
import { CheckCircle2, Feather, ImageIcon, Video, Music, Type, Upload, Calendar, Link as LinkIcon, Info, Loader2 } from 'lucide-react';
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
  const objectUrlsRef = useRef<string[]>([]);
  const cleanupObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    objectUrlsRef.current = [];
  }, []);
  const extractDominantColor = (img: HTMLImageElement | HTMLCanvasElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#FDFBF7';
    ctx.drawImage(img, 0, 0, 1, 1);
    try {
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const toHex = (c: number) => c.toString(16).padStart(2, '0');
      return `#${toHex(data[0])}${toHex(data[1])}${toHex(data[2])}`;
    } catch (e) {
      return '#FDFBF7';
    }
  };
  const generateThumbnailFromSource = (source: HTMLImageElement | HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    const sourceWidth = (source as any).naturalWidth || (source as any).videoWidth || source.width;
    const sourceHeight = (source as any).naturalHeight || (source as any).videoHeight || source.height;
    const targetWidth = Math.min(400, sourceWidth);
    const scaleFactor = targetWidth / sourceWidth;
    const targetHeight = Math.floor(sourceHeight * scaleFactor);
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL('image/jpeg', 0.4);
  };
  const generateSignature = (file: File): Promise<{ blobUrl: string; base64Thumb: string; color: string; autoType: MemoryType }> => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(objectUrl);
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      const autoType: MemoryType = isVideo ? 'video' : isAudio ? 'audio' : 'image';
      const fallbackColor = isVideo ? '#A1C4FD' : '#FF9A9E';
      if (file.type.startsWith('image/')) {
        const img = new Image();
        const timeout = setTimeout(() => resolve({ blobUrl: objectUrl, base64Thumb: '', color: fallbackColor, autoType }), 5000);
        img.onload = () => {
          clearTimeout(timeout);
          resolve({ blobUrl: objectUrl, base64Thumb: generateThumbnailFromSource(img), color: extractDominantColor(img), autoType });
        };
        img.onerror = () => { clearTimeout(timeout); resolve({ blobUrl: objectUrl, base64Thumb: '', color: fallbackColor, autoType }); };
        img.src = objectUrl;
      } else if (isVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        const timeout = setTimeout(() => resolve({ blobUrl: objectUrl, base64Thumb: '', color: fallbackColor, autoType }), 10000);
        video.onloadedmetadata = () => { video.currentTime = 0.5; };
        video.onseeked = () => {
          clearTimeout(timeout);
          resolve({ blobUrl: objectUrl, base64Thumb: generateThumbnailFromSource(video), color: extractDominantColor(video as any), autoType });
          video.remove();
        };
        video.src = objectUrl;
      } else {
        resolve({ blobUrl: objectUrl, base64Thumb: '', color: fallbackColor, autoType });
      }
    });
  };
  const resetForm = useCallback(() => {
    cleanupObjectUrls();
    setLivePreviewUrl('');
    if (initialData) {
      setContent(initialData.content);
      setType(initialData.type);
      setMediaUrl(initialData.mediaUrl || '');
      setPreviewUrl(initialData.previewUrl || '');
      setDominantColor(initialData.dominantColor || '');
      setCurrentFileName(initialData.fileName || '');
      setDate(initialData.date);
      setSignatureCaptured(!!initialData.previewUrl);
    } else {
      setContent('');
      setType('text');
      setMediaUrl('');
      setPreviewUrl('');
      setDominantColor('');
      setCurrentFileName('');
      setDate(new Date().toISOString().split('T')[0]);
      setSignatureCaptured(false);
    }
    setIsProcessing(false);
  }, [initialData, cleanupObjectUrls]);
  useEffect(() => { if (isOpen) resetForm(); }, [isOpen, resetForm]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCurrentFileName(file.name);
    setIsProcessing(true);
    setSignatureCaptured(false);
    try {
      const { blobUrl, base64Thumb, color, autoType } = await generateSignature(file);
      setLivePreviewUrl(blobUrl);
      setPreviewUrl(base64Thumb);
      setDominantColor(color);
      setType(autoType); // Automatically set detected type
      setSignatureCaptured(true);
      toast.success(`${autoType.charAt(0).toUpperCase() + autoType.slice(1)} signature captured.`);
    } catch (err) {
      toast.error("Failed to process local preview.");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    const newId = initialData?.id || uuidv4();
    const entryData: MemoryEntry = {
      id: newId,
      content: content.trim(),
      type,
      mediaUrl: type === 'text' ? undefined : (mediaUrl || undefined),
      previewUrl: type === 'text' ? undefined : (previewUrl || undefined),
      dominantColor: type === 'text' ? undefined : (dominantColor || undefined),
      fileName: type === 'text' ? undefined : (currentFileName || undefined),
      date: date
    };
    try {
      const res = await fetch(initialData ? `/api/memories/${initialData.id}` : '/api/memories', {
        method: initialData ? 'PUT' : 'POST',
        body: JSON.stringify(entryData),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        localStorage.setItem('recent_memory_id', newId);
        toast.success("Archive updated.");
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
          <DialogDescription className="text-muted-foreground italic">Threads in our shared journey.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2 font-bold">
              <Calendar className="w-3 h-3" /> Genesis of this Moment
            </Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white rounded-xl border-peach/10 h-12" required />
          </div>
          <div className="space-y-2">
            <Textarea placeholder="The narrative..." className="min-h-[140px] bg-white rounded-2xl border-peach/10 font-serif text-lg p-5 leading-relaxed shadow-inner" value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Medium</Label>
            <div className="grid grid-cols-4 gap-2">
              {[ { id: 'text', label: 'Letter', icon: Type }, { id: 'image', label: 'Photo', icon: ImageIcon }, { id: 'video', label: 'Video', icon: Video }, { id: 'audio', label: 'Audio', icon: Music } ].map((item) => (
                <Button key={item.id} type="button" variant={type === item.id ? 'default' : 'outline'} className={cn("flex flex-col gap-1.5 h-auto py-3 rounded-2xl", type === item.id ? "bg-peach text-white" : "bg-white border-peach/10")} onClick={() => setType(item.id as MemoryType)}>
                  <item.icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          {type !== 'text' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Input placeholder={`Direct URL to ${type}...`} className="bg-white rounded-xl border-peach/20 h-12" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
                <div className="flex gap-2 p-3 bg-peach/5 rounded-lg border border-peach/10"><Info className="w-4 h-4 text-peach" /><p className="text-[10px] text-muted-foreground">URL ensures permanent high-res display.</p></div>
              </div>
              <div onClick={() => !isProcessing && fileInputRef.current?.click()} className={cn("relative border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer", signatureCaptured ? "border-green-200 bg-green-50/30" : "bg-white border-peach/10")}>
                {isProcessing ? <Loader2 className="w-6 h-6 text-peach animate-spin" /> : signatureCaptured ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Upload className="w-6 h-6 text-peach/40" />}
                <p className="text-xs font-bold text-foreground/80">{isProcessing ? "Processing..." : signatureCaptured ? "Signature Captured" : `Select ${type} for signature`}</p>
                <input type="file" ref={fileInputRef} className="hidden" accept={type === 'audio' ? 'audio/*' : type === 'video' ? 'video/*' : 'image/*'} onChange={handleFileChange} disabled={isProcessing} />
              </div>
            </div>
          )}
          <Button type="submit" className="w-full py-8 rounded-2xl bg-peach hover:bg-peach-dark text-white font-serif text-xl shadow-xl" disabled={isSubmitting || isProcessing || !content.trim()}>
            {isSubmitting ? "Preserving..." : "Seal in Archive"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}