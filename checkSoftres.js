const fetchSoftres = require('./fetchSoftres');
const Spreadsheet = require('./Spreadsheet');
const getRank = require('./getRank');
const _ = require('lodash');

const getSheetName = (instance) => {
  switch (instance) {
    case 'naxxramas':
      return 'Naxx Attendance';
    case 'aq40':
      return 'AQ40 Attendance';
    case 'bwl':
      return 'BWL Attendance';
    case 'mc':
      return 'MC Attendance';
  }
};

const check = async (softresId) => {
  const { softresData, reserves } = await fetchSoftres(softresId);
  const instance = softresData.instance.toLowerCase();
  const attendanceSheet = await Spreadsheet.build(
    '1GbYI2yrv5hGAzSzF8Ql8vXRwtLiuhrMAFgnQU5BWzFs'
  );
  const sheetName = getSheetName(instance);
  const data = await attendanceSheet.get(sheetName);
  const table = data.values;

  const members = {};
  table.slice(1).forEach((row) => {
    const name = row[0].toLowerCase();
    const attendance = row
      .slice(1, 11)
      .filter((c) => c === 'P' || c === 'S').length;
    members[name] = attendance;
  });

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

  return { softresData, members, invalidReserves };
};

module.exports = check;
