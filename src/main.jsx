import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { validateEnv } from './utils/env'

// 환경변수 유효성 검사
validateEnv();

createRoot(document.getElementById('root')).render(
  <App />
)
