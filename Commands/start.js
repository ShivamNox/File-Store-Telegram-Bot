module.exports = function ( app, bot, UserModel, OWNER_ID, BotModel, botUsername, START_IMAGE_URL, FileModel, BatchModel ) {
  // Enhanced /start command with greeting, info, and buttons
  bot.onText(/\/start(.*)/, async (msg, match) => {
    const telegramId = msg.from.id;
    const firstName = msg.from.first_name;

    const botData = await BotModel.findOne();

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

          bot.sendMessage(msg.chat.id, "successfully Sent all Files of Batch.");

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
      await bot.sendPhoto(msg.chat.id, START_IMAGE_URL, {
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
      // Edit the message to show the About message along with the new image
      bot.editMessageMedia(
        {
          type: "photo",
          media: START_IMAGE_URL,
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
      // Edit the message to show the About message along with the new image
      bot.editMessageMedia(
        {
          type: "photo",
          media: START_IMAGE_URL,
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
      // Edit the message to show the About message along with the new image
      bot.editMessageMedia(
        {
          type: "photo",
          media: START_IMAGE_URL,
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
      // Edit the message to show the About message along with the new image
      bot.editMessageMedia(
        {
          type: "photo",
          media: START_IMAGE_URL,
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
      // Revert back to the original greeting image and message
      bot.editMessageMedia(
        {
          type: "photo",
          media: START_IMAGE_URL, // The same image as the original one
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
};
