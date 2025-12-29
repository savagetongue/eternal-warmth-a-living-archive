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
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const cleanupObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
    objectUrlsRef.current = [];
    setLocalPreviewUrl('');
  }, []);
  const getMediaType = (file: File): MemoryType => {
    const typeStr = file.type.toLowerCase();
    const ext = file.name.toLowerCase().split('.').pop() || '';
    const videoExts = ['mp4','webm','mov','avi','mkv','3gp','flv','wmv','ogv'];
    const audioExts = ['mp3','wav','aac','m4a','ogg','flac','wma'];
    if (typeStr.startsWith('video/') || videoExts.includes(ext)) return 'video';
    if (typeStr.startsWith('audio/') || audioExts.includes(ext)) return 'audio';
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
      return `#${data[0].toString(16).padStart(2, '0')}${data[1].toString(16).padStart(2, '0')}${data[2].toString(16).padStart(2, '0')}`;
    } catch { return '#FDFBF7'; }
  };
  const generateSignature = (file: File, predictedType: MemoryType): Promise<{ base64Thumb: string; color: string; }> => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(objectUrl);
      const fallbackColor = predictedType === 'video' ? '#A1C4FD' : predictedType === 'audio' ? '#FF9A9E' : '#FDFBF7';
      if (predictedType === 'image') {
        const img = new Image();
        img.onload = () => resolve({
          base64Thumb: (() => {
            const canvas = document.createElement('canvas');
            const scale = 400 / Math.max(img.width, img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.8);
          })(),
          color: extractDominantColor(img)
        });
        img.onerror = () => resolve({ base64Thumb: '', color: fallbackColor });
        img.src = objectUrl;
      } else if (predictedType === 'video') {
        const video = document.createElement('video');
        video.preload = 'metadata'; video.muted = true; video.playsInline = true;
        video.onloadedmetadata = () => { video.currentTime = 0.5; };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth / 2; canvas.height = video.videoHeight / 2;
          canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve({ base64Thumb: canvas.toDataURL('image/jpeg', 0.8), color: extractDominantColor(video as any) });
        };
        video.onerror = () => resolve({ base64Thumb: '', color: fallbackColor });
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
  }, [initialData, cleanupObjectUrls]);
  useEffect(() => { if (isOpen) resetForm(); }, [isOpen, resetForm]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    cleanupObjectUrls();
    setSelectedFile(file);
    setCurrentFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setIsProcessing(true);
    try {
      const predictedType = getMediaType(file);
      const { base64Thumb, color } = await generateSignature(file, predictedType);
      setPreviewUrl(base64Thumb); setDominantColor(color);
      setType(predictedType); setSignatureCaptured(true);
    } catch { toast.error("Processing failed."); } finally { setIsProcessing(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    let finalMediaUrl = mediaUrl;
    let isPersisted = !!mediaUrl;
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await fetch('/api/memories/upload', { method: 'POST', body: formData });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.data?.url) {
          finalMediaUrl = uploadJson.data.url;
          isPersisted = true;
        } else if (uploadJson.data?.status === 'sandbox') {
          finalMediaUrl = ''; // Clear mediaUrl to trigger signature fallback in MemoryCard
          isPersisted = false;
        }
      }
      const entryData: MemoryEntry = {
        id: initialData?.id || uuidv4(), content: content.trim(), type,
        mediaUrl: type === 'text' ? undefined : (finalMediaUrl || undefined),
        previewUrl: type === 'text' ? undefined : (previewUrl || undefined),
        dominantColor: type === 'text' ? undefined : (dominantColor || undefined),
        fileName: type === 'text' ? undefined : (currentFileName || undefined),
        date
      };
      const res = await fetch(initialData ? `/api/memories/${initialData.id}` : '/api/memories', {
        method: initialData ? 'PUT' : 'POST',
        body: JSON.stringify(entryData),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) { 
        if (type !== 'text' && !isPersisted) {
          toast.success("Signature captured for the archive.");
        } else {
          toast.success("Memory sealed in the archive."); 
        }
        onOpenChange(false); 
        onSuccess(); 
      }
      else throw new Error("Write failed");
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
          <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex gap-2"><Calendar className="w-3 h-3" /> Genesis of this Moment</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white rounded-xl border-peach/10 h-12" required /></div>
          <div className="space-y-2"><Textarea placeholder="The narrative..." className="min-h-[140px] bg-white rounded-2xl border-peach/10 font-serif text-lg p-5 leading-relaxed" value={content} onChange={(e) => setContent(e.target.value)} required /></div>
          <div className="space-y-3"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Medium</Label><div className="grid grid-cols-4 gap-2">{[ { id: 'text', label: 'Letter', icon: Type }, { id: 'image', label: 'Photo', icon: ImageIcon }, { id: 'video', label: 'Video', icon: Video }, { id: 'audio', label: 'Audio', icon: Music } ].map((item) => (<Button key={item.id} type="button" variant={type === item.id ? 'default' : 'outline'} className={cn("flex flex-col gap-1.5 h-auto py-3 rounded-2xl", type === item.id ? "bg-peach text-white" : "bg-white border-peach/10")} onClick={() => setType(item.id as MemoryType)}><item.icon className="w-4 h-4" /><span className="text-[10px] font-bold">{item.label}</span></Button>))}</div></div>
          {type !== 'text' && (
            <div className="space-y-5">
              <Input placeholder={`Direct URL to ${type}...`} className="bg-white rounded-xl border-peach/20 h-12" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
              <div onClick={() => !isProcessing && fileInputRef.current?.click()} className={cn("relative border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden min-h-[160px]", signatureCaptured ? "border-green-200 bg-green-50/30" : "bg-white border-peach/10")}>
                {localPreviewUrl && type === 'video' ? (
                  <video src={localPreviewUrl} muted className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" autoPlay loop playsInline />
                ) : localPreviewUrl && type === 'image' && (
                  <img src={localPreviewUrl} alt="Local" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
                )}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  {isProcessing ? <Loader2 className="w-6 h-6 text-peach animate-spin" /> : signatureCaptured ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Upload className="w-6 h-6 text-peach/40" />}
                  <p className="text-xs font-bold text-foreground/80">{isProcessing ? "Processing..." : signatureCaptured ? "Signature Captured" : `Select ${type} for signature`}</p>
                </div>
                {previewUrl && <img src={previewUrl} className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md relative z-10" alt="Captured" />}
                <input type="file" ref={fileInputRef} className="hidden" accept={type === 'audio' ? 'audio/*' : type === 'video' ? 'video/*' : 'image/*'} onChange={handleFileChange} disabled={isProcessing} />
                {type === 'video' && <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-tighter relative z-10">Videos &lt;5MB preserved in preview</p>}
              </div>
            </div>
          )}
          <Button type="submit" className="w-full py-8 rounded-2xl bg-peach hover:bg-peach-dark text-white font-serif text-xl shadow-xl flex gap-2" disabled={isSubmitting || isProcessing || !content.trim()}>
            {isSubmitting ? <><Loader2 className="w-6 h-6 animate-spin" /><span>Preserving...</span></> : "Seal in Archive"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}