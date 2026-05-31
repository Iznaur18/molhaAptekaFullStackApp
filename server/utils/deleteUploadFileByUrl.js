import fs from 'fs/promises';
import path from 'path';

import { UPLOADS_DIR } from './uploadsDir.js';

const UPLOAD_PATH_RE = /\/uploads\/([^?#/]+)/i;

/**
 * @param {string | null | undefined} mediaUrl
 */
export async function deleteUploadFileByUrl(mediaUrl) {
    const match = String(mediaUrl ?? '').match(UPLOAD_PATH_RE);
    if (!match?.[1]) {
        return;
    }

    const filePath = path.join(UPLOADS_DIR, match[1]);
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            console.error('deleteUploadFileByUrl error:', error);
        }
    }
}
