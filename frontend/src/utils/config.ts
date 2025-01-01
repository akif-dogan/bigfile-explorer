export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'
  : 'http://localhost:3001';

export const NODE_INFO = {
  name: 'BigFile Network',
  version: 'v1',
  testnet: true,
  nodeUrl: 'http://213.239.206.178:1984'
}; 