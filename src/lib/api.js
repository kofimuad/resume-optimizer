// Shared axios client. Frontend calls /api/* which netlify.toml rewrites to /.netlify/functions/*.
// In dev, vite.config.js proxies these to Netlify Dev on port 8888.

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60_000, // OpenAI calls can take ~15s, so leave headroom
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
