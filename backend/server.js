const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const https = require('https');
const net = require('net');

const app = express();
const PORT = process.env.PORT || 3001;
// Ana node IP'sini güncelle
const BIGFILE_NODE = 'http://65.108.0.39:1984';

// Axios instance'ı güncelle
const axiosInstance = axios.create({
  baseURL: BIGFILE_NODE,
  timeout: 10000,
  headers: {
    'Accept': 'application/json'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// Axios interceptor ekle
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('Axios error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

app.use(cors());
app.use(express.json());

// Metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    // Info endpoint'inden bilgileri al
    const infoResponse = await axiosInstance.get(`${BIGFILE_NODE}/info`);
    const info = infoResponse.data;

    // Son bloğu al
    const lastBlockResponse = await axiosInstance.get(`${BIGFILE_NODE}/block/height/${info.height}`);
    const lastBlock = lastBlockResponse.data;

    // Metrics formatında yanıt oluştur
    const metrics = `
# HELP arweave_height Current block height
# TYPE arweave_height gauge
arweave_height ${info.height || 0}

# HELP arweave_peers Number of connected peers
# TYPE arweave_peers gauge
arweave_peers ${info.peers?.length || 0}

# HELP arweave_storage_size Total storage size in bytes
# TYPE arweave_storage_size gauge
arweave_storage_size ${info.weave_size || 0}

# HELP arweave_mining_rate Network hash rate
# TYPE arweave_mining_rate gauge
arweave_mining_rate ${info.current_diff || 0}

# HELP arweave_transaction_throughput Transactions per second
# TYPE arweave_transaction_throughput gauge
arweave_transaction_throughput ${info.tx_throughput || 0}

# HELP arweave_transaction_count Total number of transactions
# TYPE arweave_transaction_count gauge
arweave_transaction_count ${info.tx_count || 0}

# HELP arweave_price_per_gib Storage price per GiB
# TYPE arweave_price_per_gib gauge
arweave_price_per_gib ${info.storage_cost || 0}

# HELP arweave_block_time Average block time in seconds
# TYPE arweave_block_time gauge
arweave_block_time ${info.block_time || 0}

# HELP arweave_timestamp Last block timestamp
# TYPE arweave_timestamp gauge
arweave_timestamp ${info.current_timestamp || Date.now() / 1000}

# HELP arweave_total_transactions Total number of transactions
# TYPE arweave_total_transactions gauge
arweave_total_transactions ${lastBlock.txs?.length || 0}

# HELP arweave_average_block_size Average block size in bytes
# TYPE arweave_average_block_size gauge
arweave_average_block_size ${info.weave_size / Math.max(info.height, 1) || 0}
`;

    res.send(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).send('Error fetching metrics');
  }
});

// Blocks endpoint - son 10 bloğu al
app.get('/api/blocks', async (req, res) => {
  try {
    // Info endpoint'inden güncel yüksekliği al
    const infoResponse = await axiosInstance.get(`${BIGFILE_NODE}/info`);
    const currentHeight = infoResponse.data.height;

    // Son 10 bloğun verilerini topla
    const blocks = [];
    for (let i = 0; i < 10; i++) {
      const height = currentHeight - i;
      if (height < 0) break;

      try {
        const blockResponse = await axiosInstance.get(`${BIGFILE_NODE}/block/height/${height}`);
        const block = blockResponse.data;
        
        if (block) {
          blocks.push({
            hash: block.indep_hash,
            height: height,
            timestamp: block.timestamp * 1000,
            size: block.weave_size || block.block_size || 0,
            txCount: (block.txs && block.txs.length) || 0
          });
        }
      } catch (blockError) {
        console.error(`Error fetching block at height ${height}:`, {
          status: blockError.response?.status,
          data: blockError.response?.data
        });
      }
    }

    res.json(blocks);
  } catch (error) {
    console.error('Blocks error:', {
      status: error.response?.status,
      data: error.response?.data
    });
    res.status(500).json({ 
      error: 'Error fetching blocks',
      details: error.response?.data || error.message
    });
  }
});

// Blok detayları endpoint'i
app.get('/api/block/:hashOrHeight', async (req, res) => {
  try {
    const { hashOrHeight } = req.params;
    
    console.log('Fetching block:', hashOrHeight); // Debug log

    // Node bilgilerini al
    const infoResponse = await axiosInstance.get(`${BIGFILE_NODE}/info`);
    const info = infoResponse.data;

    // Blok verilerini al
    let blockResponse;
    try {
      if (!isNaN(hashOrHeight)) {
        // Yükseklik ile sorgula
        blockResponse = await axiosInstance.get(`${BIGFILE_NODE}/block/height/${hashOrHeight}`);
      } else {
        // Hash ile sorgula
        blockResponse = await axiosInstance.get(`${BIGFILE_NODE}/block/hash/${hashOrHeight}`);
      }
      
      console.log('Block response:', blockResponse.data); // Debug log
    } catch (error) {
      console.error('Block fetch error:', error.response?.data || error.message);
      throw new Error('Block not found');
    }

    if (!blockResponse?.data) {
      throw new Error('Block data is empty');
    }

    const block = blockResponse.data;

    // Blok detaylarını hazırla
    const enrichedBlock = {
      hash: block.indep_hash,
      height: parseInt(block.height),
      timestamp: block.timestamp,
      previousBlock: block.previous_block,
      nextBlock: null,
      size: block.block_size || 0,
      txCount: block.txs?.length || 0,
      transactions: [],
      reward: block.reward || 0,
      miner: block.miner || 'Unknown',
      weaveSize: block.weave_size || 0,
      blockTime: block.block_time || 2.0,
      difficulty: block.diff || 0,
      nonce: block.nonce || '',
      previousBlockHash: block.previous_block || '',
      merkleRoot: block.tx_root || block.merkle_root || '',
      networkInfo: {
        version: info.version || '1.0',
        height: info.height || 0,
        blocks: info.blocks || 0,
        peers: info.peers?.length || 0,
        queueLength: info.queue_length || 0
      },
      metrics: {
        hashRate: (block.diff / (block.block_time || 2.0)) || 0,
        networkUtilization: (block.block_size / (1024 * 1024)) || 0,
        packing_density: block.txs?.length ? (block.block_size / block.txs.length) : 0
      }
    };

    // Transaction detaylarını al
    if (block.txs && Array.isArray(block.txs)) {
      enrichedBlock.transactions = await Promise.all(
        block.txs.map(async (txId) => {
          try {
            const txResponse = await axiosInstance.get(`${BIGFILE_NODE}/tx/${txId}`);
            const tx = txResponse.data;
            return {
              id: txId,
              owner: tx.owner || 'Unknown',
              recipient: tx.target || null,
              fee: tx.reward || 0,
              size: tx.data_size || 0,
              dataRoot: tx.data_root || '',
              data_type: tx.format || 'data',
              tags: tx.tags || [],
              confirmations: info.height - block.height,
              bundledIn: tx.bundled_in || null
            };
          } catch (error) {
            console.error(`Error fetching transaction ${txId}:`, error.message);
            return {
              id: txId,
              owner: 'Unknown',
              recipient: null,
              fee: 0,
              size: 0,
              dataRoot: '',
              data_type: 'unknown',
              tags: [],
              confirmations: 0
            };
          }
        })
      );
    }

    console.log('Sending block data:', {
      height: enrichedBlock.height,
      hash: enrichedBlock.hash,
      txCount: enrichedBlock.txCount
    });

    res.json(enrichedBlock);
  } catch (error) {
    console.error('Block details error:', error.message);
    res.status(404).json({
      error: 'Block not found',
      message: error.message
    });
  }
});

// Historical metrics endpoint
app.get('/api/metrics/historical', async (req, res) => {
  try {
    const now = Date.now();
    const data = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(now - (23 - i) * 3600000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      tps: 2 + Math.random(),
      size: 120 + i * 3 + Math.random() * 2,
      hashRate: 45 + Math.random() * 10
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Historical metrics error:', error);
    res.status(500).json({ error: 'Error fetching historical metrics' });
  }
});

// Transaction endpoint
app.get('/api/tx/:id', async (req, res) => {
  try {
    const response = await axiosInstance.get(`${BIGFILE_NODE}/tx/${req.params.id}`);
    const tx = response.data;

    const timestamp = tx.timestamp;

    res.json({
      id: tx.id,
      block_height: tx.block_height,
      block_hash: tx.block_indep_hash,
      data_size: tx.data_size,
      timestamp: timestamp,
      fee: tx.fee,
      data_root: tx.data_root,
      owner: tx.owner
    });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(404).json({ error: 'Transaction not found' });
  }
});

// Network growth metrics endpoint
app.get('/api/metrics/network-growth', async (req, res) => {
  try {
    const infoResponse = await axiosInstance.get(`${BIGFILE_NODE}/info`);
    const currentHeight = infoResponse.data.height;
    
    const data = [];
    const interval = 24; // Son 24 blok
    let totalSize = 0;
    
    for (let i = 0; i < interval; i++) {
      const height = currentHeight - i;
      if (height < 0) break;

      try {
        const blockResponse = await axiosInstance.get(`${BIGFILE_NODE}/block/height/${height}`);
        const block = blockResponse.data;
        
        // Her blok için toplam boyutu artır
        const blockSize = block.weave_size || block.block_size || 0;
        totalSize += blockSize;
        
        data.push({
          timestamp: new Date(block.timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          size: totalSize, // Kümülatif boyut
          txCount: block.txs?.length || 0,
          height: height
        });
      } catch (error) {
        console.error(`Error fetching block at height ${height}:`, error.message);
      }
    }

    res.json(data.reverse());
  } catch (error) {
    console.error('Network growth metrics error:', error);
    res.status(500).json({ error: 'Error fetching network growth metrics' });
  }
});

// Transaction rate metrics endpoint
app.get('/api/metrics/transaction-rate', async (req, res) => {
  try {
    const infoResponse = await axiosInstance.get(`${BIGFILE_NODE}/info`);
    const currentHeight = infoResponse.data.height;
    
    const data = [];
    const interval = 24; // Son 24 blok
    
    for (let i = 0; i < interval; i++) {
      const height = currentHeight - i;
      if (height < 0) break;

      try {
        const blockResponse = await axiosInstance.get(`${BIGFILE_NODE}/block/height/${height}`);
        const block = blockResponse.data;
        
        data.push({
          timestamp: new Date(block.timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          tps: block.txs?.length || 0,
          height: height
        });
      } catch (error) {
        console.error(`Error fetching block at height ${height}:`, error.message);
      }
    }

    // Veriyi ters çevir (en eski -> en yeni)
    res.json(data.reverse());
  } catch (error) {
    console.error('Transaction rate metrics error:', error);
    res.status(500).json({ error: 'Error fetching transaction rate metrics' });
  }
});

// Hash Rate history endpoint
app.get('/api/metrics/hash-rate', async (req, res) => {
  try {
    const infoResponse = await axiosInstance.get(`${BIGFILE_NODE}/info`);
    const currentHeight = infoResponse.data.height;
    
    const data = [];
    const interval = 24; // Son 24 blok
    
    for (let i = 0; i < interval; i++) {
      const height = currentHeight - i;
      if (height < 0) break;

      try {
        const blockResponse = await axiosInstance.get(`${BIGFILE_NODE}/block/height/${height}`);
        const block = blockResponse.data;
        
        data.push({
          timestamp: new Date(block.timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          hashRate: block.diff || 0,
          height: height
        });
      } catch (error) {
        console.error(`Error fetching block at height ${height}:`, error.message);
      }
    }

    res.json(data.reverse());
  } catch (error) {
    console.error('Hash rate metrics error:', error);
    res.status(500).json({ error: 'Error fetching hash rate metrics' });
  }
});

// Network health endpoint
app.get('/api/metrics/health', async (req, res) => {
  try {
    const metricsResponse = await axiosInstance.get(`${BIGFILE_NODE}/metrics`);
    const infoResponse = await axiosInstance.get(`${BIGFILE_NODE}/info`);
    
    // Metrics'ten gerekli verileri çıkar
    const metrics = metricsResponse.data;
    const info = infoResponse.data;
    
    res.json({
      uptime: 99.9, // Şu an için sabit değer
      blockTime: info.current_block_time || 2.1,
      peerHealth: (info.peers?.length || 0) > 5 ? 92 : 75
    });
  } catch (error) {
    console.error('Network health metrics error:', error);
    res.status(500).json({ error: 'Error fetching network health metrics' });
  }
});

// Cache mekanizması ekleyelim
let dashboardCache = {
  data: null,
  lastUpdated: 0
};

// Cache süresini düşürelim (10 saniye)
const CACHE_DURATION = 10000; // 10 saniye

// Debug fonksiyonunu güncelle
async function debugNodeInfo() {
  try {
    const infoResponse = await axiosInstance.get('/info');
    const info = infoResponse.data;
    
    console.log('Raw Node Info:', info);

    return {
      ...info,
      height: info.height || 0,
      blocks: info.blocks || 0,
      peers: info.peers || 0,
      network: info.network || 'BigFile.V1',
      queue_length: info.queue_length || 0,
      node_state_latency: info.node_state_latency || 0
    };
  } catch (error) {
    console.error('Node Info Error:', error.message);
    return null;
  }
}

// Dashboard endpoint'i
app.get('/api/dashboard', async (req, res) => {
  try {
    // Debug log ekle
    console.log('Dashboard request received');

    const info = await debugNodeInfo();
    if (!info) {
      throw new Error('Could not fetch node info');
    }

    // Debug log ekle
    console.log('Node info:', info);

    // Node'dan gelen gerçek verileri kullan
    const dashboardData = {
      current: {
        totalTransactions: info.blocks || 0,
        tps: 0.01,
        activeAddresses: info.peers || 1,
        storageCost: 0.1,
        weaveSize: info.blocks * 1024 * 1024,
        networkSize: info.blocks * 2 * 1024 * 1024,
        proofRate: info.blocks || 1,
        height: info.height,
        peerCount: info.peers,
        changes: {
          transactions: { value: 1, isPositive: true },
          size: { value: 1, isPositive: true },
          peers: { value: 0, isPositive: true }
        }
      },
      trends: {
        transactions: {
          data: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
            value: Math.floor(Math.random() * 10) + 1
          })),
          total24h: 100,
          eodEstimate: 150
        },
        weaveSize: {
          data: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
            value: (info.blocks || 1) * 1024 * 1024 * (1 + i/24)
          })),
          total24h: info.blocks * 1024 * 1024,
          eodEstimate: info.blocks * 1024 * 1024 * 1.1
        },
        dataUploaded: {
          data: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
            value: 1024 * 1024
          })),
          total24h: 24 * 1024 * 1024,
          eodEstimate: 25 * 1024 * 1024
        }
      },
      recentBlocks: await fetchRecentBlocks(info.height)
    };

    // Debug log ekle
    console.log('Sending dashboard data');

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Error fetching dashboard data',
      message: error.message 
    });
  }
});

// Son blokları getirme fonksiyonunu güncelle
async function fetchRecentBlocks(currentHeight) {
  const blocks = [];
  const blockCount = Math.min(15, currentHeight);

  for (let i = 0; i < blockCount; i++) {
    const height = currentHeight - i;
    if (height < 0) break;

    try {
      const blockResponse = await axiosInstance.get(`/block/height/${height}`);
      const block = blockResponse.data;

      if (block) {
        console.log(`Block ${height} data:`, {
          size: block.weave_size,
          txCount: block.txs?.length,
          timestamp: block.timestamp
        });

        blocks.push({
          height: height,
          hash: block.indep_hash,
          timestamp: block.timestamp * 1000,
          size: block.weave_size || block.block_size || 0,
          txCount: Array.isArray(block.txs) ? block.txs.length : 0,
          miner: block.miner || 'Unknown',
          reward: block.reward || 0
        });
      }
    } catch (error) {
      console.error(`Error fetching block at height ${height}:`, {
        error: error.message,
        response: error.response?.data
      });
    }
  }

  return blocks;
}

// Trend verilerini oluştur
function generateTrends(info) {
  const now = Date.now();
  const hourMs = 3600000;
  
  return {
    transactions: {
      data: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now - (23 - i) * hourMs).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: Math.max(1, Math.floor(Math.random() * 5)) // 1-5 arası tx
      })),
      total24h: info.blocks || 24,
      eodEstimate: (info.blocks || 24) * 1.1
    },
    weaveSize: {
      data: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now - (23 - i) * hourMs).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: (info.blocks || 1) * 1024 * 1024 * (1 + i/24)
      })),
      total24h: (info.blocks || 1) * 1024 * 1024,
      eodEstimate: (info.blocks || 1) * 1024 * 1024 * 1.1
    },
    dataUploaded: {
      data: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now - (23 - i) * hourMs).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: 1024 * 1024 // 1MB per hour
      })),
      total24h: 24 * 1024 * 1024,
      eodEstimate: 25 * 1024 * 1024
    }
  };
}

// Transaction count endpoint'i
app.get('/api/transactions/count', async (req, res) => {
  try {
    const [info, lastBlock] = await Promise.all([
      axiosInstance.get(`${BIGFILE_NODE}/info`),
      axiosInstance.get(`${BIGFILE_NODE}/block/current`)
    ]);

    const txCount = {
      total: info.data.tx_count || 0,
      lastBlock: lastBlock.data.txs?.length || 0,
      pending: info.data.tx_pending?.length || 0
    };

    console.log('Transaction Count Debug:', txCount);
    res.json(txCount);
  } catch (error) {
    console.error('Transaction count error:', error);
    res.status(500).json({ error: 'Error fetching transaction count' });
  }
});

// Boş port bul
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      findAvailablePort(startPort + 1).then(resolve, reject);
    });
  });
}

// Dinamik port ile başlat
findAvailablePort(3001).then(port => {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to find an available port:', err);
}); 