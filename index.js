const check = require('./check');

(async (softresId) => {
  softresId = softresId.replace('https://softres.it/raid/', '');
  if (!softresId.match(/[0-9]+/)) {
    console.log('Invalid softres.it ID format');
    return;
  }

  const { softresData, members, invalidReserves } = await check(softresId);
  if (invalidReserves.length) {
    console.log(`Invalid reserves for ${softresData.instance}`);
    invalidReserves.forEach(({ name, total, priority }) => {
      const member = members.find((m) => m.name === name);
      const rank = member ? member.rank : '1';
      console.log(
        `${name} - total: ${total}, priority: ${priority}, rank: ${rank}`
      );
    });
  } else console.log(`Everything is valid for ${softresData.instance}`);
})(process.argv[2]);
