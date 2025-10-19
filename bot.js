const TelegramBot = require("node-telegram-bot-api");
const crypto = require("crypto");
const mongoose = require("mongoose");
const express = require("express");
const { BOT_TOKEN, MONGO_URI, OWNER_ID } = require("./config");
// MongoDB connection setup

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schema for users
const userSchema = new mongoose.Schema({
  telegramId: { type: Number, unique: true },
  firstName: String,
  username: String,
  status: { type: String, default: "active" },
  lastInteraction: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", userSchema);

// bot data schame
const botSchema = new mongoose.Schema({
  autodel: { type: String, default: "disable" },
});

const BotModel = mongoose.model("BotModel", botSchema);

// Schema for batch and single files
const fileSchema = new mongoose.Schema({
  uniqueId: String,
  fileId: String,
  type: String,
  fileName: String,
  caption: String,
  createdBy: Number,
});

const batchSchema = new mongoose.Schema({
  batchId: String,
  files: [fileSchema],
  createdBy: Number,
});

const FileModel = mongoose.model("File", fileSchema);
const BatchModel = mongoose.model("Batch", batchSchema);

// Bot setup
const app = express();
// const BOT_TOKEN = '7616543161:AAE8jLCI2Ub_vuVRoj6L1fLu8Bl96KwBb9g';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
// const OWNER_ID = 6713397633;

let isBatchActive = false;
let batchFiles = [];
let currentBatchId = null;

// Variable to temporarily store broadcast message
let broadcastMessage = null;
let broadcastType = null;

// Helper function to check if the user is the owner
const isOwner = (userId) => userId === OWNER_ID;
// Get bot information asynchronously
bot
  .getMe()
  .then((botInfo) => {
    // Now we have the botInfo object
    const botUsername = botInfo.username;

    bot.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "help", description: "Show help information" },
      { command: "about", description: "About this bot" },
      { command: "legal", description: "Legal disclaimer & usage terms" },
      { command: "batch", description: "Start a batch upload" },
      { command: "finishbatch", description: "Finish current batch" },
      { command: "users", description: "Show all users (owner only)" },
      { command: "broadcast", description: "Broadcast message (owner only)" },
      { command: "settings", description: "Bot Settings (owner only)" },
    ]);

    // Middleware to track users
    bot.on("message", async (msg) => {
      if (msg.from) {
        const { id: telegramId, first_name: firstName, username } = msg.from;
        const user = await UserModel.findOne({ telegramId });

        if (!user) {
          // If the user is not found, create a new user record
          await new UserModel({ telegramId, firstName, username }).save();
        } else {
          // If the user exists, update the last interaction timestamp and status
          user.lastInteraction = Date.now();
          user.status = "active";
          await user.save();
        }
      }
    });

    // Function to delete the message from user's chat after a specified timeout
    /*    const deleteMessageAfterTimeout = async (chatId, messageId, timeout) => {
      setTimeout(async () => {
        try {
          await bot.telegram.deleteMessage(chatId, messageId);
          console.log(
            `Message with ID ${messageId} deleted from chat ${chatId}.`
          );
        } catch (error) {
          console.error(
            `Failed to delete message with ID ${messageId}:`,
            error
          );
        }
      }, timeout);
    }; */

    // Command to start a batch
    bot.onText(/\/batch/, (msg) => {
      const chatId = msg.from.id;

      // Check if the user is the owner
      if (!isOwner(chatId)) {
        bot.sendMessage(chatId, "Only the owner can start a batch.");
        return;
      }

      // Start a new batch
      isBatchActive = true;
      currentBatchId = crypto.randomBytes(8).toString("hex");
      batchFiles = [];

      // Inform the user that the batch has started
      bot.sendMessage(chatId, "Batch started! Send files for the batch.");
    });

    // Handle document uploads
    bot.on("document", async (msg) => {
      const file = {
        fileId: msg.document.file_id,
        type: "document",
        fileName: msg.document.file_name || "File",
        caption: msg.caption || "",
      };

      if (isBatchActive && isOwner(msg.from.id)) {
        batchFiles.push(file);
        bot.sendMessage(
          msg.chat.id,
          "File added to the batch.\n\nSend next file or click /finishbatch for End and Get batch link"
        );
      } else if (!isBatchActive && isOwner(msg.from.id)) {
        const uniqueId = crypto.randomBytes(8).toString("hex");
        const singleFile = new FileModel({
          uniqueId,
          ...file,
          createdBy: msg.from.id,
        });

        await singleFile.save();
        const shareLink = `https://t.me/Hjstreambot?start=${uniqueId}`;
        bot.sendMessage(
          msg.chat.id,
          `File saved! Shareable link: ${shareLink}`
        );
      }
    });

    // Handle document uploads
    bot.on("photo", async (msg) => {
      const photoSizes = msg.photo;
      const largestPhoto = photoSizes[photoSizes.length - 1]; // choose highest resolution photo

      const file = {
        fileId: largestPhoto.file_id,
        type: "photo",
        fileName: "Photo",
        caption: msg.caption || "",
      };

      if (isBatchActive && isOwner(msg.from.id)) {
        batchFiles.push(file);
        bot.sendMessage(
          msg.chat.id,
          "Photo added to the batch.\n\nSend next file or click /finishbatch for End and Get batch link."
        );
      } else if (!isBatchActive && isOwner(msg.from.id)) {
        const uniqueId = crypto.randomBytes(8).toString("hex");
        const singleFile = new FileModel({
          uniqueId,
          ...file,
          createdBy: msg.from.id,
        });

        await singleFile.save();
        const shareLink = `https://t.me/Hjstreambot?start=${uniqueId}`;
        bot.sendMessage(
          msg.chat.id,
          `File saved! Shareable link: ${shareLink}`
        );
      }
    });

    // Handle video uploads
    bot.on("video", async (msg) => {
      const file = {
        fileId: msg.video.file_id,
        type: "video",
        fileName: msg.video.file_name || "Video",
        caption: msg.caption || "",
      };

      if (isBatchActive && isOwner(msg.from.id)) {
        batchFiles.push(file);
        bot.sendMessage(
          msg.chat.id,
          "Video added to the batch.\n\nSend next file or click /finishbatch for End and Get batch link"
        );
      } else if (!isBatchActive && isOwner(msg.from.id)) {
        const uniqueId = crypto.randomBytes(8).toString("hex");
        const singleFile = new FileModel({
          uniqueId,
          ...file,
          createdBy: msg.from.id,
        });

        await singleFile.save();
        const shareLink = `https://t.me/Hjstreambot?start=${uniqueId}`;
        bot.sendMessage(
          msg.chat.id,
          `Video saved! Shareable link: ${shareLink}`
        );
      }
    });

    // Handle audio uploads
    bot.on("audio", async (msg) => {
      const file = {
        fileId: msg.audio.file_id,
        type: "audio",
        fileName: msg.audio.file_name || "Audio",
        caption: msg.caption || "",
      };

      if (isBatchActive && isOwner(msg.from.id)) {
        batchFiles.push(file);
        bot.sendMessage(
          msg.chat.id,
          "Audio added to the batch.\n\nSend next file or click /finishbatch for End and Get batch link."
        );
      } else if (!isBatchActive && isOwner(msg.from.id)) {
        const uniqueId = crypto.randomBytes(8).toString("hex");
        const singleFile = new FileModel({
          uniqueId,
          ...file,
          createdBy: msg.from.id,
        });

        await singleFile.save();
        const shareLink = `https://t.me/Hjstreambot?start=${uniqueId}`;
        bot.sendMessage(
          msg.chat.id,
          `Audio saved! Shareable link: ${shareLink}`
        );
      }
    });

    // Command to finish the batch
    bot.onText(/\/finishbatch/, async (msg) => {
      const telegramId = msg.from.id;

      // Check if the user is the owner
      if (!isOwner(telegramId)) {
        bot.sendMessage(msg.chat.id, "Only the owner can finish the batch.");
        return;
      }

      // Check if the batch is active and has files
      if (isBatchActive && batchFiles.length > 0) {
        // Save the batch data to the database
        const batchData = new BatchModel({
          batchId: currentBatchId,
          files: batchFiles,
          createdBy: telegramId,
        });
        await batchData.save();

        // Generate the shareable link
        const shareLink = `https://t.me/${botUsername}?start=${currentBatchId}`;
        bot.sendMessage(
          msg.chat.id,
          `Batch saved successfully! Shareable link: ${shareLink}`
        );

        // Reset batch-related variables
        isBatchActive = false;
        batchFiles = [];
        currentBatchId = null;
      } else {
        bot.sendMessage(
          msg.chat.id,
          "No active batch or no files have been added."
        );
      }
    });

    // Enhanced /start command with greeting, info, and buttons
    bot.onText(/\/start(.*)/, async (msg, match) => {
      const telegramId = msg.from.id;
      const firstName = msg.from.first_name;

      const botData = await BotModel.findOne();
      console.log(botData.autodel);

      const imageUrl =
        "https://cdn.glitch.global/c29b4992-f073-4c7d-979d-df62eb5b6770/start_image?v=1741520402342";

      const payload = match[1].trim(); // Extracting any start payload (remove any surrounding spaces)

      if (payload) {
        // If there's a payload, try to fetch file or batch data
        const fileData =
          (await FileModel.findOne({ uniqueId: payload })) ||
          (await BatchModel.findOne({ batchId: payload }));

        if (fileData) {
          if (fileData.fileId) {
            if (fileData.type === "photo") {
              const sentMessage = await bot.sendPhoto(
                msg.chat.id,
                fileData.fileId,
                {
                  caption: fileData.caption || fileData.fileName,
                }
              );
              return;
            }
            // Send a single file
            const sentMessage = await bot.sendDocument(
              msg.chat.id,
              fileData.fileId,
              {
                caption: fileData.caption || fileData.fileName,
              }
            );

            if (botData.autodel === "disable") return;

            // Send a message about deletion and set a timeout to delete the message
            bot.sendMessage(
              msg.chat.id,
              "🚨 Note: \n\nThis media message will be deleted after 10 minutes. Please save or forward it to your personal saved messages to avoid losing it!"
            );

            setTimeout(() => {
              bot
                .deleteMessage(msg.chat.id, sentMessage.message_id)
                .catch((err) => {
                  console.error("Failed to delete message:", err);
                });
            }, 600000); // 10 minutes
          } else if (fileData.files) {
            const sentMessages = [];

            for (const file of fileData.files) {
              const sentMsg = await bot.sendDocument(msg.chat.id, file.fileId, {
                caption: file.caption || file.fileName,
              });
              sentMessages.push(sentMsg.message_id);
              // Wait 1.5 seconds before sending the next file, except after the last one
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            bot.sendMessage(
              msg.chat.id,
              "successfully Sent all Files of Batch."
            );

            if (botData.autodel !== "disable") {
              bot.sendMessage(
                msg.chat.id,
                "🚨 Note: \n\nThese media messages will be deleted after 10 minutes. Please save or forward them to your personal saved messages to avoid losing them!"
              );

              // Delete all messages after 10 minutes
              setTimeout(() => {
                sentMessages.forEach((messageId) => {
                  bot.deleteMessage(msg.chat.id, messageId).catch((err) => {
                    console.error("Failed to delete message:", err);
                  });
                });
              }, 600000); // 10 minutes
            }
          }
        } else {
          bot.sendMessage(msg.chat.id, "Invalid or expired link.");
        }
      } else {
        // If no payload, send the welcome message with inline buttons
        await bot.sendPhoto(msg.chat.id, imageUrl, {
          caption: `Hello, ${firstName}! 👋\n\nWelcome to the bot. Here you can upload files or create batches of files to share later.\n\nChoose an option below:`,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Help", callback_data: "help" },
                { text: "About", callback_data: "about" },
              ],
              [
                { text: "Developer Info", callback_data: "OwnerInfo" },
                { text: "Legal Disclaimer", callback_data: "legal" },
              ],
              [{ text: "Update Channel", url: "https://t.me/hivabyte" }],
            ],
          },
        });
      }
    });

    const OwnerInfo = `
<b>🌟 Oᴡɴᴇʀ Dᴇᴛᴀɪʟs 🌟</b>

<b>🧑‍💻 Nᴀᴍᴇ:</b> Shivam Kumar

<b>📱 Tɢ Uѕᴇʀɴᴀᴍᴇ:</b> <b>@ShivamNox</b> 

<b>🌐 Pᴏʀtғᴏʟɪᴏ:</b> <b><a href="https://shivamnox.github.io">shivamnox.github.io</a></b> 

<b>✨ Cᴏɴnᴇᴄᴛ tᴏ mᴏʀᴇ cʀᴇᴀᴛɪvᴇ jᴏᴜʀɴᴇʏ✨</b> 
`;
    const help = `
<b>> Help Menu</b>

I am a permanent file store bot. you can store files from your public channel without i am admin in there.
    
<b>> Available Commands:</b>
~ /start - check i am alive.
~ /batch - To store multiple files in a single link.
~ /finishbatch - To stop the batch.
~ /users - To View the all Users.
~ /broadcast - Broadcast a messages to users.
`;
    const aboutMessage = `
<blockquote><b>🎥 Mʏ Nᴀᴍᴇ: <a href='https://t.me/${botUsername}'>File-Store-Bot</a></b></blockquote>
<blockquote><b>👨‍💻 Cʀᴇᴀᴛᴏʀ: <a href='https://t.me/ShivamNox'>@ShivamNox</a></b></blockquote>
<blockquote><b>📚 Lɪʙʀᴀʀʏ: <a href='https://t.me/shivamnox0'>Node</a></b></blockquote>
<blockquote><b>💻 Lᴀɴɢᴜᴀɢᴇ: <a href='https://t.me/shivamnox0'>NodeJS</a></b></blockquote>
<blockquote><b>🗄️ Dᴀᴛᴀʙᴀsᴇ: <a href='https://mongodb.com'>MongoDB</a></b></blockquote>
<blockquote><b>💾 Bᴏᴛ Sᴇʀᴠᴇʀ: <a href='https://shivamnox.github.io'>Hivabytes</a></b></blockquote>
<blockquote><b>🔧 Bᴜɪʟᴅ Sᴛᴀᴛᴜs: <a href='https://hivabytes'>3.6.7</a></b></blockquote>
`;

    const legalText = `
<b>📜 Legal Disclaimer</b>

This bot is created solely for <b>educational</b> and <b>personal file storage</b> purposes.

📁 You may use this bot to:
- Store and retrieve your own documents, videos, or media files.
- Share educational content with others using secure file links.

🚫 <b>Prohibited Uses:</b>
- Uploading or sharing copyrighted, illegal, or harmful content.
- Using the bot for piracy, harassment, or spreading misinformation.

🛡️ By using this bot, you agree to take full responsibility for the content you upload. The developer is not liable for any misuse.

👨‍💻 Developer: @ShivamNox
🔗 Channel: https://t.me/shivamnox0

Use responsibly and ethically. ✨
`;

    // Handle callback query for Developer Info
    bot.on("callback_query", (query) => {
      const firstName = query.from.first_name;
      const messageId = query.message.message_id;
      const chatId = query.message.chat.id;
      // Check if the callback data is 'developer_info'
      if (query.data === "OwnerInfo") {
        // New image URL for the "About" message
        const imageUrl =
          "https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg"; // Image for About

        // Edit the message to show the About message along with the new image
        bot.editMessageMedia(
          {
            type: "photo",
            media: imageUrl,
            caption: OwnerInfo, // The updated caption with the About information
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [[{ text: "⬅️ Bᴀᴄᴋ", callback_data: "back" }]],
            },
          }
        );
      }
      if (query.data === "help") {
        // New image URL for the "About" message
        const imageUrl =
          "https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg"; // Image for About

        // Edit the message to show the About message along with the new image
        bot.editMessageMedia(
          {
            type: "photo",
            media: imageUrl,
            caption: help, // The updated caption with the About information
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [[{ text: "⬅️ Bᴀᴄᴋ", callback_data: "back" }]],
            },
          }
        );
      }
      if (query.data === "about") {
        // New image URL for the "About" message
        const imageUrl =
          "https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg"; // Image for About

        // Edit the message to show the About message along with the new image
        bot.editMessageMedia(
          {
            type: "photo",
            media: imageUrl,
            caption: aboutMessage, // The updated caption with the About information
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [[{ text: "⬅️ Bᴀᴄᴋ", callback_data: "back" }]],
            },
          }
        );
      }
      if (query.data === "legal") {
        // New image URL for the "About" message
        const imageUrl =
          "https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg"; // Image for About

        // Edit the message to show the About message along with the new image
        bot.editMessageMedia(
          {
            type: "photo",
            media: imageUrl,
            caption: legalText, // The updated caption with the About information
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [[{ text: "⬅️ Bᴀᴄᴋ", callback_data: "back" }]],
            },
          }
        );
      }

      if (query.data === "back") {
        const imageUrl =
          "https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg"; // Image for About

        // Revert back to the original greeting image and message
        bot.editMessageMedia(
          {
            type: "photo",
            media: imageUrl, // The same image as the original one
            caption: `Hello, ${firstName}! 👋\n\nWelcome to the bot. Here you can upload files or create batches of files to share later.\n\nChoose an option below:`, // The original greeting caption
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "Help", callback_data: "help" },
                  { text: "About", callback_data: "about" },
                ],
                [
                  { text: "Developer Info", callback_data: "OwnerInfo" },
                  { text: "Legal Disclaimer", callback_data: "legal" },
                ],
                [{ text: "Update Channel", url: "https://t.me/hivabyte" }],
              ],
            },
          }
        );
      }
    });

    // Command to show users data
    bot.onText(/\/users/, async (msg) => {
      const telegramId = msg.from.id;

      // Check if the user is the owner
      if (!isOwner(telegramId)) {
        return bot.sendMessage(
          msg.chat.id,
          "Only the owner can use this command."
        );
      }

      // Fetch all users from the database
      const users = await UserModel.find();
      let activeUsers = 0;
      let blockedUsers = 0;
      let deletedUsers = 0;

      // Check each user's status
      for (const user of users) {
        try {
          const chat = await bot.getChat(user.telegramId);
          if (chat && chat.id) {
            activeUsers++;
          }
        } catch (error) {
          if (error.response && error.response.error_code === 400) {
            deletedUsers++;
            user.status = "deleted";
            await user.save();
          } else if (error.response && error.response.error_code === 403) {
            blockedUsers++;
            user.status = "blocked";
            await user.save();
          }
        }
      }

      const totalUsers = users.length;

      // Send a summary of users
      bot.sendMessage(
        msg.chat.id,
        `👥 Total Users: ${totalUsers}\n✅ Active Users: ${activeUsers}\n🚫 Blocked Users: ${blockedUsers}\n❌ Deleted Accounts: ${deletedUsers}`
      );
    });

    // Handle broadcast command
    bot.onText(/\/broadcast/, async (msg) => {
      const telegramId = msg.from.id;

      // Check if the user is the owner
      if (!isOwner(telegramId)) {
        return bot.sendMessage(
          msg.chat.id,
          "Only the owner can use this command."
        );
      }

      // Check if the command is a reply to a message
      if (!msg.reply_to_message) {
        return bot.sendMessage(
          msg.chat.id,
          "Please reply to a message you want to broadcast."
        );
      }

      const originalMessage = msg.reply_to_message;

      bot.sendMessage(msg.chat.id, "📢 Broadcast started! Sending messages...");

      // Fetch all users from the database
      const users = await UserModel.find();
      let sentCount = 0;
      let failedCount = 0;

      // Forward the message to each user
      for (const user of users) {
        try {
          await bot.forwardMessage(
            user.telegramId,
            msg.chat.id,
            originalMessage.message_id
          );
          sentCount++;
        } catch (err) {
          failedCount++;
        }
      }

      // Summary of the broadcast
      bot.sendMessage(
        msg.chat.id,
        `✅ Broadcast complete!\nSent to: ${sentCount} users\n❌ Failed: ${failedCount} users.`
      );
    });

    require("./Commands/commands.js")(app, bot, UserModel, OWNER_ID, BotModel);
    // Express server for webhook or other purposes
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });

    console.log(`Bot username: @${botUsername}`);

    // You can now use botUsername for generating links or other purposes
  })
  .catch((error) => {
    console.error("Error fetching bot info:", error);
  });
