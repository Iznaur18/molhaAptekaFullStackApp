import { UserModel } from '../../models/index.js';
import {
    clearAuthCookie,
    clearRefreshCookie,
    getRefreshTokenFromRequest,
    setAuthCookie,
    setRefreshCookie,
} from '../../utils/authCookie.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/authTokens.js';

export const refreshAuthController = async (req, res) => {
    try {
        const refreshToken = getRefreshTokenFromRequest(req);
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token required' });
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch {
            clearAuthCookie(res);
            clearRefreshCookie(res);
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const user = await UserModel.findById(decoded._id);
        if (!user) {
            clearAuthCookie(res);
            clearRefreshCookie(res);
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const userId = user._id.toString();
        setAuthCookie(res, signAccessToken(userId));
        setRefreshCookie(res, signRefreshToken(userId));

        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('refreshAuthController error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
