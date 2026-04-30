// Central API URL for frontend; Vite env var `VITE_API_URL` is used in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export default API_URL;
