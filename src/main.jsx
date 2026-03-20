import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Killteacher from './Killteacher'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Killteacher />
  </StrictMode>,
)
