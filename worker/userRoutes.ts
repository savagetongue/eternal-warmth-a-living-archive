import { Hono } from "hono";
import { Env } from './core-utils';
import type { MemoryEntry, ApiResponse } from '../shared/types';
import type { R2Bucket } from '@cloudflare/workers-types';

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
    
    app.post('/api/memories/upload', async (c) => {
        const formData = await c.req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return c.json({ success: false, error: 'No file provided' }, 400);
        }

        if (file.size === 0) {
            return c.json({ success: false, error: 'File is empty' }, 400);
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            return c.json({ success: false, error: 'File too large (max 10MB)' }, 413);
        }

        const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
        const uuid = crypto.randomUUID();
        const filename = `${uuid}.${extension}`;
        const type = 'media';
        const key = `${type}/${filename}`;

        let uploadUrl = '';
        let uploadKey = '';

        if (c.env.MEMORIES_BUCKET) {
            try {
                await c.env.MEMORIES_BUCKET.put(key, await file.arrayBuffer(), {
                    httpMetadata: { contentType: file.type }
                });
                uploadKey = key;
                uploadUrl = `/api/media/${type}/${filename}`;
            } catch (err) {
                console.error('Upload error:', err);
            }
        }

        return c.json({ success: true, data: { url: uploadUrl, key: uploadKey } });
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
//