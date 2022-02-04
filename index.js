const updateAttendances = require('./updateAttendances');
const checkSoftres = require('./checkSoftres');
const fetchMembers = require('./fetchMembers');
const _ = require('lodash');
const { wowItemName } = require('./wow');
const getRank = require('./getRank');
const ordinal = require('ordinal');

const instanceName = (instance) => {
  if (instance === 'aq40') return "Ahn'Qiraj";
  if (instance === 'bwl') return 'Blackwing Lair';
  if (instance === 'mc') return 'Molten Core';
  if (instance === 'naxxramas') return 'Naxxramas';
  return instance;
};

const instances = ['naxxramas', 'aq40', 'bwl', 'mc'];

(async (args) => {
  if (args[0] === 'update') {
    instances.forEach(async (instance) => {
      await updateAttendances(instance);
      console.log(`Updated attendances for '${instance}'`);
    });
    return;
  }

  if (args[0] === 'member') {
    const name = args[1].toLowerCase();
    const member = {};

    for (const instance of instances) {
      const { members, firstReportDate, lastReportDate } = await fetchMembers(
        instance
      );
      member[instance] = {
        attendance: members[name],
        firstReportDate,
        lastReportDate,
      };
    }
    console.log(_.capitalize(args[1]));
    instances.forEach((instance) => {
      const attendance = member[instance].attendance || 0;
      console.log(
        `${instanceName(instance)}: ${getRank(attendance)}, ${ordinal(
          attendance + 1
        )} time (${member[instance].firstReportDate} - ${
          member[instance].lastReportDate
        })`
      );
    });
  }

  if (args[0] === 'check') {
    const softresId = args[1].replace('https://softres.it/raid/', '');

    try {
      const {
        softresData,
        members,
        invalidReserves,
        firstReportDate,
        lastReportDate,
      } = await checkSoftres(softresId);
      if (invalidReserves.length) {
        const { instance } = softresData;
        console.log(`Invalid reserves for ${instance}`);
        invalidReserves.forEach(({ name, items, priorityItems }) => {
          const attendance = members[name] || 0;
          console.log(
            `${_.capitalize(name)}(${attendance}) - ${items
              .map(
                (i) =>
                  `${wowItemName(i)}${
                    priorityItems.includes(i) ? '(Priority)' : ''
                  }`
              )
              .join(', ')}`
          );
        });
      } else console.log(`Everything is valid for ${softresData.instance}`);
      console.log(
        `* Analyzed using reports ${firstReportDate} - ${lastReportDate}`
      );
    } catch (err) {
      console.log(err);
    }
  }
})(process.argv.slice(2));
