const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const axios = require('axios');

const app = express();
const router = express.Router();

// Mevcut server.js kodunu buraya taşı
// Ancak app.listen() kısmını kaldır

// Serverless handler
module.exports.handler = serverless(app); 