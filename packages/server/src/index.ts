import Fastify from 'fastify'
import cors from '@fastify/cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { redis } from './redis/client.js'
import { setUseMemoryStore } from './redis/room.js'
import { registerAllHandlers } from './socket/index.js'

const PORT = parseInt(process.env.PORT || '3001')
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

const fastify = Fastify({ logger: true })

await fastify.register(cors, { origin: CORS_ORIGIN })

fastify.get('/health', async () => ({ status: 'ok' }))

const httpServer = createServer(fastify.server)

const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] },
})

io.on('connection', (socket) => {
  console.log(`[Socket] connected: ${socket.id}`)
  registerAllHandlers(io, socket)

  socket.on('disconnect', () => {
    console.log(`[Socket] disconnected: ${socket.id}`)
  })
})

// Try Redis, fall back to in-memory store for local dev
try {
  await redis.connect()
  console.log('[Redis] connected')
} catch {
  console.warn('[Redis] unavailable — using in-memory store (dev mode)')
  setUseMemoryStore(true)
  // Disconnect to stop ioredis retry loop
  redis.disconnect()
}

await fastify.ready()
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] listening on :${PORT}`)
})
