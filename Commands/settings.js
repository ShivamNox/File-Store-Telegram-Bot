module.exports = async function (app, bot, UserModel, OWNER_ID, BotModel) {
  const botData = await BotModel.findOne();

  bot.onText(/\/settings/, async (msg) => {
    const chatId = msg.chat.id;
    if (chatId != OWNER_ID) return;

    if (botData.autodel === "disable") {
      bot.sendMessage(chatId, "Your Bot Settings", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Enable Auto Delete", callback_data: "enable_auto_del" }],
          ],
        },
      });
    } else if (botData.autodel === "enable") {
      bot.sendMessage(chatId, "Your Bot Settings", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Disable Auto Delete",
                callback_data: "disable_auto_del",
              },
            ],
          ],
        },
      });
    }
  });

  // sq - settings query - for handle settings callbacks
  bot.on("callback_query", async (sq) => {
    if (sq.data === "enable_auto_del") {
      try {
        botData.autodel = "enable";
        await botData.save();
        // Optional: Send a confirmation message
        bot.answerCallbackQuery(sq.id, { text: "Auto-delete enabled." });
      } catch (err) {
        console.error("Failed to update botData:", err);
        bot.answerCallbackQuery(sq.id, { text: "Update failed." });
      }
    } else if (sq.data === "disable_auto_del") {
      try {
        botData.autodel = "disable";
        await botData.save();
        // Optional: Send a confirmation message
        bot.answerCallbackQuery(sq.id, { text: "Auto-delete Disabled." });
      } catch (err) {
        console.error("Failed to update botData:", err);
        bot.answerCallbackQuery(sq.id, { text: "Update failed." });
      }
    }
  });
};
