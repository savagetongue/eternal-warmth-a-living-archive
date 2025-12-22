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
  },
  {
    id: 'seed-6',
    content: "The first snow of the year. You caught a snowflake on your glove and showed it to me like it was a diamond.",
    date: '2024-01-12',
    type: 'text'
  },
  {
    id: 'seed-7',
    content: "To Sakshi: In every timeline, in every universe, my heart would find its way back to yours.",
    date: '2024-02-14',
    type: 'text'
  },
  {
    id: 'seed-8',
    content: "Spring blossoms. Life is renewing itself all around us, just as our love grows deeper with every passing season.",
    date: '2024-03-25',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=800',
    dominantColor: '#FECFEF'
  },
  {
    id: 'seed-9',
    content: "The song that played on the radio during our long drive. It’s now the soundtrack to my happiest memories.",
    date: '2024-05-18',
    type: 'audio',
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    dominantColor: '#A1C4FD',
    fileName: 'Roadtrip_Melody.mp3'
  },
  {
    id: 'seed-10',
    content: "Summer sunsets. The sky was painted in shades of us��bold, warm, and infinitely beautiful.",
    date: '2024-07-04',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-moving-fast-during-a-sunset-173-large.mp4',
    dominantColor: '#FF9A9E'
  },
  {
    id: 'seed-11',
    content: "One year of 'Us'. 365 days of learning your favorite things, and falling in love with the way you see the world.",
    date: '2024-09-02',
    type: 'text'
  },
  {
    id: 'seed-12',
    content: "Finding peace in the mountains. The air was cold, but your hand in mine was all the warmth I needed.",
    date: '2024-11-15',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    dominantColor: '#A1C4FD'
  },
  {
    id: 'seed-13',
    content: "A letter from the heart: You are the anchor in my storm and the light in my morning.",
    date: '2024-12-31',
    type: 'text'
  },
  {
    id: 'seed-14',
    content: "Starting 2025 by your side. Every new year is just another chance to love you more than the last.",
    date: '2025-01-01',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1514525253344-f81f3f74412f?auto=format&fit=crop&q=80&w=800',
    dominantColor: '#FF9A9E'
  },
  {
    id: 'seed-15',
    content: "The quiet rhythm of a rainy afternoon. Just you, me, and the sound of the world slowing down.",
    date: '2025-03-10',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-pane-1522-large.mp4',
    dominantColor: '#F9F3E5'
  },
  {
    id: 'seed-16',
    content: "Shared dreams of a small cottage with a blue door. It's not just a house; it's the future I see with you.",
    date: '2025-04-05',
    type: 'text'
  },
  {
    id: 'seed-17',
    content: "The tiny kindnesses you show every day—the extra sugar in my tea, the way you adjust my scarf. These are the true monuments of our love.",
    date: '2025-05-12',
    type: 'text'
  },
  {
    id: 'seed-18',
    content: "Promises made under the midnight sky. Some spoken, some felt in the silence between our heartbeats.",
    date: '2025-06-20',
    type: 'text'
  },
  {
    id: 'seed-19',
    content: "Learning to bridge our differences. Every compromise is a bridge built towards a stronger 'Us'.",
    date: '2025-07-08',
    type: 'text'
  },
  {
    id: 'seed-20',
    content: "To many more years of this beautiful unfolding. You are my favorite story, and I can't wait to read the next chapter.",
    date: '2025-08-30',
    type: 'text'
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
          const { mood, ...rest } = m;
          if (!rest.date) {
            rest.date = new Date().toISOString().split('T')[0];
          }
          if (rest.type !== 'text' && (!rest.dominantColor || !rest.dominantColor.startsWith('#'))) {
            rest.dominantColor = rest.dominantColor || '#FDFBF7';
          }
          return rest as MemoryEntry;
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
      const memories = await this.getMemories();
      const updated = await this.sortMemories([...memories, entry]);
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