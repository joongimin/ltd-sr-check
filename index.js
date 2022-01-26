const updateAttendances = require('./updateAttendances');
const checkSoftres = require('./checkSoftres');
const fetchMembers = require('./fetchMembers');
const _ = require('lodash');
const { wowItemName } = require('./wow');

(async (command) => {
  if (command === 'attendance') {
    const instances = ['naxxramas', 'aq40', 'bwl', 'mc'];
    instances.forEach(async (instance) => {
      await updateAttendances(instance);
    });
    return;
  }

  const softresId = command.replace('https://softres.it/raid/', '');

  const { softresData, members, invalidReserves } = await checkSoftres(
    softresId
  );
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
})(process.argv[2]);

// const fetchAttendances = require('./fetchAttendances');

// (async () => {
//   const attendances = await fetchAttendances('aq40');
//   console.log(attendances);
// })();

// const fetchMembers = require('./fetchMembers');

// (async () => {
//   const attendance = await fetchMembers('aq40');
//   console.log(attendance);
// })();
