import "dotenv/config"
import express from "express"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import { createClerkClient } from "@clerk/clerk-sdk-node"
import { connectDB } from "./config/db.js"

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
import authRoutes from "./routes/auth.js"
import doctorRoutes from "./routes/doctors.js"
import visitRoutes from "./routes/visits.js"
import dashboardRoutes from "./routes/dashboard.js"
import orderRoutes from "./routes/orders.js"
import notificationRoutes from "./routes/notifications.js"
import analyticsRoutes from "./routes/analytics.js"
import ffrRoutes from "./routes/ffr.js"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
})

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }))
app.use(express.json())

app.use("/api", authRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/visits", visitRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/ffr", ffrRoutes)

app.set("io", io)

app.get("/health", (_req, res) => res.json({ status: "ok" }))

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error("Authentication required"))

  try {
    const subject = await clerkClient.verifyToken(token)
    socket.data.clerkUserId = subject.sub
    next()
  } catch {
    next(new Error("Invalid token"))
  }
})

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id)

  socket.on("join:role", (role) => {
    socket.join(role)
  })

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 4000

async function start() {
  await connectDB()
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start()
