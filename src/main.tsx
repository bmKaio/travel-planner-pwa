import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeDatabase } from './db'

// Initialize theme before render to avoid flash
const storedTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

// Initialize IndexedDB seed data before first render
initializeDatabase().catch((error) => {
  console.error('Database initialization failed:', error)
})

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

// El service worker se registra automáticamente mediante vite-plugin-pwa.
// No es necesario un registro manual aquí; el plugin inyecta registerSW.js
// con la ruta base correcta tanto en desarrollo como en producción.
