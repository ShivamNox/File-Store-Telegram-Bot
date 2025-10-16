require('dotenv').config(); // Optional: if using a .env file

const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  MONGO_URI: process.env.MONGO_URI || '',
  OWNER_ID: process.env.OWNER_ID || ''
};

module.exports = config;
