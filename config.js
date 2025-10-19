require("dotenv").config(); // Optional: if using a .env file

const config = {
  BOT_TOKEN:
    process.env.BOT_TOKEN || "7616543161:AAE8jLCI2Ub_vuVRoj6L1fLu8Bl96KwBb9g",
  MONGO_URI:
    process.env.MONGO_URI ||
    "mongodb+srv://daxonultra:fGhF1ggBqt1semxN@cluster0.tet19g5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  OWNER_ID: Number(process.env.OWNER_ID || "6713397633"),
};

// validation
if (!config.BOT_TOKEN || !config.MONGO_URI || !config.OWNER_ID) {
  console.warn(
    "⚠️ Warning: Missing required environment variables in .env file"
  );
}

module.exports = config;
