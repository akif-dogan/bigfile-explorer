// CORS Proxy URL'i
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// API ve Node konfigürasyonu
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://65.108.0.39:1984'  // Production'da node'a bağlan
  : 'http://65.108.0.39:1984'; // Development'ta da node'a bağlan

// Node bilgileri - Ana node'dan gelen güncel bilgiler
export const NODE_INFO = {
  name: 'BigFile Network',
  version: 1,
  release: 1,
  network: 'BigFile.V1',
  testnet: false
};

// API endpoint'leri
export const API_ENDPOINTS = {
  dashboard: '/info',
  blocks: '/blocks',
  block: (hashOrHeight: string | number) => `/block/height/${hashOrHeight}`,
  transaction: (txId: string) => `/tx/${txId}`,
  metrics: '/metrics',
  info: '/info'
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