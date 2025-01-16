// CORS Proxy URL'i
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// API ve Node konfigürasyonu
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://cors-anywhere.herokuapp.com/http://65.108.0.39:1984'
  : 'http://65.108.0.39:1984';  // Local geliştirme için direkt node'a bağlan

// Node bilgileri
export const NODE_INFO = {
  name: 'BigFile Network',
  version: 'v1',
  testnet: true,
  nodeUrl: 'http://65.108.0.39:1984'
};

// API endpoint'leri
export const API_ENDPOINTS = {
  dashboard: '/api/dashboard',
  blocks: '/api/blocks',
  block: (hashOrHeight: string | number) => `/api/block/${hashOrHeight}`,
  transaction: (txId: string) => `/api/tx/${txId}`,
  metrics: '/api/metrics',
  health: '/api/metrics/health'
};

// Cache ayarları
export const CACHE_CONFIG = {
  staleTime: 5000,    // 5 saniye
  cacheTime: 30000,   // 30 saniye
  refetchInterval: 10000  // 10 saniye
};

// Blok explorer ayarları
export const EXPLORER_CONFIG = {
  recentBlockCount: 15,
  maxTransactionsPerPage: 25,
  defaultRefreshRate: 10000  // 10 saniye
}; 