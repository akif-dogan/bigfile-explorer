// API ve Node konfigürasyonu
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.thebigfile.info'
  : 'http://localhost:3001';

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