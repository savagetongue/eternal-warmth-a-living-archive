import { Hono } from "hono";
import { Env } from './core-utils';
import type { MemoryEntry, ApiResponse } from '@shared/types';
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
    // Serve media from R2 bucket
    app.get('/api/media/:type/:filename', async (c) => {
        const type = c.req.param('type');
        const filename = c.req.param('filename');
        const key = `${type}/${filename}`;
        if (!c.env.MEMORIES_BUCKET) {
            return c.json({ success: false, error: 'Storage not configured' }, 500);
        }
        const object = await c.env.MEMORIES_BUCKET.get(key);
        if (!object) {
            return c.json({ success: false, error: 'Not Found' }, 404);
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000');
        return new Response(object.body, { headers });
    });
    app.post('/api/memories/upload', async (c) => {
        try {
            const formData = await c.req.formData();
            const file = formData.get('file') as File | null;
            const type = formData.get('type') as string | null;
            if (!file || !type) {
                return c.json({ success: false, error: 'Missing file or type' }, 400);
            }
            if (file.size > 100 * 1024 * 1024) {
                return c.json({ success: false, error: 'File size exceeds 100MB limit' }, 413);
            }
            const extension = file.name.split('.').pop() || 'bin';
            const filename = `${crypto.randomUUID()}-${Date.now()}.${extension}`;
            const key = `${type}/${filename}`;
            if (c.env.MEMORIES_BUCKET) {
                await c.env.MEMORIES_BUCKET.put(key, await file.arrayBuffer(), {
                    httpMetadata: { contentType: file.type }
                });
                // Return a consistent relative URL that the GET /api/media route handles
                const publicUrl = `/api/media/${key}`;
                return c.json({ success: true, data: { url: publicUrl, key } });
            }
            return c.json({ 
                success: false, 
                error: 'R2 Bucket not bound. Media upload unavailable.' 
            }, 503);
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
}