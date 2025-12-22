import { Hono } from "hono";
import { Env } from './core-utils';
import type { MemoryEntry, ApiResponse } from '@shared/types';
// Extend the Env type locally to include the R2 bucket which is expected from wrangler config
type ExtendedEnv = Env & {
  MEMORIES_BUCKET?: R2Bucket;
};
export function userRoutes(app: Hono<{ Bindings: ExtendedEnv }>) {
    app.get('/api/memories', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getMemories();
        return c.json({ success: true, data } satisfies ApiResponse<MemoryEntry[]>);
    });
    app.post('/api/memories', async (c) => {
        const body = await c.req.json() as MemoryEntry;
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.addMemory(body);
        return c.json({ success: true, data } satisfies ApiResponse<MemoryEntry[]>);
    });
    app.post('/api/memories/upload', async (c) => {
        try {
            const formData = await c.req.formData();
            const file = formData.get('file') as File | null;
            const type = formData.get('type') as string | null;
            if (!file || !type) {
                return c.json({ success: false, error: 'Missing file or type' }, 400);
            }
            // Simple validation: 100MB limit (Workers may have lower limits based on plan)
            if (file.size > 100 * 1024 * 1024) {
                return c.json({ success: false, error: 'File size exceeds 100MB limit' }, 413);
            }
            const extension = file.name.split('.').pop() || 'bin';
            const filename = `${type}/${crypto.randomUUID()}-${Date.now()}.${extension}`;
            // Check for R2 bucket binding
            if (c.env.MEMORIES_BUCKET) {
                await c.env.MEMORIES_BUCKET.put(filename, await file.arrayBuffer(), {
                    httpMetadata: { contentType: file.type }
                });
                // In a real R2 setup, you'd use a custom domain or a public bucket URL.
                // For this implementation, we construct a predictable URL pattern or return the key.
                const publicUrl = `/api/media/${filename}`; 
                return c.json({ success: true, data: { url: publicUrl, key: filename } });
            }
            // Fallback/Mock for local development without R2
            console.warn("R2 Bucket 'MEMORIES_BUCKET' not bound. Using mock response.");
            return c.json({ 
                success: true, 
                data: { 
                    url: `https://pub-mock-url.r2.dev/${filename}`, 
                    key: filename 
                } 
            });
        } catch (err) {
            console.error('Upload error:', err);
            return c.json({ success: false, error: 'Failed to upload media' }, 500);
        }
    });
    app.put('/api/memories/:id', async (c) => {
        const id = c.req.param('id');
        const updates = await c.req.json() as Partial<MemoryEntry>;
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.updateMemory(id, updates);
        return c.json({ success: true, data } satisfies ApiResponse<MemoryEntry[]>);
    });
    app.delete('/api/memories/:id', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.deleteMemory(id);
        return c.json({ success: true, data } satisfies ApiResponse<MemoryEntry[]>);
    });
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Eternal Archive API' }}));
}