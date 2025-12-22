import { DurableObject } from "cloudflare:workers";
import type { MemoryEntry, DemoItem } from '../shared/types';
const INITIAL_MEMORIES: MemoryEntry[] = [
  {
    id: 'seed-1',
    content: "02-09-2023. The day the world changed. A single glance, and I knew every chapter of my life from here on would be written with you.",
    date: '2023-09-02',
    type: 'text'
  },
  {
    id: 'seed-2',
    content: "Our first shared coffee. The steam rose in the morning light, mirroring the quiet warmth growing between us.",
    date: '2023-09-15',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
    dominantColor: '#F9F3E5'
  },
  {
    id: 'seed-3',
    content: "The way you laugh when you think no one is watching. It's the most beautiful symphony I've ever heard.",
    date: '2023-10-10',
    type: 'audio',
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    dominantColor: '#FECFEF',
    fileName: 'Your_Laughter_Oct_2023.mp3'
  },
  {
    id: 'seed-4',
    content: "Autumn leaves in the park. We walked for hours, talking about everything and nothing at all.",
    date: '2023-11-05',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    dominantColor: '#FF9A9E'
  },
  {
    id: 'seed-5',
    content: "A quiet moment by the window. The city moves fast, but here, time stands perfectly still for us.",
    date: '2023-12-20',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sunlight-streaming-through-a-window-onto-a-wall-41372-large.mp4',
    dominantColor: '#A1C4FD'
  }
];
export class GlobalDurableObject extends DurableObject {
    private async sortMemories(memories: MemoryEntry[]): Promise<MemoryEntry[]> {
      return [...memories].sort((a, b) => {
        const parseDate = (d: string) => {
          const parsed = new Date(d).getTime();
          return isNaN(parsed) ? 0 : parsed;
        };
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateA - dateB;
      });
    }
    async getMemories(): Promise<MemoryEntry[]> {
      const memories = await this.ctx.storage.get("memories");
      if (memories) {
        const cleaned = (memories as any[]).map((m) => {
          // Explicitly preserve visual signatures and metadata during deserialization
          const entry: MemoryEntry = {
            id: m.id,
            content: m.content || "",
            date: m.date || new Date().toISOString().split('T')[0],
            type: m.type || 'text',
            mediaUrl: m.mediaUrl,
            previewUrl: m.previewUrl, // Hardened: Ensure previewUrl is strictly mapped
            dominantColor: m.dominantColor,
            fileName: m.fileName
          };
          if (entry.type !== 'text' && (!entry.dominantColor || !entry.dominantColor.startsWith('#'))) {
            entry.dominantColor = entry.dominantColor || '#FDFBF7';
          }
          return entry;
        });
        return await this.sortMemories(cleaned);
      }
      const initial = await this.sortMemories([...INITIAL_MEMORIES]);
      await this.ctx.storage.put("memories", initial);
      return initial;
    }
    async addMemory(entry: MemoryEntry): Promise<MemoryEntry[]> {
      if (!entry.content?.trim()) {
        throw new Error("Archive entries cannot be empty of narrative.");
      }
      // Ensure visual signature integrity before saving
      const sanitizedEntry: MemoryEntry = {
        ...entry,
        previewUrl: entry.previewUrl || undefined,
        dominantColor: entry.dominantColor || undefined,
        fileName: entry.fileName || undefined
      };
      const memories = await this.getMemories();
      const updated = await this.sortMemories([...memories, sanitizedEntry]);
      await this.ctx.storage.put("memories", updated);
      return updated;
    }
    async updateMemory(id: string, updates: Partial<Omit<MemoryEntry, "id">>): Promise<MemoryEntry[]> {
      if (updates.content !== undefined && !updates.content.trim()) {
        throw new Error("Archive entries cannot be empty of narrative.");
      }
      const memories = await this.getMemories();
      const index = memories.findIndex(m => m.id === id);
      if (index !== -1) {
        // Merge updates carefully to not lose previewUrl if not provided in the patch
        memories[index] = { ...memories[index], ...updates };
        const updated = await this.sortMemories(memories);
        await this.ctx.storage.put("memories", updated);
        return updated;
      }
      return memories;
    }
    async deleteMemory(id: string): Promise<MemoryEntry[]> {
      const memories = await this.getMemories();
      const updated = memories.filter(m => m.id !== id);
      await this.ctx.storage.put("memories", updated);
      return updated;
    }
    async getCounterValue(): Promise<number> {
      return (await this.ctx.storage.get("counter_value")) || 0;
    }
    async increment(): Promise<number> {
      let v: number = (await this.ctx.storage.get("counter_value")) || 0;
      v++;
      await this.ctx.storage.put("counter_value", v);
      return v;
    }
    async getDemoItems(): Promise<DemoItem[]> { return []; }
    async addDemoItem(item: any) { return []; }
    async updateDemoItem(id: string, updates: any) { return []; }
    async deleteDemoItem(id: string) { return []; }
}