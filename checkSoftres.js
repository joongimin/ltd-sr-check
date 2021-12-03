const fetchSoftres = require('./fetchSoftres');
const fetchMembers = require('./fetchMembers');
const _ = require('lodash');

const check = async (softresId) => {
  const { softresData, reserves } = await fetchSoftres(softresId);
  const members = await fetchMembers(softresData.instance.toLowerCase());

  const invalidReserves = _.reject(
    reserves,
    ({ name, items, priorityItems }) => {
      const member = members.find((m) => m.name === name);
      const rank = member ? member.rank : '1';

      if (rank === '1') {
        return items.length <= 1 && priorityItems.length === 0;
      } else if (rank === '2') {
        return items.length <= 2 && priorityItems.length === 0;
      } else if (rank === '3') {
        return items.length <= 2 && priorityItems.length <= 1;
      } else {
        return false;
      }
    }
  );

  return { softresData, members, invalidReserves };
};

module.exports = check;
