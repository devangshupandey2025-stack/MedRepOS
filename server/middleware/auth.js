import { createClerkClient } from "@clerk/clerk-sdk-node"

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" })
    }

    const token = header.split(" ")[1]
    const subject = await clerkClient.verifyToken(token)

    req.clerkUserId = subject.sub
    next()
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}
