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
import { CheckCircle2, Feather, ImageIcon, Video, Music, Type, Upload, Calendar, Loader2, AlertCircle } from 'lucide-react';
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
    objectUrlsRef.current.push(objectUrl);
    setLocalPreviewUrl(objectUrl);
    setIsProcessing(true);
    try {
      const typeStr = file.type.toLowerCase();
      const ext = file.name.toLowerCase().split('.').pop() || '';
      const videoExts = ['mp4','webm','mov','avi','mkv'];
      const predictedType: MemoryType = (typeStr.startsWith('video/') || videoExts.includes(ext)) ? 'video' : typeStr.startsWith('audio/') ? 'audio' : 'image';
      const signature = await new Promise<{ thumb: string; color: string }>((resolve) => {
        const fallback = predictedType === 'video' ? '#A1C4FD' : predictedType === 'audio' ? '#FF9A9E' : '#FDFBF7';
        if (predictedType === 'image') {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = 400 / Math.max(img.width, img.height);
            canvas.width = img.width * scale; canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const colorData = ctx?.getImageData(0,0,1,1).data;
            const color = colorData ? `#${colorData[0].toString(16).padStart(2,'0')}${colorData[1].toString(16).padStart(2,'0')}${colorData[2].toString(16).padStart(2,'0')}` : fallback;
            resolve({ thumb: canvas.toDataURL('image/jpeg', 0.7), color });
          };
          img.onerror = () => resolve({ thumb: '', color: fallback });
          img.src = objectUrl;
        } else if (predictedType === 'video') {
          const video = document.createElement('video');
          video.preload = 'metadata'; video.muted = true; video.src = objectUrl;
          video.onloadedmetadata = () => { video.currentTime = 0.5; };
          video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth / 2; canvas.height = video.videoHeight / 2;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve({ thumb: canvas.toDataURL('image/jpeg', 0.7), color: '#A1C4FD' });
          };
          video.onerror = () => resolve({ thumb: '', color: fallback });
        } else resolve({ thumb: '', color: fallback });
      });
      setPreviewUrl(signature.thumb);
      setDominantColor(signature.color);
      setType(predictedType);
      setSignatureCaptured(true);
    } catch { toast.error("Processing failed."); } finally { setIsProcessing(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      let finalMediaUrl = mediaUrl;
      let isPersisted = !!mediaUrl;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await fetch('/api/memories/upload', { method: 'POST', body: formData });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.data?.url) {
          finalMediaUrl = uploadJson.data.url;
          isPersisted = true;
        } else {
          isPersisted = false;
          finalMediaUrl = ''; 
        }
      }
      const entryData: MemoryEntry = {
        id: initialData?.id || uuidv4(),
        content: content.trim(),
        type,
        date,
        mediaUrl: type === 'text' ? undefined : (finalMediaUrl || undefined),
        previewUrl: type === 'text' ? undefined : (previewUrl || undefined),
        dominantColor: type === 'text' ? undefined : (dominantColor || undefined),
        fileName: type === 'text' ? undefined : (currentFileName || undefined),
      };
      const res = await fetch(initialData ? `/api/memories/${initialData.id}` : '/api/memories', {
        method: initialData ? 'PUT' : 'POST',
        body: JSON.stringify(entryData),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success(type !== 'text' && !isPersisted ? "Signature archived successfully." : "Memory sealed eternally.");
        onOpenChange(false);
        onSuccess();
      } else throw new Error();
    } catch { toast.error("Write failed. Please check connectivity."); } finally { setIsSubmitting(false); }
  };
  const isFormValid = content.trim().length > 0 && (type === 'text' || mediaUrl.trim().length > 0 || signatureCaptured);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isSubmitting) onOpenChange(open); }}>
      <DialogContent className="sm:max-w-lg rounded-[2.5rem] bg-warm-white border-none shadow-2xl max-h-[90vh] overflow-y-auto outline-none">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Feather className="w-5 h-5 text-peach" />
            {initialData ? 'Refining a Memory' : 'Pen a New Memory'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground italic font-medium">Threads in our shared journey.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex gap-2">
              <Calendar className="w-3 h-3" /> Genesis of this Moment
            </Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white rounded-xl border-peach/10 h-12 focus-visible:ring-peach/20" required />
          </div>
          <div className="space-y-2">
            <Textarea placeholder="The narrative..." className="min-h-[140px] bg-white rounded-2xl border-peach/10 font-serif text-lg p-5 leading-relaxed focus-visible:ring-peach/20" value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Medium</Label>
            <div className="grid grid-cols-4 gap-2">
              {[ { id: 'text', label: 'Letter', icon: Type }, { id: 'image', label: 'Photo', icon: ImageIcon }, { id: 'video', label: 'Video', icon: Video }, { id: 'audio', label: 'Audio', icon: Music } ].map((item) => (
                <Button key={item.id} type="button" variant={type === item.id ? 'default' : 'outline'} className={cn("flex flex-col gap-1.5 h-auto py-3 rounded-2xl border-peach/10 transition-all duration-300", type === item.id ? "bg-peach text-white shadow-md scale-105" : "bg-white hover:bg-peach/5")} onClick={() => { setType(item.id as MemoryType); if (item.id === 'text') { setMediaUrl(''); setCurrentFileName(''); setSignatureCaptured(false); cleanupObjectUrls(); } }}>
                  <item.icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          {type !== 'text' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <Input placeholder={`Direct URL to ${type}...`} className="bg-white rounded-xl border-peach/20 h-12 focus-visible:ring-peach/20" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
              <div onClick={() => !isProcessing && fileInputRef.current?.click()} className={cn("relative border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden min-h-[160px] transition-all duration-500", signatureCaptured ? "border-green-200 bg-green-50/30" : "bg-white border-peach/10 hover:border-peach/30")}>
                {localPreviewUrl && type === 'video' ? (
                  <video src={localPreviewUrl} muted className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" autoPlay loop playsInline />
                ) : localPreviewUrl && type === 'image' && (
                  <img src={localPreviewUrl} alt="Local" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" />
                )}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  {isProcessing ? <Loader2 className="w-6 h-6 text-peach animate-spin" /> : signatureCaptured ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Upload className="w-6 h-6 text-peach/40" />}
                  <p className="text-xs font-bold text-foreground/80">{isProcessing ? "Processing..." : signatureCaptured ? "Signature Captured" : `Select ${type} for signature`}</p>
                </div>
                {previewUrl && <img src={previewUrl} className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-lg relative z-10 scale-110" alt="Captured" />}
                <input type="file" ref={fileInputRef} className="hidden" accept={type === 'audio' ? 'audio/*' : type === 'video' ? 'video/*' : 'image/*'} onChange={handleFileChange} disabled={isProcessing} />
              </div>
              {!mediaUrl && !signatureCaptured && <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Provide a link or file signature</p>}
            </div>
          )}
          <Button type="submit" className="w-full py-8 rounded-2xl bg-peach hover:bg-peach-dark text-white font-serif text-xl shadow-xl flex gap-2 transition-all active:scale-[0.98]" disabled={isSubmitting || isProcessing || !isFormValid}>
            {isSubmitting ? <><Loader2 className="w-6 h-6 animate-spin" /><span>Preserving...</span></> : "Seal in Archive"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}