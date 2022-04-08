const fs = require('fs');
const eris = require('eris');
const checkSoftres = require('./checkSoftres');
const _ = require('lodash');
const { wowItemName } = require('./wow');
const updateAttendances = require('./updateAttendances');
const getRank = require('./getRank');
const ordinal = require('ordinal');
const fetchMembers = require('./fetchMembers');

const instanceName = (instance) => {
  if (instance === 'aq40') return "Ahn'Qiraj";
  if (instance === 'bwl') return 'Blackwing Lair';
  if (instance === 'mc') return 'Molten Core';
  if (instance === 'naxxramas') return 'Naxxramas';
  return instance;
};

const runUpdateAttendances = async () => {
  const messages = [];
  for (const instance of ['naxxramas', 'aq40', 'bwl', 'mc']) {
    await updateAttendances(instance);
    messages.push(`Updated attendances for ${instanceName(instance)}`);
  }

  return messages.join('\n');
};

const runCheckSoftres = async (softresId) => {
  softresId = softresId.replace('https://softres.it/raid/', '');

  const {
    softresData,
    members,
    invalidReserves,
    firstReportDate,
    lastReportDate,
  } = await checkSoftres(softresId);
  const { instance } = softresData;

  const messages = [];
  if (invalidReserves.length) {
    messages.push(`Invalid reserves for ${instanceName(instance)}:`);
    invalidReserves.forEach(({ name, items, priorityItems }) => {
      const attendance = members[name] || 0;
      messages.push(
        `${_.capitalize(name)}(${getRank(attendance)}, ${ordinal(
          attendance + 1
        )} time) - ${items
          .map(
            (i) =>
              `${wowItemName(i)}${
                priorityItems.includes(i) ? '(Priority)' : ''
              }`
          )
          .join(', ')}`
      );
    });
  } else messages.push(`All reserves are valid for ${instanceName(instance)}.`);

  messages.push(
    `*\\* Analyzed using reports ${firstReportDate} - ${lastReportDate}*`
  );

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
  const botWasMentioned = msg.mentions.find(
    (mentionedUser) => mentionedUser.id === bot.user.id
  );
  const receivedDM = msg.channel.type === 1 && msg.author.bot === false;

  if (botWasMentioned || receivedDM) {
    try {
      const args = msg.content.replace(/^\<@\d+\> /, '').split(' ');

      let message = null;
      if (args[0] === 'update') message = await runUpdateAttendances();
      else if (args[0] === 'check') {
        if (args[1]) {
          try {
            message = await runCheckSoftres(args[1]);
          } catch (err) {
            message = err;
          }
        } else message = 'Usage: check <softres.it link>';
      } else if (args[0] === 'member') {
        if (args[1]) {
          try {
            const instances = ['naxxramas', 'aq40', 'bwl', 'mc'];
            const messages = [];

            const name = args[1].toLowerCase();
            const member = {};

            for (const instance of instances) {
              const { members, firstReportDate, lastReportDate } =
                await fetchMembers(instance);
              member[instance] = {
                attendance: members[name],
                firstReportDate,
                lastReportDate,
              };
            }
            messages.push(`**${_.capitalize(name)}**`);
            instances.forEach((instance) => {
              const attendance = member[instance].attendance || 0;
              messages.push(
                `${instanceName(instance)}: ${getRank(
                  attendance
                )} (attended ${attendance} times since ${
                  member[instance].firstReportDate
                })`
              );
            });

            message = messages.join('\n');
          } catch (err) {
            message = err;
          }
        } else message = 'Usage: member <name>';
      } else
        message = `Invalid command '${args[0]}'. Try using update, check or member`;

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
