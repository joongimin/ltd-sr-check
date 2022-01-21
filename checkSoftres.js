const fetchSoftres = require('./fetchSoftres');
const Spreadsheet = require('./Spreadsheet');
const _ = require('lodash');

const getSheetName = (instance) => {
  switch (instance) {
    case 'naxx':
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
