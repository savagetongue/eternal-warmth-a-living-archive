import { DurableObject } from "cloudflare:workers";
import type { MemoryEntry, DemoItem } from '../shared/types';
const INITIAL_MEMORIES: MemoryEntry[] = [
  {
    id: '1',
    content: "The day it all began. A moment frozen in time, the start of our eternal archive.",
    date: '2023-09-02',
    type: 'text'
  },
  {
    id: '2',
    content: "Watching the sunset and realizing that every tomorrow belongs to us.",
    date: '2023-09-15',
    type: 'text'
  },
  {
    id: '3',
    content: "A beautiful memory captured.",
    date: '2023-10-10',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800',
    dominantColor: '#FDFBF7'
  }
];
export class GlobalDurableObject extends DurableObject {
    async getMemories(): Promise<MemoryEntry[]> {
      const memories = await this.ctx.storage.get("memories");
      if (memories) {
        const cleaned = (memories as any[]).map((m) => {
          const { mood, ...rest } = m;
          if (!rest.date) {
            rest.date = new Date().toISOString().split('T')[0];
          }
          // Migration: Ensure legacy memories have a default dominant color if not present
          if (rest.type !== 'text' && !rest.dominantColor) {
            rest.dominantColor = '#F9F3E5';
          }
          return rest;
        });
        // Sort ascending: Oldest memories first
        cleaned.sort((a, b) => a.date.localeCompare(b.date));
        return cleaned as MemoryEntry[];
      }
      const initial = [...INITIAL_MEMORIES].sort((a, b) => a.date.localeCompare(b.date));
      await this.ctx.storage.put("memories", initial);
      return initial;
    }
    async addMemory(entry: MemoryEntry): Promise<MemoryEntry[]> {
      const memories = await this.getMemories();
      const updated = [...memories, entry];
      // Sort ascending to maintain chronological growth
      updated.sort((a, b) => a.date.localeCompare(b.date));
      await this.ctx.storage.put("memories", updated);
      return updated;
    }
    async updateMemory(id: string, updates: Partial<Omit<MemoryEntry, "id">>): Promise<MemoryEntry[]> {
      const memories = await this.getMemories();
      const index = memories.findIndex(m => m.id === id);
      if (index !== -1) {
        memories[index] = { ...memories[index], ...updates };
        // Re-sort after potential date update to keep chronological order
        memories.sort((a, b) => a.date.localeCompare(b.date));
        await this.ctx.storage.put("memories", memories);
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