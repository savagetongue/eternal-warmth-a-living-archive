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
import { CheckCircle2, Feather, ImageIcon, Video, Music, Type, Upload, Calendar, Loader2 } from 'lucide-react';
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
  const [dominantColor, setDominantColor] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const cleanupObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
    objectUrlsRef.current = [];
  }, []);

  const getMediaType = (file: File): MemoryType => {
    const type = file.type.toLowerCase();
    const ext = file.name.toLowerCase().split('.').pop() || '';
    
    const videoExts = ['mp4','webm','mov','avi','mkv','3gp','flv','wmv','ogv'];
    const audioExts = ['mp3','wav','aac','m4a','ogg','flac','wma'];
    const imageExts = ['jpg','jpeg','png','gif','webp','bmp','tiff','svg','heic'];
    
    if (type.startsWith('video/') || videoExts.includes(ext)) return 'video';
    if (type.startsWith('audio/') || audioExts.includes(ext)) return 'audio';
    if (type.startsWith('image/') || imageExts.includes(ext)) return 'image';
    return 'image';
  };
  const extractDominantColor = (img: HTMLImageElement | HTMLCanvasElement): string => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1; canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '#FDFBF7';
      ctx.drawImage(img, 0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const toHex = (c: number) => c.toString(16).padStart(2, '0');
      return `#${toHex(data[0])}${toHex(data[1])}${toHex(data[2])}`;
    } catch { return '#FDFBF7'; }
  };
  const generateThumbnailFromSource = (source: HTMLImageElement | HTMLVideoElement): string => {
    try {
      const canvas = document.createElement('canvas');
      const sourceWidth = 'videoWidth' in source ? source.videoWidth : source.naturalWidth || source.width || 400;
      const sourceHeight = 'videoHeight' in source ? source.videoHeight : source.naturalHeight || source.height || 225;
      const targetWidth = Math.min(800, sourceWidth);
      const scaleFactor = targetWidth / sourceWidth;
      const targetHeight = Math.floor(sourceHeight * scaleFactor);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
      // High fidelity signature capture
      return canvas.toDataURL('image/jpeg', 0.95);
    } catch { return ''; }
  };
  const generateSignature = (file: File, predictedType: MemoryType): Promise<{ base64Thumb: string; color: string; }> => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(objectUrl);
      const fallbackColor = predictedType === 'video' ? '#A1C4FD' : predictedType === 'audio' ? '#FF9A9E' : '#FDFBF7';
      if (predictedType === 'image') {
        const img = new Image();
        const timeout = setTimeout(() => resolve({ base64Thumb: '', color: fallbackColor }), 5000);
        img.onload = () => {
          clearTimeout(timeout);
          resolve({ base64Thumb: generateThumbnailFromSource(img), color: extractDominantColor(img) });
        };
        img.onerror = () => { clearTimeout(timeout); resolve({ base64Thumb: '', color: fallbackColor }); };
        img.src = objectUrl;
      } else if (predictedType === 'video') {
        const video = document.createElement('video');
        video.preload = 'metadata'; video.muted = true;
        const timeout = setTimeout(() => resolve({ base64Thumb: '', color: fallbackColor }), 10000);
        video.onloadedmetadata = () => {
          // Seek to 0.5s to get a meaningful frame
          video.currentTime = 0.5;
        };
        video.onseeked = () => {
          clearTimeout(timeout);
          resolve({
            base64Thumb: generateThumbnailFromSource(video),
            color: extractDominantColor(video as any)
          });
          video.remove();
        };
        video.onerror = () => {
          clearTimeout(timeout);
          resolve({ base64Thumb: '', color: fallbackColor });
        };
        video.src = objectUrl;
      } else {
        resolve({ base64Thumb: '', color: fallbackColor });
      }
    });
  };
  const resetForm = useCallback(() => {
    cleanupObjectUrls();
    setSelectedFile(null);
    if (initialData) {
      setContent(initialData.content); setType(initialData.type);
      setMediaUrl(initialData.mediaUrl || ''); setPreviewUrl(initialData.previewUrl || '');
      setDominantColor(initialData.dominantColor || ''); setCurrentFileName(initialData.fileName || '');
      setDate(initialData.date); setSignatureCaptured(!!initialData.previewUrl);
    } else {
      setContent(''); setType('text'); setMediaUrl(''); setPreviewUrl(''); setDominantColor('');
      setCurrentFileName(''); setDate(new Date().toISOString().split('T')[0]); setSignatureCaptured(false);
    }
    setIsProcessing(false);
  }, [initialData, cleanupObjectUrls]);
  useEffect(() => { if (isOpen) resetForm(); }, [isOpen, resetForm]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    cleanupObjectUrls();
    setSelectedFile(file); setCurrentFileName(file.name);
    setIsProcessing(true); setSignatureCaptured(false);
    try {
      const predictedType = getMediaType(file);
      const { base64Thumb: previewDataUrl, color: dominantColorFromSig } = await generateSignature(file, predictedType);
      setPreviewUrl(previewDataUrl); setDominantColor(dominantColorFromSig);
      setType(predictedType); setSignatureCaptured(true);
      toast.success(`${predictedType.charAt(0).toUpperCase() + predictedType.slice(1)} signature captured.`);
    } catch { toast.error("Processing failed."); } finally { setIsProcessing(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    let finalMediaUrl = mediaUrl;
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await fetch('/api/memories/upload', { method: 'POST', body: formData });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.data?.url) finalMediaUrl = uploadJson.data.url;
      }
      const newId = initialData?.id || uuidv4();
      const entryData: MemoryEntry = {
        id: newId, content: content.trim(), type,
        mediaUrl: type === 'text' ? undefined : (finalMediaUrl || undefined),
        previewUrl: type === 'text' ? undefined : (previewUrl || undefined),
        dominantColor: type === 'text' ? undefined : (dominantColor || undefined),
        fileName: type === 'text' ? undefined : (currentFileName || undefined),
        date: date
      };
      const res = await fetch(initialData ? `/api/memories/${initialData.id}` : '/api/memories', {
        method: initialData ? 'PUT' : 'POST',
        body: JSON.stringify(entryData),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success("Archive updated.");
        onOpenChange(false);
        onSuccess();
      } else throw new Error("Write failed");
    } catch { toast.error("Connection lost."); } finally { setIsSubmitting(false); }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-[2.5rem] bg-warm-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2"><Feather className="w-5 h-5 text-peach" />{initialData ? 'Refining a Memory' : 'Pen a New Memory'}</DialogTitle>
          <DialogDescription className="text-muted-foreground italic">Threads in our shared journey.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2 font-bold"><Calendar className="w-3 h-3" /> Genesis of this Moment</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white rounded-xl border-peach/10 h-12" required /></div>
          <div className="space-y-2"><Textarea placeholder="The narrative..." className="min-h-[140px] bg-white rounded-2xl border-peach/10 font-serif text-lg p-5 leading-relaxed shadow-inner" value={content} onChange={(e) => setContent(e.target.value)} required /></div>
          <div className="space-y-3"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Medium</Label><div className="grid grid-cols-4 gap-2">{[ { id: 'text', label: 'Letter', icon: Type }, { id: 'image', label: 'Photo', icon: ImageIcon }, { id: 'video', label: 'Video', icon: Video }, { id: 'audio', label: 'Audio', icon: Music } ].map((item) => (<Button key={item.id} type="button" variant={type === item.id ? 'default' : 'outline'} className={cn("flex flex-col gap-1.5 h-auto py-3 rounded-2xl", type === item.id ? "bg-peach text-white" : "bg-white border-peach/10")} onClick={() => setType(item.id as MemoryType)}><item.icon className="w-4 h-4" /><span className="text-[10px] font-bold">{item.label}</span></Button>))}</div></div>
          {type !== 'text' && (
            <div className="space-y-5">
              <Input placeholder={`Direct URL to ${type}...`} className="bg-white rounded-xl border-peach/20 h-12" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
              <div onClick={() => !isProcessing && fileInputRef.current?.click()} className={cn("relative border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer", signatureCaptured ? "border-green-200 bg-green-50/30" : "bg-white border-peach/10")}>
                {isProcessing ? <Loader2 className="w-6 h-6 text-peach animate-spin" /> : signatureCaptured ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Upload className="w-6 h-6 text-peach/40" />}
                <p className="text-xs font-bold text-foreground/80">{isProcessing ? "Processing..." : signatureCaptured ? "Signature Captured" : `Select ${type} for signature`}</p>
                <input type="file" ref={fileInputRef} className="hidden" accept={type === 'audio' ? 'audio/*' : type === 'video' ? 'video/*' : 'image/*'} onChange={handleFileChange} disabled={isProcessing} />
              </div>
            </div>
          )}
          <Button type="submit" className="w-full py-8 rounded-2xl bg-peach hover:bg-peach-dark text-white font-serif text-xl shadow-xl flex items-center justify-center gap-2" disabled={isSubmitting || isProcessing || !content.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Preserving...</span>
              </>
            ) : "Seal in Archive"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}