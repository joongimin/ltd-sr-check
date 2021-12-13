const fs = require('fs');
const eris = require('eris');
const updateAttendances = require('./updateAttendances');
const checkSoftres = require('./checkSoftres');
const fetchMembers = require('./fetchMembers');
const _ = require('lodash');
const { wowItemName } = require('./wow');

const rankName = (attendance) => {
  if (attendance >= 2) return 'Regular';
  if (attendance === 1) return 'Second-timer';
  return 'First-timer';
};

const instanceName = (instance) => {
  if (instance === 'aq40') return "Ahn'Qiraj";
  if (instance === 'bwl') return 'Blackwing Lair';
  if (instance === 'mc') return 'Molten Core';
  return instance;
};

const runUpdateAttendances = async () => {
  const messages = [];
  const members = await fetchMembers();
  for (const instance of ['aq40', 'bwl', 'mc']) {
    await updateAttendances(instance, members);
    messages.push(`Updated attendances for ${instanceName(instance)}`);
  }

  return messages.join('\n');
};

const runCheckSoftres = async (softresId) => {
  softresId = softresId.replace('https://softres.it/raid/', '');
  if (!softresId.match(/[0-9]+/)) return 'Send me softres.it link or ID';

  const { softresData, members, invalidReserves } = await checkSoftres(
    softresId
  );
  const { instance } = softresData;
  if (!invalidReserves.length)
    return `All reserves are valid for ${instanceName(instance)}.`;

  const messages = [];
  messages.push(`Invalid reserves for ${instanceName(instance)}:`);
  invalidReserves.forEach(({ name, items, priorityItems }) => {
    const member = members.find((m) => m.name === name);
    const attendance = member ? member[instance] : 0;
    messages.push(
      `${_.capitalize(name)}(${rankName(attendance)}) - ${items
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
      const command = msg.content.includes(' ')
        ? msg.content.split(' ')[1]
        : msg.content;

      let message = null;
      if (command === 'rank') message = await runUpdateAttendances();
      else message = await runCheckSoftres(command);

      if (message) {
        const MAX_MESSAGE_LENGTH = 2000;
        if (message.length > MAX_MESSAGE_LENGTH)
          message = message.slice(0, MAX_MESSAGE_LENGTH - 1) + '…';
        await msg.channel.createMessage(message);
      }
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
