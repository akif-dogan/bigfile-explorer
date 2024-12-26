export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'
  : 'http://localhost:3001'; 