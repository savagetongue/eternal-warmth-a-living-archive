import { DurableObject } from "cloudflare:workers";
import type { MemoryEntry, DemoItem, MemoryType } from '../shared/types';
const MEM_PREFIX = "mem:";
export class GlobalDurableObject extends DurableObject {
    private validateEntry(entry: MemoryEntry) {
      const validTypes: MemoryType[] = ['text', 'image', 'video', 'audio'];
      if (!validTypes.includes(entry.type)) {
        throw new Error(`Invalid memory type: ${entry.type}`);
      }
      if (entry.type !== 'text' && !entry.mediaUrl && !entry.fileName) {
        throw new Error(`Media entries must have a source URL or file signature.`);
      }
      if (!entry.content?.trim()) {
        throw new Error("Archive entries cannot be empty of narrative.");
      }
    }
    private async sortMemories(memories: MemoryEntry[]): Promise<MemoryEntry[]> {
      return [...memories].sort((a, b) => {
        const parseDate = (d: string) => {
          const timestamp = Date.parse(d);
          return isNaN(timestamp) ? 0 : timestamp;
        };
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateA - dateB;
      });
    }
    async getMemories(): Promise<MemoryEntry[]> {
      const memoryMap = await this.ctx.storage.list<MemoryEntry>({ prefix: MEM_PREFIX });
      const memories = Array.from(memoryMap.values());
      const sanitized = memories.map(m => ({
        ...m,
        content: m.content || "",
        date: m.date || new Date().toISOString().split('T')[0],
        type: m.type || 'text',
      }));
      return await this.sortMemories(sanitized);
    }
    async addMemory(entry: MemoryEntry): Promise<MemoryEntry[]> {
      this.validateEntry(entry);
      await this.ctx.storage.put(MEM_PREFIX + entry.id, entry);
      return await this.getMemories();
    }
    async updateMemory(id: string, updates: Partial<Omit<MemoryEntry, "id">>): Promise<MemoryEntry[]> {
      const existing = await this.ctx.storage.get<MemoryEntry>(MEM_PREFIX + id);
      if (existing) {
        const updated = { ...existing, ...updates };
        this.validateEntry(updated);
        await this.ctx.storage.put(MEM_PREFIX + id, updated);
      }
      return await this.getMemories();
    }
    async deleteMemory(id: string): Promise<MemoryEntry[]> {
      await this.ctx.storage.delete(MEM_PREFIX + id);
      return await this.getMemories();
    }
    async getCounterValue(): Promise<number> { return 0; }
    async increment(): Promise<number> { return 0; }
    async getDemoItems(): Promise<DemoItem[]> { return []; }
    async addDemoItem(item: any) { return []; }
    async updateDemoItem(id: string, updates: any) { return []; }
    async deleteDemoItem(id: string) { return []; }
}