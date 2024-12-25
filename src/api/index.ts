const BASE_URL = 'http://thebigfile.info:1984';

export interface Block {
  hash: string;
  height: number;
  timestamp: number;
  size: number;
  txCount: number;
  miner: string;
}

export const api = {
  async getMetrics(): Promise<string> {
    const response = await fetch(`${BASE_URL}/metrics`);
    return response.text();
  },

  async getBlocks(limit = 20): Promise<Block[]> {
    const response = await fetch(`${BASE_URL}/blocks?limit=${limit}`);
    return response.json();
  },

  async getBlock(hash: string): Promise<Block> {
    const response = await fetch(`${BASE_URL}/block/${hash}`);
    return response.json();
  },

  async getTransaction(txId: string) {
    const response = await fetch(`${BASE_URL}/tx/${txId}`);
    return response.json();
  }
}; 