export interface MetricValue {
  value: number;
  timestamp: number;
}

export interface NetworkMetrics {
  height: number;
  peerCount: number;
  totalSize: number;
  hashRate: number;
  lastBlockTime: number;
  networkSize: number;
  tps: number;
  transactionCount: number;
  storagePrice: number;
  proofRate: number;
  totalTransactions: number;
  averageBlockSize: number;
}

export function parsePrometheusMetrics(text: string): NetworkMetrics {
  const metrics: NetworkMetrics = {
    height: 0,
    peerCount: 0,
    totalSize: 0,
    hashRate: 0,
    lastBlockTime: 0,
    networkSize: 0,
    tps: 0,
    transactionCount: 0,
    storagePrice: 0,
    proofRate: 0,
    totalTransactions: 0,
    averageBlockSize: 0
  };

  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') continue;

    try {
      // Blok yüksekliği
      if (line.includes('arweave_height')) {
        metrics.height = extractValue(line);
      }
      // Peer sayısı
      else if (line.includes('arweave_peers')) {
        metrics.peerCount = extractValue(line);
      }
      // Toplam veri boyutu
      else if (line.includes('arweave_storage_size')) {
        metrics.totalSize = extractValue(line);
        metrics.networkSize = metrics.totalSize;
      }
      // Hash rate
      else if (line.includes('arweave_mining_rate')) {
        metrics.hashRate = extractValue(line);
      }
      // TPS
      else if (line.includes('arweave_transaction_throughput')) {
        metrics.tps = extractValue(line);
      }
      // Toplam işlem sayısı
      else if (line.includes('arweave_transaction_count')) {
        metrics.transactionCount = extractValue(line);
      }
      // Storage price
      else if (line.includes('arweave_price_per_gib')) {
        metrics.storagePrice = extractValue(line);
      }
      // Proof rate
      else if (line.includes('arweave_block_time')) {
        metrics.proofRate = 1 / Math.max(extractValue(line), 0.1); // Block time'ı proof rate'e çevir
      }
      // Son blok zamanı
      else if (line.includes('arweave_timestamp')) {
        metrics.lastBlockTime = extractValue(line) * 1000;
      }
      // Toplam işlem sayısı
      else if (line.includes('arweave_total_transactions')) {
        metrics.totalTransactions = extractValue(line);
      }
      // Ortalama blok boyutu
      else if (line.includes('arweave_average_block_size')) {
        metrics.averageBlockSize = extractValue(line);
      }
    } catch (error) {
      console.error('Error parsing metric line:', line, error);
    }
  }

  return metrics;
}

function extractValue(line: string): number {
  const match = line.match(/\s(\d+(\.\d+)?)\s*$/);
  return match ? parseFloat(match[1]) : 0;
} 