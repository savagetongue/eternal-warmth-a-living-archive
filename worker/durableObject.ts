import { DurableObject } from "cloudflare:workers";
import type { MemoryEntry, DemoItem, MemoryType } from '../shared/types';
const INITIAL_MEMORIES: MemoryEntry[] = [
  { id: 'seed-1', date: '2023-09-02', type: 'text', content: "The day the world changed. A single glance, and I knew every chapter of my life from here on would be written with you." },
  { id: 'seed-2', date: '2023-09-15', type: 'image', content: "Our first shared coffee. The steam rose in the morning light, mirroring the quiet warmth growing between us.", mediaUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800', dominantColor: '#F9F3E5' },
  { id: 'seed-3', date: '2023-10-10', type: 'audio', content: "The way you laugh when you think no one is watching. It's the most beautiful symphony I've ever heard.", mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', dominantColor: '#FECFEF', fileName: 'Symphony_Of_You.mp3' },
  { id: 'seed-4', date: '2023-11-05', type: 'image', content: "Autumn leaves in the park. We walked for hours, talking about everything and nothing at all.", mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800', dominantColor: '#FF9A9E' },
  { id: 'seed-5', date: '2023-12-20', type: 'video', content: "A quiet moment by the window. The city moves fast, but here, time stands perfectly still for us.", mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sunlight-streaming-through-a-window-onto-a-wall-41372-large.mp4', previewUrl: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=400', dominantColor: '#A1C4FD' },
  { id: 'seed-6', date: '2024-01-01', type: 'text', content: "New Year's Eve. While everyone looked at the fireworks, I was busy looking at you, my favorite light." },
  { id: 'seed-7', date: '2024-01-14', type: 'image', content: "Winter mornings and warm blankets. You look so peaceful when you're dreaming.", mediaUrl: 'https://images.unsplash.com/photo-1520206159162-95972c79f17f?auto=format&fit=crop&q=80&w=800', dominantColor: '#E2E8F0' },
  { id: 'seed-8', date: '2024-02-14', type: 'text', content: "Our first Valentine's. No fancy dinner could ever compare to the simple joy of your company." },
  { id: 'seed-9', date: '2024-03-10', type: 'video', content: "The ocean waves at dusk. Nature's way of reminding us that some things are eternal.", mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-shore-line-at-sunset-1560-large.mp4', previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400', dominantColor: '#FF9A9E' },
  { id: 'seed-10', date: '2024-04-05', type: 'audio', content: "Gentle piano melodies for a rainy afternoon spent reading together.", mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', dominantColor: '#A1C4FD', fileName: 'Rainy_Afternoon.mp3' },
  { id: 'seed-11', date: '2024-05-20', type: 'image', content: "Spring bloom in the garden. Your smile is brighter than any flower.", mediaUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=800', dominantColor: '#FDF2F2' },
  { id: 'seed-12', date: '2024-06-15', type: 'text', content: "Just a random Tuesday, and I found myself overwhelmed by how much I love you." },
  { id: 'seed-13', date: '2024-07-04', type: 'video', content: "Summer breeze in the meadow. A fleeting moment captured forever.", mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sunlight-shining-through-tree-leaves-1191-large.mp4', previewUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400', dominantColor: '#F9F3E5' },
  { id: 'seed-14', date: '2024-08-12', type: 'image', content: "Stargazing on the balcony. The universe is vast, but you are my center.", mediaUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=800', dominantColor: '#1A202C' },
  { id: 'seed-15', date: '2024-09-02', type: 'text', content: "One year since our genesis. 365 days of learning the language of your soul." },
  { id: 'seed-16', date: '2024-10-10', type: 'audio', content: "The sound of the rain against the window, a perfect backdrop for our whispers.", mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', dominantColor: '#2D3748', fileName: 'Rain_and_Whispers.mp3' },
  { id: 'seed-17', date: '2024-11-20', type: 'image', content: "Warm tea and cold hands. You always know how to make me feel at home.", mediaUrl: 'https://images.unsplash.com/photo-1544787210-2211d24739cc?auto=format&fit=crop&q=80&w=800', dominantColor: '#FFF5F5' },
  { id: 'seed-18', date: '2024-12-25', type: 'text', content: "Christmas lights reflecting in your eyes. My favorite gift is every tomorrow with you." },
  { id: 'seed-19', date: '2025-01-05', type: 'video', content: "Morning light in the kitchen. The most mundane moments are the most sacred with you.", mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-kitchen-interior-with-morning-sunlight-42468-large.mp4', previewUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400', dominantColor: '#F9F3E5' },
  { id: 'seed-20', date: '2025-01-20', type: 'image', content: "A polaroid of us. Blurry, imperfect, and absolutely perfect.", mediaUrl: 'https://images.unsplash.com/photo-1526285849717-482456cd7336?auto=format&fit=crop&q=80&w=800', dominantColor: '#FDFBF7' },
  { id: 'seed-21', date: '2025-02-10', type: 'text', content: "Counting down the days until we see the mountains again. Every journey is better with you." },
  { id: 'seed-22', date: '2025-02-14', type: 'image', content: "Red roses and deep conversations. You are my forever Valentine.", mediaUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800', dominantColor: '#E53E3E' },
  { id: 'seed-23', date: '2025-03-01', type: 'text', content: "The way you say my name—it sounds like coming home." },
  { id: 'seed-24', date: '2025-03-15', type: 'image', content: "First sign of spring. New beginnings, same eternal love.", mediaUrl: 'https://images.unsplash.com/photo-1462273102261-38382775d77c?auto=format&fit=crop&q=80&w=800', dominantColor: '#F0FFF4' },
  { id: 'seed-25', date: '2025-03-20', type: 'text', content: "Penning this archive entry just to tell the universe how lucky I am to have you." }
];
const MEM_PREFIX = "mem:";
const INIT_KEY = "archive_initialized_v3";
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
      let memories = Array.from(memoryMap.values());
      // Auto-seeding if archive is empty or nearly empty (maintaining lived-in feel)
      if (memories.length < 5) {
        for (const entry of INITIAL_MEMORIES) {
          if (!memoryMap.has(MEM_PREFIX + entry.id)) {
            await this.ctx.storage.put(MEM_PREFIX + entry.id, entry);
          }
        }
        const refreshedMap = await this.ctx.storage.list<MemoryEntry>({ prefix: MEM_PREFIX });
        memories = Array.from(refreshedMap.values());
      }
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