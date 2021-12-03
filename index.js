const checkRank = require('./checkRank');
const checkSoftres = require('./checkSoftres');
const _ = require('lodash');
const { wowItemName } = require('./wow');

(async (command) => {
  if (command === 'rank') {
    ['aq40', 'bwl', 'mc'].forEach(async (instance) => {
      const invalidRanks = await checkRank(instance);
      if (invalidRanks.length) {
        console.log(`Invalid ranks for ${instance}:`);
        invalidRanks.forEach(({ name, rank, attendance, validRank }) => {
          console.log(
            `${name} - attendance: ${attendance}, current-rank: ${rank}, valid-rank: ${validRank}`
          );
        });
      } else console.log(`All ranks are valid for ${instance}`);
    });

    return;
  }

  const softresId = command.replace('https://softres.it/raid/', '');
  if (!softresId.match(/[0-9]+/)) {
    console.log('Invalid softres.it ID format');
    return;
  }

  const { softresData, members, invalidReserves } = await checkSoftres(
    softresId
  );
  if (invalidReserves.length) {
    console.log(`Invalid reserves for ${softresData.instance}`);
    invalidReserves.forEach(({ name, items, priorityItems }) => {
      const member = members.find((m) => m.name === name);
      const rank = member ? member.rank : '1';
      console.log(
        `${_.capitalize(name)}(${rank}) - ${items
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
