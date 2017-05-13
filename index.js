const Telegraf = require('telegraf');
const { Extra, Markup } = require('telegraf');
const CronJob = require('cron').CronJob;
const low = require('lowdb');
const is = require('is');

const db = low('db.json');
const app = new Telegraf(process.env.BOT_TOKEN);

new CronJob('00 8 * * *', function() {

  const messages = db.get('messages')
    .map('message')
    .value();

  const users = db.get('users')
    .map('id')
    .value();

  users.forEach((user, key) => {
    app.telegram.sendMessage(user, messages[Math.floor(Math.random() * messages.length)])
  });

}, null, true, 'Europe/Kiev');


app.command('start', (ctx) => {
  const { id } = ctx.message.from;

  ctx.reply('В мєне є купа передбачень для тебе.', 
    Markup.inlineKeyboard([
      Markup.callbackButton('Хочу отримувати передбачення', 'on'),
    ]).extra()
  );
});

app.action('on', (ctx) => {
  const { id } = ctx.update.callback_query.from;

  if(
    is.empty(
      db.get('users').find({ id: id }).value())
    ) {
      db.get('users')
        .push({ id: id })
        .write()
  }

  return ctx.answerCallbackQuery('Дякуємо :)')
})

app.startPolling()