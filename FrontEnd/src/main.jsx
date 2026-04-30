import { StrictMode } from 'react'
import "./App.css"
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { SettingsProvider } from './components/SettingContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)
