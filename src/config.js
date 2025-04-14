const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'config.json');

let config = null;

try {
  const data = fs.readFileSync(configFilePath, 'utf-8');
  config = JSON.parse(data);
} catch (error) {
  console.error('Error reading or parsing config.json:', error);
}

module.exports = config;
