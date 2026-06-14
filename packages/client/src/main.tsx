import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { connectSocket } from './store/socketStore.js'
import Landing from './pages/Landing.js'
import Create from './pages/Create.js'
import Join from './pages/Join.js'
import Lobby from './pages/Lobby.js'
import Game from './pages/Game.js'

connectSocket()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#09090c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 420, height: '100dvh', maxHeight: 780, background: '#09090c', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<Create />} />
            <Route path="/join" element={<Join />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>
)
