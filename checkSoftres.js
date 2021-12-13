const fetchSoftres = require('./fetchSoftres');
const fetchMembers = require('./fetchMembers');
const _ = require('lodash');

const check = async (softresId) => {
  const { softresData, reserves } = await fetchSoftres(softresId);
  const instance = softresData.instance.toLowerCase();
  const members = await fetchMembers();

  const invalidReserves = _.reject(
    reserves,
    ({ name, items, priorityItems }) => {
      const member = members.find((m) => m.name === name);
      const attendance = member ? member[instance] : 0;

      if (attendance === 0) {
        return items.length <= 1 && priorityItems.length === 0;
      } else if (attendance === 1) {
        return items.length <= 2 && priorityItems.length === 0;
      } else if (attendance >= 2) {
        return items.length <= 2 && priorityItems.length <= 1;
      } else {
        return false;
      }
    }
  );

  return { softresData, members, invalidReserves };
};

module.exports = check;
