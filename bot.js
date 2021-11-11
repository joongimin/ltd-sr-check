const fs = require('fs');
const eris = require('eris');
const check = require('./check');
const _ = require('lodash');

const rankName = (rank) => {
  if (rank === '3') return 'Regular';
  if (rank === '2') return 'Second-timer';
  return 'First-timer';
};

const runCheck = async (softresId) => {
  softresId = softresId.replace('https://softres.it/raid/', '');
  if (!softresId.match(/[0-9]+/)) return 'Send me softres.it link or ID';

  const { softresData, members, invalidReserves } = await check(softresId);
  if (!invalidReserves.length)
    return `All reserves are valid for ${softresData.instance}`;

  const messages = [];
  messages.push(`Invalid reserves for ${softresData.instance}`);
  invalidReserves.forEach(({ name, total, priority }) => {
    const member = members.find((m) => m.name === name);
    const rank = member ? member.rank : '1';
    messages.push(
      `${_.capitalize(name)}(${rankName(
        rank
      )}) - total: ${total}, priority: ${priority}`
    );
  });
  return messages.join('\n');
};

// Create a Client instance with our bot token.
const botToken = fs.readFileSync('secret/discord-bot-token', {
  encoding: 'utf8',
});
const bot = new eris.Client(botToken);

// When the bot is connected and ready, log to console.
bot.on('ready', () => {
  console.log('Connected and ready.');
});

// Every time a message is sent anywhere the bot is present,
// this event will fire and we will check if the bot was mentioned.
// If it was, the bot will attempt to respond with "Present".
bot.on('messageCreate', async (msg) => {
  const botWasMentioned = msg.mentions.find(
    (mentionedUser) => mentionedUser.id === bot.user.id
  );

  if (botWasMentioned) {
    try {
      const tokens = msg.content.split(' ');
      const message = await runCheck(tokens[1]);

      await msg.channel.createMessage(message);
    } catch (err) {
      // There are various reasons why sending a message may fail.
      // The API might time out or choke and return a 5xx status,
      // or the bot may not have permission to send the
      // message (403 status).
      console.warn('Failed to respond to mention.');
      console.warn(err);
    }
  }
});

bot.on('error', (err) => {
  console.warn(err);
});

bot.connect();
