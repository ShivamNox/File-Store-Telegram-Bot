module.exports = function ( app, bot, UserModel, OWNER_ID, BotModel, botUsername, START_IMAGE_URL, FileModel, BatchModel ) {
  require("./settings")(app, bot, UserModel, OWNER_ID, BotModel);
  require("./disclaimer")(app, bot, UserModel, OWNER_ID, BotModel);
  require("./start")( app, bot, UserModel, OWNER_ID, BotModel, botUsername, START_IMAGE_URL, FileModel, BatchModel );
};
