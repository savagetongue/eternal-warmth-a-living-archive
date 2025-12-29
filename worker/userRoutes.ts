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
    app.delete('/api/memories/clear', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.clearMemories();
        return c.json({ success: true, data } satisfies ApiResponse<MemoryEntry[]>);
    });
    app.get('/api/media/:type/:filename', async (c) => {
        const filename = c.req.param('filename');
        const type = c.req.param('type');
        const key = `${type}/${filename}`;
        if (!c.env.MEMORIES_BUCKET) {
            return c.json({ success: false, error: 'Storage not configured' }, 503);
        }
        const object = await c.env.MEMORIES_BUCKET.get(key);
        if (!object) {
            return c.json({ success: false, error: 'Not Found' }, 404);
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers as any);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
        headers.set('Access-Control-Expose-Headers', 'ETag, Content-Length, Content-Range, Accept-Ranges');
        const rangeStr = c.req.header('Range');
        if (rangeStr?.startsWith('bytes=')) {
            const parts = rangeStr.slice(6).split('-');
            let start = parseInt(parts[0], 10);
            let end = parts[1] ? parseInt(parts[1], 10) : object.size - 1;
            // Handle suffix-byte-range-spec (e.g. bytes=-500)
            if (isNaN(start) && !isNaN(end)) {
                start = object.size - end;
                end = object.size - 1;
            }
            if (!isNaN(start) && start < object.size) {
                end = Math.min(end, object.size - 1);
                const chunkSize = end - start + 1;
                headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
                headers.set('Content-Length', chunkSize.toString());
                headers.set('Accept-Ranges', 'bytes');
                const rangeObj = await c.env.MEMORIES_BUCKET.get(key, {
                  range: { offset: start, length: chunkSize }
                });
                if (rangeObj && rangeObj.body) {
                    return new Response(rangeObj.body as any, {
                        status: 206,
                        headers: headers as any
                    });
                }
            }
        }
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Content-Length', object.size.toString());
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeMap: Record<string, string> = {
            'mp4': 'video/mp4',
            'mp3': 'audio/mpeg',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif'
        };
        if (ext && mimeMap[ext]) {
            headers.set('Content-Type', mimeMap[ext]);
        }
        return new Response(object.body as any, {
            headers: headers as any
        });
    });
    app.post('/api/memories/upload', async (c) => {
        try {
            const formData = await c.req.formData();
            const file = formData.get('file') as File;
            if (!file) {
                return c.json({ success: false, error: 'No file provided' }, 400);
            }
            const uuid = crypto.randomUUID();
            const safeName = file.name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
            const filename = `${uuid}-${safeName}`;
            const isVideo = file.type.startsWith('video/');
            const isAudio = file.type.startsWith('audio/');
            const type = isVideo ? 'video' : isAudio ? 'audio' : 'image';
            const key = `${type}/${filename}`;
            let uploadUrl = '';
            if (c.env.MEMORIES_BUCKET) {
                await c.env.MEMORIES_BUCKET.put(key, await file.arrayBuffer(), {
                    httpMetadata: { contentType: file.type }
                });
                uploadUrl = `/api/media/${type}/${filename}`;
            } else {
                if (isVideo) uploadUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                else if (isAudio) uploadUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                else uploadUrl = 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800';
            }
            return c.json({ success: true, data: { url: uploadUrl } });
        } catch (err) {
            console.error('[UPLOAD ERROR]', err);
            return c.json({ success: false, error: 'Internal upload failure' }, 500);
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