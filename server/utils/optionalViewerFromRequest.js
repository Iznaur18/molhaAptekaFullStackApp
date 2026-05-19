import jwt from 'jsonwebtoken';

import { UserModel } from '../models/index.js';

/**
 * @param {import('express').Request} req
 * @returns {Promise<{ _id: string; userRole: string; isBlockedUser?: boolean } | null>}
 */
export async function getOptionalViewerFromRequest(req) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || !process.env.JWT_SECRET) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const viewer = await UserModel.findById(decoded._id)
            .select('userRole isBlockedUser')
            .lean();
        if (!viewer) return null;
        return {
            _id: String(viewer._id),
            userRole: viewer.userRole,
            isBlockedUser: Boolean(viewer.isBlockedUser),
        };
    } catch {
        return null;
    }
}
