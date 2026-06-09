require('dotenv').config();
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

// Import các module
const { antiSpam } = require('./src/middlewares/auth');

// Gắn middleware
bot.use(antiSpam);

// Import các lệnh và hành động
require('./src/handlers/commands')(bot);
require('./src/handlers/actions')(bot);

bot.launch().then(() => console.log("🚀 Bot đã chạy!"));
