export type MemoryType = 'text' | 'image' | 'video' | 'audio';
export interface MemoryEntry {
  id: string;
  content: string;
  date: string;
  type: MemoryType;
  mediaUrl?: string;
  previewUrl?: string;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface DemoItem {
  id: string;
  name: string;
  value: number;
}