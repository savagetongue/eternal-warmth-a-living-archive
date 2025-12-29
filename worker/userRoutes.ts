import { Hono } from "hono";
import { Env } from './core-utils';
import type { MemoryEntry, ApiResponse } from '../shared/types';
import type { R2Bucket } from '@cloudflare/workers-types';
type ExtendedEnv = Env & {
  MEMORIES_BUCKET?: R2Bucket;
};
const MAX_PREVIEW_VIDEO_SIZE = 5 * 1024 * 1024; // 5MB
export function userRoutes(app: Hono<{ Bindings: ExtendedEnv }>) {
    app.get('/api/memories', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getMemories();
        return c.json({ success: true, data } satisfies ApiResponse<MemoryEntry[]>);
    });
    app.post('/api/memories', async (c) => {
        try {
            const body = await c.req.json() as MemoryEntry;
            const size = new TextEncoder().encode(JSON.stringify(body)).length;
            if (size > 120 * 1024) {
                return c.json({ success: false, error: `Payload too large (${(size/1024).toFixed(0)}KB). Limit ~128KB/entry. Compress previews.` }, 413);
            }
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.addMemory(body);
            return c.json({ success: true, data } satisfies ApiResponse<MemoryEntry[]>);
        } catch (err: any) {
            console.error('[ADD_MEMORY_ERROR]', err);
            return c.json({ success: false, error: err.message || 'Failed to save memory' }, 500);
        }
    });
    app.get('/api/media/:type/:filename', async (c) => {
        const filename = c.req.param('filename');
        const type = c.req.param('type');
        const key = `${type}/${filename}`;
        if (!c.env.MEMORIES_BUCKET) return c.json({ success: false, error: 'Storage not configured' }, 503);
        const object = await c.env.MEMORIES_BUCKET.get(key);
        if (!object) return c.json({ success: false, error: 'Not Found' }, 404);
        const headers = new Headers();
        object.writeHttpMetadata(headers as any);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
        const rangeStr = c.req.header('Range');
        if (rangeStr?.startsWith('bytes=')) {
            const parts = rangeStr.slice(6).split('-');
            let start = parts[0] ? parseInt(parts[0], 10) : 0;
            let end = parts[1] ? parseInt(parts[1], 10) : object.size - 1;
            if (isNaN(start) && parts[1]) {
              start = object.size - parseInt(parts[1], 10);
              end = object.size - 1;
            }
            if (!isNaN(start) && start >= 0 && start < object.size) {
                end = Math.min(end, object.size - 1);
                const chunkSize = end - start + 1;
                headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
                headers.set('Content-Length', chunkSize.toString());
                headers.set('Accept-Ranges', 'bytes');
                const rangeObj = await c.env.MEMORIES_BUCKET.get(key, { range: { offset: start, length: chunkSize } });
                if (rangeObj?.body) return new Response(rangeObj.body as any, { status: 206, headers: headers as any });
            }
        }
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Content-Length', object.size.toString());
        return new Response(object.body as any, { headers: headers as any });
    });
    app.post('/api/memories/upload', async (c) => {
        try {
            const formData = await c.req.formData();
            const file = formData.get('file') as File;
            if (!file) return c.json({ success: false, error: 'No file provided' }, 400);
            const isVideo = file.type.startsWith('video/');
            const isLargeVideo = isVideo && file.size > MAX_PREVIEW_VIDEO_SIZE;
            if (isLargeVideo) {
                return c.json({ success: true, data: { status: 'sandbox', url: '' } });
            }
            if (!c.env.MEMORIES_BUCKET) {
                return c.json({ success: true, data: { status: 'sandbox', url: '' } });
            }
            const uuid = crypto.randomUUID();
            const safeName = file.name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
            const type = file.type.split('/')[0] || 'image';
            const filename = `${uuid}-${safeName}`;
            const key = `${type}/${filename}`;
            await c.env.MEMORIES_BUCKET.put(key, await file.arrayBuffer(), {
                httpMetadata: { contentType: file.type }
            });
            return c.json({ success: true, data: { url: `/api/media/${type}/${filename}` } });
        } catch (err) {
            console.error('[UPLOAD ERROR]', err);
            return c.json({ success: false, error: 'Internal upload failure' }, 500);
        }
    });
    app.put('/api/memories/:id', async (c) => {
        try {
            const id = c.req.param('id');
            const updates = await c.req.json() as Partial<MemoryEntry>;
            const size = new TextEncoder().encode(JSON.stringify(updates)).length;
            if (size > 120 * 1024) {
                return c.json({ success: false, error: `Payload too large (${(size/1024).toFixed(0)}KB). Limit ~128KB/entry. Compress previews.` }, 413);
            }
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.updateMemory(id, updates);
            return c.json({ success: true, data } satisfies ApiResponse<MemoryEntry[]>);
        } catch (err: any) {
            console.error('[UPDATE_MEMORY_ERROR]', err);
            return c.json({ success: false, error: err.message || 'Failed to update memory' }, 500);
        }
    });
    app.delete('/api/memories/:id', async (c) => {
        const id = c.req.param('id');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.deleteMemory(id);
        return c.json({ success: true, data } satisfies ApiResponse<MemoryEntry[]>);
    });
}