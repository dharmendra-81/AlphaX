import { clerkClient } from '@clerk/express'

export const protectEducator = async (req, res, next) => {
    try {
        const userId = (typeof req.auth === 'function' ? req.auth() : req.auth)?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const response = await clerkClient.users.getUser(userId);

        if (response.publicMetadata?.role !== "educator") {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
}