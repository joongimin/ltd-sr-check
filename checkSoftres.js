const moment = require('moment-timezone');
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

moment.tz.setDefault('America/New_York');

const MAX_WEEKS = 10;

const getCutoffDate = () => {
  const date = moment().startOf('day').subtract(MAX_WEEKS, 'weeks');
  return date.subtract((date.day() + 5) % 7, 'day');
};

const getRecentRecordsCount = (instance, dates) => {
  const isConsecutive = instance === 'naxxramas';
  if (isConsecutive) return MAX_WEEKS;

  const cutOffDate = getCutoffDate();

  let records = 0;
  for (let date of dates.slice(1)) {
    const reportDate = moment(date.replaceAll('/', '-'));
    if (reportDate < cutOffDate) break;

    records += 1;
  }

  return records;
};

const check = async (softresId) => {
  const { softresData, reserves } = await fetchSoftres(softresId);
  const instance = softresData.instance.toLowerCase();
  const attendanceSheet = await Spreadsheet.build(
    '1GbYI2yrv5hGAzSzF8Ql8vXRwtLiuhrMAFgnQU5BWzFs'
  );
  const sheetName = getSheetName(instance);
  if (!sheetName) throw `Invalid instance type '${instance}'`;
  const data = await attendanceSheet.get(sheetName);
  const table = data.values;

  const recentRecordsCount = getRecentRecordsCount(instance, table[0]);
  const firstReportDate = moment(
    table[0][recentRecordsCount].replaceAll('/', '-')
  ).format('l');

  const lastReportDate = moment(table[0][1].replaceAll('/', '-')).format('l');

  const members = {};
  table.slice(1).forEach((row) => {
    const name = row[0].toLowerCase();
    const attendance = row
      .slice(1, 1 + recentRecordsCount)
      .filter((c) => c === 'P' || c === 'S' || c === 'B').length;
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

  return {
    softresData,
    members,
    invalidReserves,
    firstReportDate,
    lastReportDate,
  };
};

module.exports = check;
