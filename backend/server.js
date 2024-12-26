const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;
const BIGFILE_NODE = 'https://thebigfile.info:1984';

// Axios için SSL sertifika konfigürasyonu
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false // SSL sertifika doğrulamasını devre dışı bırak
  })
});

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

// Single block endpoint
app.get('/api/block/:hash', async (req, res) => {
  try {
    // Önce info endpoint'inden blok bilgilerini al
    const infoResponse = await axiosInstance.get(`${BIGFILE_NODE}/info`);
    const currentHeight = infoResponse.data.height;

    // Son 50 bloğu kontrol et
    for (let i = 0; i < 50; i++) {
      const height = currentHeight - i;
      try {
        const blockResponse = await axiosInstance.get(`${BIGFILE_NODE}/block/height/${height}`);
        const block = blockResponse.data;
        
        // Eğer bu blok aradığımız hash'e sahipse
        if (block.indep_hash === req.params.hash) {
          return res.json({
            hash: block.indep_hash,
            height: height,
            timestamp: block.timestamp,
            previous_block: block.previous_block,
            txs: block.txs || [],
            size: block.weave_size || block.block_size || 0
          });
        }
      } catch (blockError) {
        console.error(`Error checking block at height ${height}:`, blockError.message);
      }
    }

    // Blok bulunamadı
    res.status(404).json({ error: 'Block not found' });

  } catch (error) {
    console.error('Block error details:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    res.status(500).json({ 
      error: 'Error fetching block details',
      details: error.response?.data || error.message
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

// Debug fonksiyonu ekleyelim
async function debugNodeInfo() {
  try {
    const infoResponse = await axiosInstance.get(`${BIGFILE_NODE}/info`);
    const info = infoResponse.data;
    
    console.log('Raw Node Response:', {
      endpoint: `${BIGFILE_NODE}/info`,
      status: infoResponse.status,
      data: info
    });

    // Veri doğrulama ve zenginleştirme
    const enrichedInfo = {
      ...info,
      // Temel veriler - direkt node'dan
      height: info.height,
      blocks: info.blocks,
      peers: info.peers,
      network: info.network,
      
      // Hesaplanan veriler
      tx_count: info.blocks || 0,  // Her blokta en az 1 tx var
      weave_size: Math.max(
        info.weave_size || 0,
        info.blocks * 1024 * 1024  // Min 1MB/blok
      ),
      network_size: Math.max(
        info.network_size || 0,
        info.blocks * 2 * 1024 * 1024  // Min 2MB/blok
      ),
      current_diff: Math.max(
        info.current_diff || 0,
        1  // Min difficulty
      ),
      storage_cost: 0.1, // Sabit değer
    };

    // Debug için detaylı loglama
    console.log('Node Data Validation:', {
      rawHeight: info.height,
      enrichedHeight: enrichedInfo.height,
      rawPeers: info.peers,
      enrichedPeers: enrichedInfo.peers,
      rawBlocks: info.blocks,
      enrichedBlocks: enrichedInfo.blocks,
      rawWeaveSize: info.weave_size,
      enrichedWeaveSize: enrichedInfo.weave_size,
      calculations: {
        minWeaveSize: info.blocks * 1024 * 1024,
        minNetworkSize: info.blocks * 2 * 1024 * 1024
      }
    });

    return enrichedInfo;
  } catch (error) {
    console.error('Node Info Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      endpoint: `${BIGFILE_NODE}/info`
    });
    return null;
  }
}

app.get('/api/dashboard', async (req, res) => {
  try {
    const now = Date.now();
    
    if (dashboardCache.data && (now - dashboardCache.lastUpdated) < CACHE_DURATION) {
      return res.json(dashboardCache.data);
    }

    const info = await debugNodeInfo();
    if (!info) {
      throw new Error('Could not fetch node info');
    }

    // Son bloğu ve işlemleri al
    const [currentBlock, blocks] = await Promise.all([
      axiosInstance.get(`${BIGFILE_NODE}/block/height/${info.height}`),
      fetchLast24HoursBlocks(info.height)
    ]);

    // Peer sayısını doğru şekilde al
    const peerCount = info.peers || 0;

    // Transaction sayısını hesapla
    const totalTx = Math.max(
      blocks.reduce((sum, block) => sum + (block.txs?.length || 0), 0),
      info.blocks || 0 // En az blok sayısı kadar transaction vardır
    );

    // Son 15 bloğu göster
    const recentBlocks = formatRecentBlocks(blocks.slice(0, 15));

    const dashboardData = {
      current: {
        totalTransactions: totalTx,
        tps: Number(calculateCurrentTPS(blocks)),
        activeAddresses: info.peers || 1,
        storageCost: 0.1,
        weaveSize: info.blocks * 1024 * 1024, // Her blok 1MB
        networkSize: info.blocks * 2 * 1024 * 1024, // Her blok 2MB
        proofRate: info.blocks || 1, // Blok sayısı kadar proof rate
        height: info.height,
        peerCount: peerCount,
        changes: {
          transactions: { value: 1, isPositive: true },
          size: { value: 1, isPositive: true },
          peers: { value: 0, isPositive: true }
        }
      },
      trends: {
        transactions: generateTransactionTrend(blocks),
        weaveSize: generateWeaveSizeTrend(blocks, info.blocks),
        dataUploaded: generateDataUploadedTrend(blocks)
      },
      recentBlocks
    };

    console.log('Dashboard Data:', {
      height: info.height,
      blocks: info.blocks,
      peers: info.peers,
      peerCount: peerCount,
      totalTx: totalTx,
      weaveSize: dashboardData.current.weaveSize,
      networkSize: dashboardData.current.networkSize
    });

    // Debug için blok sayısını loglayalım
    console.log('Recent Blocks Count:', recentBlocks.length);

    dashboardCache = {
      data: dashboardData,
      lastUpdated: now
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

// Yardımcı fonksiyonları ekleyelim
async function fetchLast24HoursBlocks(currentHeight) {
  const blocks = [];
  const blockCount = 15; // 15 blok
  
  try {
    // Paralel olarak blokları çekelim
    const promises = Array.from({ length: blockCount }, (_, i) => {
      const height = currentHeight - i;
      if (height < 0) return null;
      return axiosInstance.get(`${BIGFILE_NODE}/block/height/${height}`);
    }).filter(Boolean);

    const responses = await Promise.all(promises);
    blocks.push(...responses.map(response => response.data));
  } catch (error) {
    console.error('Error fetching blocks:', error.message);
  }
  
  return blocks;
}

// Hızlı hesaplama fonksiyonları
function calculateFastTPS(latestBlock) {
  return (latestBlock.txs?.length || 0) / Math.max(latestBlock.block_time || 1, 1);
}

function calculateFastChanges(blocks) {
  if (blocks.length < 2) return {};
  
  const latest = blocks[0];
  const previous = blocks[1];
  
  return {
    transactions: calculatePercentageChange(
      latest.txs?.length || 0,
      previous.txs?.length || 0
    ),
    size: calculatePercentageChange(
      latest.weave_size || 0,
      previous.weave_size || 0
    ),
    peers: { value: 0, isPositive: true } // Peer değişimi için basit değer
  };
}

function generateTransactionTrend(blocks) {
  const data = blocks.map(block => ({
    timestamp: formatTimestamp(block.timestamp),
    value: block.txs?.length || 0
  }));

  return {
    data,
    total24h: data.reduce((sum, item) => sum + item.value, 0),
    eodEstimate: data[0]?.value * 24 || 0
  };
}

function formatRecentBlocks(blocks) {
  return blocks.map(block => ({
    height: block.height,
    hash: block.indep_hash,
    timestamp: block.timestamp * 1000,
    size: block.weave_size || block.block_size || 0,
    txCount: block.txs?.length || 0
  }));
}

function generateWeaveSizeTrend(blocks, totalBlocks) {
  const baseSize = totalBlocks * 1024 * 1024; // Minimum 1MB per block
  const data = blocks.map((block, index) => ({
    timestamp: formatTimestamp(block.timestamp),
    value: block.weave_size || baseSize + (index * 1024 * 1024)
  }));

  return {
    data,
    total24h: data[0]?.value || baseSize,
    eodEstimate: (data[0]?.value || baseSize) * 1.01
  };
}

function generateDataUploadedTrend(blocks) {
  const data = blocks.map(block => ({
    timestamp: formatTimestamp(block.timestamp),
    value: calculateBlockDataSize(block)
  }));

  const total24h = data.reduce((sum, item) => sum + item.value, 0);

  return {
    data,
    total24h,
    eodEstimate: total24h * (24 / blocks.length)
  };
}

function calculateBlockDataSize(block) {
  return block.txs?.reduce((sum, tx) => sum + (tx.data_size || 0), 0) || 0;
}

function formatTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function calculatePercentageChange(current, previous) {
  if (!previous) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change).toFixed(2),
    isPositive: change >= 0
  };
}

// TPS hesaplama fonksiyonunu güncelleyelim
function calculateCurrentTPS(blocks) {
  if (!blocks || blocks.length < 2) return 0.01; // minimum değer
  
  const latestBlock = blocks[0];
  const oldestBlock = blocks[blocks.length - 1];
  
  const totalTx = blocks.reduce((sum, block) => sum + (block.txs?.length || 0), 0);
  const timeSpan = Math.max(latestBlock.timestamp - oldestBlock.timestamp, 1);
  
  return Number((totalTx / timeSpan).toFixed(2)); // Number olarak dön
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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 