const moment = require('moment-timezone');
const fetchSoftres = require('./fetchSoftres');
const fetchMembers = require('./fetchMembers');
const getRank = require('./getRank');
const _ = require('lodash');

moment.tz.setDefault('America/New_York');

const check = async (softresId) => {
  const { softresData, reserves } = await fetchSoftres(softresId);
  const instance = softresData.instance.toLowerCase();
  const { members, firstReportDate, lastReportDate } = await fetchMembers(
    instance
  );

  const invalidReserves = _.reject(
    reserves,
    ({ name, items, priorityItems }) => {
      const attendance = members[name] || 0;
      const rank = getRank(attendance);

      if (rank === 'Regular Raider') {
        return items.length <= 2;
      } else if (rank === 'Intermediate Raider') {
        return items.length <= 2 && priorityItems.length === 0;
      } else {
        return items.length <= 1 && priorityItems.length === 0;
      }
    }
  );

  return {
    softresData,
    members,
    invalidReserves,
    firstReportDate,
    lastReportDate,
  };
};

module.exports = check;
