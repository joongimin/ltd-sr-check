const fs = require('fs');
const eris = require('eris');
const checkSoftres = require('./checkSoftres');
const _ = require('lodash');
const { wowItemName } = require('./wow');

const rankName = (rank) => {
  if (rank === '3') return 'Regular';
  if (rank === '2') return 'Second-timer';
  return 'First-timer';
};

const instanceName = (instance) => {
  if (instance === 'aq40') return "Ahn'Qiraj";
  if (instance === 'bwl') return 'Blackwing Lair';
  if (instance === 'mc') return 'Molten Core';
  return instance;
};

const runCheck = async (softresId) => {
  softresId = softresId.replace('https://softres.it/raid/', '');
  if (!softresId.match(/[0-9]+/)) return 'Send me softres.it link or ID';

  const { softresData, members, invalidReserves } = await checkSoftres(
    softresId
  );
  if (!invalidReserves.length)
    return `All reserves are valid for ${instanceName(softresData.instance)}`;

  const messages = [];
  messages.push(`Invalid reserves for ${instanceName(softresData.instance)}`);
  invalidReserves.forEach(({ name, items, priorityItems }) => {
    const member = members.find((m) => m.name === name);
    const rank = member ? member.rank : '1';
    messages.push(
      `${_.capitalize(name)}(${rankName(rank)}) - ${items
        .map(
          (i) =>
            `${wowItemName(i)}${priorityItems.includes(i) ? '(Priority)' : ''}`
        )
        .join(', ')}`
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

bot.on('messageCreate', async (msg) => {
  console.log(msg);
  const botWasMentioned = msg.mentions.find(
    (mentionedUser) => mentionedUser.id === bot.user.id
  );
  const receivedDM = msg.channel.type === 1 && msg.author.bot === false;

  if (botWasMentioned || receivedDM) {
    try {
      const softresId = msg.content.includes(' ')
        ? msg.content.split(' ')[1]
        : msg.content;
      const message = await runCheck(softresId);

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
