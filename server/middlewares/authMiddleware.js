import { clerkClient } from '@clerk/express'

export const protectEducator = async (req, res, next)=>{
    try {
    const userId = req.auth.userId
    const response = await clerkClient.users.getUser(userId)

    if (response.publicMetadata.role !== "educator") {
        return res.status(403).json({message: "Forbidden"})
    }
    
    next()     
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"})
    }
}