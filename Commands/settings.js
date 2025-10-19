module.exports = function (app, bot, UserModel, OWNER_ID) {
  bot.onText(/\/settings/, async (msg) => {
    const chatId = msg.chat.id;
    if (chatId != OWNER_ID) return;
    bot.sendMessage(chatId, "Hello");
  });
};
