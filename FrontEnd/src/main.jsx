import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { SettingsProvider } from './components/SettingContext.jsx';

const LOCAL_API_BASE_URL = "http://localhost:8080";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || LOCAL_API_BASE_URL).replace(/\/$/, "");
const nativeFetch = window.fetch.bind(window);

window.fetch = (input, init) => {
  if (typeof input === "string" && input.startsWith(LOCAL_API_BASE_URL)) {
    return nativeFetch(`${API_BASE_URL}${input.slice(LOCAL_API_BASE_URL.length)}`, init);
  }
  return nativeFetch(input, init);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)
