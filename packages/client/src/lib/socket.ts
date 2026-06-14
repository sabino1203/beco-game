import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    const sessionToken = localStorage.getItem('beco_session_token')
    cb({ sessionToken })
  },
})
