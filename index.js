const updateAttendances = require('./updateAttendances');
const checkSoftres = require('./checkSoftres');
const _ = require('lodash');
const { wowItemName } = require('./wow');

(async (args) => {
  if (args[0] === 'update') {
    const instances = ['naxxramas', 'aq40', 'bwl', 'mc'];
    instances.forEach(async (instance) => {
      await updateAttendances(instance);
      console.log(`Updated attendances for '${instance}'`);
    });
    return;
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
