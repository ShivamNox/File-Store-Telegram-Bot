require("dotenv").config(); // Optional: if using a .env file

const config = {
  BOT_TOKEN:
    process.env.BOT_TOKEN || " ",
  MONGO_URI:
    process.env.MONGO_URI ||
    " ",
  OWNER_ID: Number(process.env.OWNER_ID || " "),
};

// validation
if (!config.BOT_TOKEN || !config.MONGO_URI || !config.OWNER_ID) {
  console.warn(
    "⚠️ Warning: Missing required environment variables in .env file"
  );
}

module.exports = config;
