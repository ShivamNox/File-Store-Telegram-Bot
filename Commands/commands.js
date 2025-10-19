module.exports = function (app, bot, UserModel, OWNER_ID, BotModel) {
  require("./settings")(app, bot, UserModel, OWNER_ID, BotModel);
  require("./disclaimer")(app, bot, UserModel, OWNER_ID, BotModel);
};
