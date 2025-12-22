import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env } from './core-utils';
import type { MemoryEntry, ApiResponse } from '../shared/types';
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
    app.get('/api/media/:type/:filename', async (c) => {
        const type = c.req.param('type');
        const filename = c.req.param('filename');
        const key = `${type}/${filename}`;
        if (!c.env.MEMORIES_BUCKET) {
            return c.json({ success: false, error: 'Storage not configured' }, 503);
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
    // Restricted upload endpoint due to environment sandbox limits
    app.post('/api/memories/upload', async (c) => {
        return c.json({ 
            success: false, 
            error: 'Direct file uploads are currently restricted due to sanctuary capacity. Please provide an external URL for permanent high-res preservation. A local visual signature will still be stored.' 
        }, 403);
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