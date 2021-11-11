const check = require('./check');
const _ = require('lodash');
const { wowItemName } = require('./wow');

(async (softresId) => {
  softresId = softresId.replace('https://softres.it/raid/', '');
  if (!softresId.match(/[0-9]+/)) {
    console.log('Invalid softres.it ID format');
    return;
  }

  const { softresData, members, invalidReserves } = await check(softresId);
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
