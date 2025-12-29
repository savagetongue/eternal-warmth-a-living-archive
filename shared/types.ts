export type MemoryType = 'text' | 'image' | 'video' | 'audio';
export interface MemoryEntry {
  id: string;
  content: string;
  date: string;
  type: MemoryType;
  /** Direct URL to the hosted asset on R2 or external source */
  mediaUrl?: string;
  /** 
   * High-fidelity base64 signature or hosted thumbnail. 
   * Preferentially used as video posters and initial image loaders.
   */
  previewUrl?: string;
  /** The extracted dominant color from the media asset for layout stability */
  dominantColor?: string;
  /** The original or generated file identification */
  fileName?: string;
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