module.exports = async function (app, bot, UserModel, OWNER_ID, BotModel) {
  bot.onText(/\/legal|\/disclaimer/, (msg) => {
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

    bot.sendMessage(msg.chat.id, legalText, { parse_mode: "HTML" });
  });
};
